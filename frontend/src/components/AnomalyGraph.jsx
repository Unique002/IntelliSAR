import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function AnomalyGraph({ data }) {
  return (
    <div className="p-6 border-b border-slate-200 bg-slate-50">
      <div className="flex justify-between items-end mb-4">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Behavioral Anomaly View</h4>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 5.2x Above Baseline
        </span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(val) => `${val}`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => `${value.toLocaleString()} txns`} />
            <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Normal Baseline', fill: '#10b981', fontSize: 12 }} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.flagged > 0 ? '#ef4444' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}