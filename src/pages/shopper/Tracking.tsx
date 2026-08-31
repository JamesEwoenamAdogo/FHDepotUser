import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { io, Socket } from "socket.io-client";
import { User, CheckCircle2, Truck, MapPin } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  SOCKET_URL,
  GEOAPIFY_KEY,
  resolveOrderId,
  fetchLastKnownLocation,
} from "@/Config/tracking";

type TrackingOrder = {
  id?: string;
  _id?: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  eta?: string;
  itemCount?: number;
  distance?: string;
  status?: string;
  date?: string;
  driverName?: string;
  driverPlate?: string;
  destination?: { lat: number; lng: number };
  startLocation?: { lat: number; lng: number };
  location?: { lat: number; lon: number; lng?: number };
};

const DEFAULT_ORDER: TrackingOrder = {
  id: "1",
  orderNumber: "ORD-8832",
  customerName: "Kwame Mensah",
  customerPhone: "+233 24 123 4567",
  address: "123 Mango Street, East Legon, Accra",
  eta: "45 mins",
  itemCount: 45,
  distance: "12 km",
  status: "In Transit",
  date: new Date().toISOString(),
  destination: { lat: 5.632, lng: -0.148 },
  startLocation: { lat: 5.556, lng: -0.196 },
};

export const ShopperTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderFromState = location.state?.order as TrackingOrder | undefined;

  const [activeTrackingOrder] = useState<TrackingOrder>(
    orderFromState || DEFAULT_ORDER,
  );
  const trackingOrderId = resolveOrderId(activeTrackingOrder);

  const defaultStart = { lat: 5.556, lng: -0.196 };
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    activeTrackingOrder.startLocation
      ? {
          lat: activeTrackingOrder.startLocation.lat,
          lng: activeTrackingOrder.startLocation.lng,
        }
      : defaultStart,
  );
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const lastRouteFetch = useRef<number>(0);

  useEffect(() => {
    if (!orderFromState) {
      navigate("/shopper-portal");
    }
  }, [orderFromState, navigate]);

  const updateRouteAndEta = useCallback(
    async (currentLat: number, currentLng: number) => {
      const destLat =
        activeTrackingOrder?.location?.lat ??
        activeTrackingOrder?.destination?.lat;
      const destLng =
        activeTrackingOrder?.location?.lon ??
        activeTrackingOrder?.location?.lng ??
        activeTrackingOrder?.destination?.lng;
      if (destLat == null || destLng == null) return;

      const now = Date.now();
      if (now - lastRouteFetch.current < 15000) return;
      lastRouteFetch.current = now;

      try {
        const url = `https://api.geoapify.com/v1/routing?waypoints=${currentLat},${currentLng}|${destLat},${destLng}&mode=drive&apiKey=${GEOAPIFY_KEY}`;

        const res = await axios.get(url);
        const data = res.data;

        if (data?.features?.length > 0) {
          const props = data.features[0].properties;
          const source = mapInstance.current?.getSource("route") as
            maplibregl.GeoJSONSource | undefined;
          source?.setData(data.features[0].geometry);
        }
      } catch (err) {
        console.error("Failed to fetch route", err);
      }
    },
    [activeTrackingOrder.destination],
  );

  const joinTrackingRoom = useCallback(() => {
    if (!trackingOrderId || !socketRef.current?.connected) return;
    socketRef.current.emit("user:join", { orderId: trackingOrderId });
  }, [trackingOrderId]);

  const applyDriverLocation = useCallback(
    (lat: number, lng: number) => {
      setDriverLocation({ lat, lng });
      updateRouteAndEta(lat, lng);
    },
    [updateRouteAndEta],
  );

  useEffect(() => {
    if (!trackingOrderId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      joinTrackingRoom();
    });

    socket.on("order:location", (data: { lat: number; lng: number }) => {
      applyDriverLocation(data.lat, data.lng);
    });

    void fetchLastKnownLocation(trackingOrderId).then((last) => {
      if (last) applyDriverLocation(last.lat, last.lng);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [trackingOrderId, joinTrackingRoom, applyDriverLocation]);

  useEffect(() => {
    if (!mapContainer || mapInstance.current) return;

    const myAPIKey = GEOAPIFY_KEY;
    const destLon =
      activeTrackingOrder?.location?.lon ??
      activeTrackingOrder?.location?.lng ??
      activeTrackingOrder?.destination?.lng ??
      0;
    const destLat =
      activeTrackingOrder?.location?.lat ??
      activeTrackingOrder?.destination?.lat ??
      0;
    const startLng = activeTrackingOrder?.startLocation?.lng ?? -0.196;
    const startLat = activeTrackingOrder?.startLocation?.lat ?? 5.556;

    const bounds = new maplibregl.LngLatBounds()
      .extend([startLng, startLat])
      .extend([destLon, destLat]);

    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${myAPIKey}`,
      bounds,
      fitBoundsOptions: { padding: 80 },
    });

    map.addControl(new maplibregl.NavigationControl());

    map.on("load", () => {
      const scale = 2;

      map
        .loadImage(
          `https://api.geoapify.com/v2/icon/?icon=truck&scaleFactor=${scale}&color=%23F28C28&size=45&type=awesome&apiKey=${myAPIKey}`,
        )
        .then((response: any) => {
          const image =
            "data" in response
              ? response.data
              : "image" in response
                ? response.image
                : response;
          if (image) {
            map.addImage("truck-pin", image, { pixelRatio: scale });

            map.addSource("delivery-point", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: { name: "Driver" },
                    geometry: {
                      type: "Point",
                      coordinates: [startLng, startLat],
                    },
                  },
                ],
              },
            });

            map.addLayer({
              id: "delivery-layer",
              type: "symbol",
              source: "delivery-point",
              layout: {
                "icon-image": "truck-pin",
                "icon-anchor": "bottom",
                "icon-offset": [0, 5],
                "icon-allow-overlap": true,
              },
            });
          }
        })
        .catch((err) => console.error("Image load error:", err));

      map
        .loadImage(
          `https://api.geoapify.com/v2/icon/?icon=map-marker-alt&scaleFactor=${scale}&color=%23123A63&size=45&type=awesome&apiKey=${myAPIKey}`,
        )
        .then((response: any) => {
          const image =
            "data" in response
              ? response.data
              : "image" in response
                ? response.image
                : response;
          if (image) {
            map.addImage("dest-pin", image, { pixelRatio: scale });

            map.addSource("destination-point", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: { name: "Destination" },
                    geometry: {
                      type: "Point",
                      coordinates: [destLon, destLat],
                    },
                  },
                ],
              },
            });

            map.addLayer({
              id: "destination-layer",
              type: "symbol",
              source: "destination-point",
              layout: {
                "icon-image": "dest-pin",
                "icon-anchor": "bottom",
                "icon-offset": [0, 5],
                "icon-allow-overlap": true,
              },
            });

            map.on("click", "destination-layer", (e) => {
              if (e.features?.[0]?.geometry.type === "Point") {
                const coordinates = (
                  e.features[0].geometry as any
                ).coordinates.slice() as [number, number];
                new maplibregl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(
                    `<strong>Destination</strong><br/>${activeTrackingOrder.address}`,
                  )
                  .addTo(map);
              }
            });

            map.on("mouseenter", "destination-layer", () => {
              map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "destination-layer", () => {
              map.getCanvas().style.cursor = "";
            });
          }
        })
        .catch((err) => console.error("Image load error:", err));

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [startLng, startLat],
              [destLon, destLat],
            ],
          },
        },
      });

      map.addLayer({
        id: "route-layer",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#123A63",
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
      });

      setTimeout(() => {
        updateRouteAndEta(startLat, startLng);
      }, 500);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [mapContainer, activeTrackingOrder, updateRouteAndEta]);

  useEffect(() => {
    if (!mapInstance.current || !driverLocation) return;

    const map = mapInstance.current;

    const updateSources = () => {
      const source = map.getSource("delivery-point") as
        maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Driver" },
              geometry: {
                type: "Point",
                coordinates: [driverLocation.lng, driverLocation.lat],
              },
            },
          ],
        });

        map.easeTo({
          center: [driverLocation.lng, driverLocation.lat],
          duration: 800,
          essential: true,
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateSources();
    } else {
      map.once("load", updateSources);
    }
  }, [driverLocation]);

  if (!trackingOrderId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500 mb-4">
          Invalid order — no tracking ID found.
        </p>
        <Button onClick={() => navigate("/shopper-portal")}>
          Back to Portal
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl font-bold text-fh-navy">Live GPS Tracking</h2>
          <p className="text-gray-500 mt-1">
            Order #{activeTrackingOrder.orderNumber || trackingOrderId}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          {activeTrackingOrder.status}
        </div>
      </div>

      <div className="relative h-80 w-full mb-12 rounded-xl overflow-hidden shadow-inner border border-gray-200">
        <div ref={setMapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};
