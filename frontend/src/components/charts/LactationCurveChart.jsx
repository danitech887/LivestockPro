import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const LactationCurveChart = ({ data, title = "Lactation Curve (Actual vs Standard Benchmark)" }) => {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500">Yield progression across 305-day standard lactation period</p>
        </div>
      )}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="dayInMilk"
              tickFormatter={(v) => `D${v}`}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              stroke="#cbd5e1"
              unit="L"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 600
              }}
              formatter={(value, name) => [`${value} Liters/day`, name === 'actualYield' ? 'Actual Herd Average' : 'Target Benchmark']}
              labelFormatter={(label) => `Day in Milk: ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(val) => (val === 'actualYield' ? 'Actual Yield' : 'Target Benchmark')}
            />
            <Line
              type="monotone"
              dataKey="actualYield"
              name="actualYield"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="benchmarkYield"
              name="benchmarkYield"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
