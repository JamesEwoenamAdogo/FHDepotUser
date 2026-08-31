import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllOrders } from "@/lib/Api";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const WholesalerAnalytics = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const id = localStorage.getItem("id");
        if (!id) return;
        const response = await getAllOrders(id);
        if (response?.data?.data) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const chartData = useMemo(() => {
    const filtered = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return !isNaN(d.getTime()) && d.getFullYear() === year;
    });

    return MONTH_NAMES.map((name, monthIdx) => {
      const monthOrders = filtered.filter(
        (o) => new Date(o.createdAt).getMonth() === monthIdx,
      );
      const totalAmount = monthOrders.reduce(
        (sum, o) => sum + (Number(o.amount) || 0),
        0,
      );
      return {
        name,
        orders: monthOrders.length,
        amount: totalAmount,
      };
    });
  }, [orders, year]);

  const totalForYear = chartData.reduce((sum, d) => sum + d.amount, 0);
  const totalOrdersForYear = chartData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
        <div>
          <h2 className="text-xl font-bold text-fh-navy">Order Analytics</h2>
          <p className="text-sm text-gray-500">
            Monthly order volume and total amount for {year}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 font-medium">
            Filter by Year:
          </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-fh-navy font-medium focus:outline-none focus:ring-2 focus:ring-fh-orange/30 bg-white"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
        <div className="bg-fh-gray rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Orders ({year})</p>
          <p className="text-2xl font-bold text-fh-navy mt-1">
            {totalOrdersForYear}
          </p>
        </div>
        <div className="bg-fh-gray rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Amount ({year})</p>
          <p className="text-2xl font-bold text-fh-navy mt-1">
            GHS{" "}
            {totalForYear.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="h-[400px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F28C28" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F28C28" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#123A63" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#123A63" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any, name: any) =>
                name === "amount"
                  ? [`GHS ${Number(value).toLocaleString()}`, "Total Amount"]
                  : [value, "Orders"]
              }
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#F28C28"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#123A63"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-fh-orange inline-block"></span>
          <span className="text-sm text-gray-600">Number of Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-fh-navy inline-block"></span>
          <span className="text-sm text-gray-600">Total Amount (GHS)</span>
        </div>
      </div>
    </div>
  );
};
