import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const WeightProgressionChart = ({ data, title = "Weight Progression & Growth Trajectory" }) => {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500">Weight sampling history (kg) against finishing targets</p>
        </div>
      )}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              stroke="#cbd5e1"
            />
            <YAxis
              domain={['dataMin - 20', 'dataMax + 20']}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              stroke="#cbd5e1"
              unit="kg"
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
              formatter={(value) => [`${value} kg`, 'Recorded Weight']}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#dc2626"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#weightGrad)"
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#dc2626' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
