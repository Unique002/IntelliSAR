import React from 'react';
import { GitBranch, Eye } from 'lucide-react';

export default function SimilarCasesWidget({ cases }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm mt-6">
      <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-purple-900 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-700" />
          Similar Cases Found
        </h3>
        <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-0.5 rounded">{cases.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {cases.map((sc, idx) => (
          <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs font-bold text-slate-900">{sc.id}</span>
              <span className="text-xs text-slate-500">{sc.date}</span>
            </div>
            <div className="text-sm text-slate-700 mb-3">{sc.typology}</div>
            <button className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors">
              <Eye className="w-3 h-3" /> View Case Summary
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}