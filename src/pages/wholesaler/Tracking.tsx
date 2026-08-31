import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  SOCKET_URL,
  GEOAPIFY_KEY,
  resolveOrderId,
  fetchLastKnownLocation,
  collectOrderIds,
  parseGpsCoords,
  payloadOrderIds,
} from "@/Config/tracking";

type TrackingOrder = {
  id?: string;
  _id?: string;
  orderId?: string;
  odooOrderId?: string;
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
  driverId?: string;
  destination?: { lat: number; lng: number };
  startLocation?: { lat: number; lng: number };
  location?: { lat: number; lon: number; lng?: number };
  localOrder?: { _id?: string; id?: string };
  raw?: {
    id?: string;
    _id?: string;
    odooOrderId?: string;
    localOrder?: { _id?: string; id?: string };
  };
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

function createTruckEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 44px; height: 44px;
    background: #F28C28;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 14px rgba(242,140,40,0.5);
    border: 3px solid #fff;
  `;
  el.innerHTML = "🚚";
  return el;
}

export const WholesalerTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderFromState = location.state?.order as TrackingOrder | undefined;

  const [activeTrackingOrder] = useState<TrackingOrder>(
    orderFromState || DEFAULT_ORDER,
  );

  const candidateIds = useMemo(
    () => collectOrderIds(activeTrackingOrder as Record<string, unknown>),
    [activeTrackingOrder],
  );
  const trackingOrderId =
    resolveOrderId(activeTrackingOrder) || candidateIds[0] || null;

  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const driverLocRef = useRef(driverLocation);
  useEffect(() => {
    driverLocRef.current = driverLocation;
  }, [driverLocation]);

  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastRouteFetch = useRef<number>(0);

  useEffect(() => {
    if (!orderFromState) {
      navigate("/wholesale-portal");
    }
  }, [orderFromState, navigate]);

  const destLat =
    activeTrackingOrder?.location?.lat ??
    activeTrackingOrder?.destination?.lat ??
    5.632;
  const destLng =
    activeTrackingOrder?.location?.lon ??
    activeTrackingOrder?.location?.lng ??
    activeTrackingOrder?.destination?.lng ??
    -0.148;

  const updateRouteAndEta = useCallback(
    async (currentLat: number, currentLng: number) => {
      if (destLat == null || destLng == null) return;

      const now = Date.now();
      if (now - lastRouteFetch.current < 15000) return;
      lastRouteFetch.current = now;

      try {
        const url = `https://api.geoapify.com/v1/routing?waypoints=${currentLat},${currentLng}|${destLat},${destLng}&mode=drive&apiKey=${GEOAPIFY_KEY}`;
        const res = await axios.get(url);
        const data = res.data;
        if (data?.features?.length > 0) {
          const source = mapInstance.current?.getSource("route") as
            maplibregl.GeoJSONSource | undefined;
          source?.setData(data.features[0].geometry);
        }
      } catch (err) {
        console.error("Failed to fetch route", err);
      }
    },
    [destLat, destLng],
  );

  const joinTrackingRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const ids =
      candidateIds.length > 0
        ? candidateIds
        : trackingOrderId
          ? [trackingOrderId]
          : [];
    for (const orderId of ids) {
      socket.emit("user:join", { orderId });
    }
    if (activeTrackingOrder.driverId) {
      socket.emit("user:join", { driverId: activeTrackingOrder.driverId });
    }
  }, [candidateIds, trackingOrderId, activeTrackingOrder.driverId]);

  const payloadMatchesOrder = useCallback(
    (data: Record<string, unknown>) => {
      const incomingIds = payloadOrderIds(data);
      const incomingDriver = data.driverId ?? data.driver_id;
      if (
        incomingDriver != null &&
        activeTrackingOrder.driverId &&
        String(incomingDriver) === String(activeTrackingOrder.driverId)
      ) {
        return true;
      }
      // Unscoped broadcast — this screen is already scoped to one order.
      if (incomingIds.length === 0) return true;
      return incomingIds.some((id: string) => candidateIds.includes(id));
    },
    [candidateIds, activeTrackingOrder.driverId],
  );

  const applyDriverLocation = useCallback(
    (lat: number, lng: number) => {
      const prev = driverLocRef.current;
      if (prev && Math.abs(prev.lat - lat) < 0.00001 && Math.abs(prev.lng - lng) < 0.00001) {
        return;
      }
      driverLocRef.current = { lat, lng };
      setDriverLocation({ lat, lng });
      markerRef.current?.setLngLat([lng, lat]);
      if (mapInstance.current) {
        mapInstance.current.easeTo({
          center: [lng, lat],
          zoom: Math.max(mapInstance.current.getZoom(), 15),
          duration: 400,
          essential: true,
        });
      }
      void updateRouteAndEta(lat, lng);
    },
    [updateRouteAndEta],
  );

  const applyRef = useRef(applyDriverLocation);
  const matchRef = useRef(payloadMatchesOrder);
  const joinRef = useRef(joinTrackingRoom);
  const candidateIdsRef = useRef(candidateIds);
  applyRef.current = applyDriverLocation;
  matchRef.current = payloadMatchesOrder;
  joinRef.current = joinTrackingRoom;
  candidateIdsRef.current = candidateIds;

  useEffect(() => {
    if (!trackingOrderId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    const onLocation = (raw: Record<string, unknown>) => {
      const coords = parseGpsCoords(raw);
      if (!coords) return;
      if (!matchRef.current(raw)) return;
      applyRef.current(coords.lat, coords.lng);
    };

    socket.on("connect", () => {
      joinRef.current();
    });
    if (socket.connected) joinRef.current();

    socket.on("order:location", onLocation);
    socket.on("driver:location", onLocation);

    const pullLastKnown = async () => {
      const ids = candidateIdsRef.current.length > 0 ? candidateIdsRef.current : [trackingOrderId];
      for (const id of ids) {
        const last = await fetchLastKnownLocation(id);
        if (last) {
          applyRef.current(last.lat, last.lng);
          return;
        }
      }
    };

    void pullLastKnown();
    const poll = window.setInterval(() => {
      void pullLastKnown();
    }, 2000);

    return () => {
      window.clearInterval(poll);
      socket.off("order:location", onLocation);
      socket.off("driver:location", onLocation);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [trackingOrderId]);

  useEffect(() => {
    if (!mapContainer || mapInstance.current) return;

    const startLng = activeTrackingOrder?.startLocation?.lng ?? destLng ?? -0.196;
    const startLat = activeTrackingOrder?.startLocation?.lat ?? destLat ?? 5.556;
    const current = driverLocRef.current || { lat: startLat, lng: startLng };

    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${GEOAPIFY_KEY}`,
      center: [current.lng, current.lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl());

    const destEl = document.createElement("div");
    destEl.style.cssText = `
      width: 38px; height: 38px;
      background: #123A63;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      border: 2px solid #fff;
    `;
    destEl.innerHTML = "📍";

    new maplibregl.Marker({ element: destEl })
      .setLngLat([destLng, destLat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<strong>Destination</strong><br/>${activeTrackingOrder.address ?? ""}`,
        ),
      )
      .addTo(map);

    const truckMarker = new maplibregl.Marker({
      element: createTruckEl(),
      anchor: "center",
    })
      .setLngLat([current.lng, current.lat])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setText("Driver"))
      .addTo(map);
    markerRef.current = truckMarker;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [current.lng, current.lat],
              [destLng, destLat],
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

      map.fitBounds(
        [
          [Math.min(current.lng, destLng), Math.min(current.lat, destLat)],
          [Math.max(current.lng, destLng), Math.max(current.lat, destLat)],
        ],
        { padding: 80, maxZoom: 15, duration: 600 },
      );

      void updateRouteAndEta(current.lat, current.lng);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainer]);

  useEffect(() => {
    if (!driverLocation || !mapInstance.current) return;
    markerRef.current?.setLngLat([driverLocation.lng, driverLocation.lat]);
    mapInstance.current.easeTo({
      center: [driverLocation.lng, driverLocation.lat],
      zoom: Math.max(mapInstance.current.getZoom(), 15),
      duration: 600,
      essential: true,
    });
  }, [driverLocation]);

  if (!trackingOrderId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500 mb-4">
          Invalid order — no tracking ID found.
        </p>
        <Button onClick={() => navigate("/wholesale-portal")}>
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
        {!driverLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium text-gray-600">
            Waiting for driver’s live location…
          </div>
        )}
      </div>
    </div>
  );
};
