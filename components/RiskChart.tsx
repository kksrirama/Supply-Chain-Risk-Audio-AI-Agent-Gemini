
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProductRisk, RiskLevel } from '../types';

interface RiskChartProps {
  data: ProductRisk[];
}

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.High:
      return '#ef4444'; // red-500
    case RiskLevel.Medium:
      return '#f59e0b'; // amber-500
    case RiskLevel.Low:
      return '#10b981'; // emerald-500
    default:
      return '#6b7280'; // gray-500
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: ProductRisk = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-white">{label}</p>
        <p className="text-gray-300">Risk Score: <span className="font-semibold" style={{ color: getRiskColor(data.riskLevel) }}>{data.riskScore}</span></p>
        <p className="text-gray-400 mt-1">Reason: {data.reason}</p>
      </div>
    );
  }
  return null;
};

const RiskChart: React.FC<RiskChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Product Risk Analysis</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Bar dataKey="riskScore" name="Risk Score">
              {data.map((entry, index) => (
                <Bar key={`bar-${index}`} dataKey="riskScore" fill={getRiskColor(entry.riskLevel)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskChart;
