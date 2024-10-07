'use client'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import LineChartComponent from "./components/chart";
import ShowRankingTable from "./components/ShowRankingTable";

export default function Index() {
  return (
    <div style={{ width: '100%', minWidth: '600px' }}>
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <LineChartComponent />
      </div>
      <ShowRankingTable />
    </div>
  );
}
