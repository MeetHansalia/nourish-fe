"use client";

import React from "react";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

const data = [
  { month: "Jan", orders: 53 },
  { month: "Feb", orders: 24 },
  { month: "Mar", orders: 58 },
  { month: "Apr", orders: 33 },
  { month: "May", orders: 75 },
  { month: "Jun", orders: 18 },
  { month: "Jul", orders: 47 },
  { month: "Aug", orders: 22 },
  { month: "Sep", orders: 55 },
  { month: "Oct", orders: 36 },
  { month: "Nov", orders: 19 },
  { month: "Dec", orders: 49 },
];

const MonthlyOrdersChart = () => {
  return (
<div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Orders</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <XAxis dataKey="month" tick={{ fill: "#777" }} />
          <YAxis tick={{ fill: "#777" }} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <Bar dataKey="orders" fill="#4CAF50" radius={[8, 8, 0, 0]}>
            {/* Label for values above bars */}
            <LabelList dataKey="orders" position="top" fill="#000" fontSize={14} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyOrdersChart;
