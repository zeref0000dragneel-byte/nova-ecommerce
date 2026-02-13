'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export type WeeklySalesPoint = { day: string; ventas: number };

export default function SalesChart({ data }: { data: WeeklySalesPoint[] }) {
  if (!data.length) {
    return (
      <div className="h-[180px] flex items-center justify-center text-[12px] text-zinc-400">
        Sin datos de ventas esta semana
      </div>
    );
  }

  return (
    <div className="h-[180px] w-full px-4 pb-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#a1a1aa' }}
          />
          <YAxis
            hide
            domain={['auto', 'auto']}
            allowDataOverflow
          />
          <Tooltip
            contentStyle={{
              fontSize: '11px',
              border: '1px solid #f4f4f5',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            formatter={(value: number) => [`$${value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, 'Ventas']}
            labelStyle={{ color: '#71717a' }}
          />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#18181b"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: '#18181b', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
