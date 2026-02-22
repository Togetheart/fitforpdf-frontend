import React from 'react';
import { Check, X } from 'lucide-react';
import Card from './Card';

function valueNode(value) {
  const normalized = String(value || '').trim();
  const isNo = /^no$/i.test(normalized);

  if (isNo) {
    return (
      <span className="inline-flex items-center gap-2 text-rose-500">
        <X className="h-4 w-4" />
        <span>No</span>
      </span>
    );
  }

  if (!normalized) {
    return <span className="text-muted">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 text-slate-700">
      {normalized !== 'No' && <Check className="h-4 w-4 text-emerald-500" />}
      <span>{normalized}</span>
    </span>
  );
}

export default function PricingComparisonTable({
  columns,
  rows,
  title = 'Feature comparison',
  testId = 'pricing-compare',
}) {
  const featureColumns = columns || [];

  return (
    <section aria-labelledby="pricing-compare-title">
      <h2 id="pricing-compare-title" className="text-2xl font-semibold leading-tight">
        {title}
      </h2>

      <Card
        data-testid={testId}
        className="mt-6 overflow-hidden"
      >
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.06em] text-muted">
                <th className="px-4 py-3">Feature</th>
                {featureColumns.map((col) => (
                  <th key={col} className="px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row[0]}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  <th className="px-4 py-3 text-left font-medium text-slate-700">{row[0]}</th>
                  <td className="px-4 py-3 text-slate-700">{valueNode(row[1])}</td>
                  <td className="px-4 py-3 text-slate-700">{valueNode(row[2])}</td>
                  <td className="px-4 py-3 text-slate-700">{valueNode(row[3])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {rows.map((row) => (
            <div
              key={`${row[0]}-mobile`}
              data-testid="pricing-compare-row"
              className="rounded-xl glass-subtle p-3"
            >
              <p className="text-sm font-medium text-slate-700">{row[0]}</p>
              <dl className="space-y-1 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="text-muted">{featureColumns[0]}</dt>
                  <dd className="text-slate-700">{valueNode(row[1])}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="text-muted">{featureColumns[1]}</dt>
                  <dd className="text-slate-700">{valueNode(row[2])}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="text-muted">{featureColumns[2]}</dt>
                  <dd className="text-slate-700">{valueNode(row[3])}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
