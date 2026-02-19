import React from 'react';

import { Check, X } from 'lucide-react';
import Card from './Card';

function compareValue(value) {
  const normalized = String(value || '').trim();

  if (normalized === '✓') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <Check className="h-4 w-4" />
        <span className="sr-only">Yes</span>
      </span>
    );
  }

  if (normalized === '✗') {
    return (
      <span className="inline-flex items-center gap-1 text-rose-500">
        <X className="h-4 w-4" />
        <span className="sr-only">No</span>
      </span>
    );
  }

  return <span className="text-slate-700">{normalized}</span>;
}

export default function FeatureComparison({
  title = 'Feature comparison',
  columns,
  rows,
}) {
  const featureColumns = columns || [];
  const visibleRows = Array.isArray(rows) ? rows : [];

  return (
    <section
      aria-labelledby="feature-comparison-title"
      data-testid="pricing-compare"
      className="space-y-4 rounded-xl glass p-6"
    >
      <h2 id="feature-comparison-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>

      <Card className="mt-6 overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.06em] text-slate-500">
                <th className="px-4 py-3">Feature</th>
                {featureColumns.map((column) => (
                  <th key={column} className="px-4 py-3">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, rowIndex) => (
                <tr
                  key={row[0]}
                  className={`border-b border-slate-100 last:border-b-0 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/55'}`}
                >
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    {row[0]}
                  </th>
                  {featureColumns.map((_, index) => (
                    <td key={index} className="px-4 py-3">
                      {compareValue(row[index + 1])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {visibleRows.map((row) => (
            <div
              key={row[0]}
              data-testid="feature-compare-row"
              className="rounded-xl glass-subtle p-3"
            >
              <p className="text-sm font-medium text-slate-800">{row[0]}</p>
              <dl className="mt-2 space-y-1 text-sm">
                {featureColumns.map((column, index) => (
                  <div key={`${row[0]}-${column}`} className="grid grid-cols-2 gap-2">
                    <dt className="text-slate-500">{column}</dt>
                    <dd>{compareValue(row[index + 1])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
