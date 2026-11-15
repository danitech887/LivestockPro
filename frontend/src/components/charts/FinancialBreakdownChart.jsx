import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const FinancialBreakdownChart = ({ data, title = "Multi-Sector Revenue vs Expenses (6-Month Trend)" }) => {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500">Dairy yields and beef sales stacked against operating expenses</p>
        </div>
      )}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              stroke="#cbd5e1"
              tickFormatter={(v) => `$${v}`}
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
              formatter={(value, name) => {
                const labels = {
                  dairyRevenue: 'Dairy Revenue',
                  beefRevenue: 'Beef Revenue',
                  totalExpenses: 'Operating Expenses',
                  netProfit: 'Net Margin'
                };
                return [formatCurrency(value), labels[name] || name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="dairyRevenue" name="Dairy Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="beefRevenue" name="Beef Revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalExpenses" name="Expenses" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
