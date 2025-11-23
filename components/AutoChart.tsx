import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Legend, Tooltip, TimeScale);

type Props = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
};

function isNumber(val: unknown): boolean {
  return typeof val === 'number' && isFinite(val);
}

function looksLikeDate(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return /^\d{4}-\d{2}(-\d{2})?$/.test(val);
}

export function AutoChart({ columns, rows }: Props) {
  const content = useMemo(() => {
    if (columns.length < 2 || rows.length === 0) return null;
    // Prefer [label, value] shape
    // Find first categorical column
    let labelCol = columns.find((c) => typeof rows[0][c] === 'string');
    // Find first numeric column
    let valueCol = columns.find((c) => isNumber(rows[0][c]));

    if (!labelCol || !valueCol) return null;

    const labels = rows.map((r) => String(r[labelCol!]));
    const values = rows.map((r) => (rows[0][valueCol!] as number) * 0 + Number(r[valueCol!]));

    const isTemporal = looksLikeDate(rows[0][labelCol]);
    const data = {
      labels,
      datasets: [
        {
          label: valueCol,
          data: values,
          backgroundColor: 'rgba(37, 99, 235, 0.6)',
          borderColor: 'rgba(37, 99, 235, 1)',
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: isTemporal
        ? {
            x: { ticks: { autoSkip: true } },
            y: { beginAtZero: true },
          }
        : {
            x: { ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 } },
            y: { beginAtZero: true },
          },
    } as const;

    if (isTemporal) {
      return (
        <div style={{ height: 360 }}>
          <Line data={data} options={options} />
        </div>
      );
    }
    return (
      <div style={{ height: 360 }}>
        <Bar data={data} options={options} />
      </div>
    );
  }, [columns, rows]);

  return content;
}

