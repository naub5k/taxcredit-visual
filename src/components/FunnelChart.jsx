import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FunnelChart = ({ data }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">정제 단계별 현황</h2>
      <div className="w-full h-72 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip formatter={(value) => new Intl.NumberFormat("ko-KR").format(value)} />
            <Bar dataKey="count" fill="#4F46E5" label={{ position: "right", formatter: (value) => new Intl.NumberFormat("ko-KR").format(value) }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FunnelChart; 