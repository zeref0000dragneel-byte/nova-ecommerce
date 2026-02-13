'use client';

import { useEffect, useState } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  // Solución al error de Vercel: Esperar a que el componente monte en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Placeholder con la misma altura que el gráfico para evitar saltos visuales
    return <div className="h-[180px] w-full" />;
  }

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
            formatter={(value: number | undefined) => {
              if (value === undefined) return ['$0', 'Ventas'];
              return [`$${value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, 'Ventas'];
            }}
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
