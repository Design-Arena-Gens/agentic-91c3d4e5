import React from 'react';

type Props = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
};

export function ResultsTable({ columns, rows }: Props) {
  if (!columns.length) return null;
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold border-b">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              {columns.map((c) => (
                <td key={c} className="px-3 py-2 border-b align-top">
                  {String(row[c] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

