/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { englishToSQL } from '../lib/nl2sql';
import { runQuery, type QueryResult, getDatabase } from '../lib/duckdb';
import { ResultsTable } from '../components/ResultsTable';
import { AutoChart } from '../components/AutoChart';

export default function Page() {
  const [nl, setNl] = useState<string>('total sales by category in 2023');
  const [sql, setSql] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [loadingDB, setLoadingDB] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResult>({ columns: [], rows: [] });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Warm up DB
    (async () => {
      try {
        setLoadingDB(true);
        await getDatabase();
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setLoadingDB(false);
      }
    })();
  }, []);

  const generate = () => {
    const out = englishToSQL(nl);
    setSql(out.sql.trim());
    setDesc(out.description);
    setResult({ columns: [], rows: [] });
    setError('');
  };

  const run = async () => {
    setExecuting(true);
    setError('');
    try {
      const res = await runQuery(sql);
      setResult(res);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setExecuting(false);
    }
  };

  const canRun = useMemo(() => !!sql.trim(), [sql]);

  return (
    <main>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
        NL ? SQL Agent
      </h1>
      <div className="muted" style={{ marginBottom: 18 }}>
        Type a simple English request; we?ll generate SQL, execute it on a demo dataset, and chart the results.
      </div>

      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="col">
          <div className="card">
            <label className="label">Your request</label>
            <textarea
              className="textarea"
              placeholder="e.g., top 5 customers by total sales in 2023"
              value={nl}
              onChange={(e) => setNl(e.target.value)}
              disabled={loadingDB}
            />
            <div className="spacer" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={generate} disabled={loadingDB}>
                Generate SQL
              </button>
              <button className="btn" onClick={run} disabled={!canRun || executing || loadingDB}>
                {executing ? 'Running?' : 'Run Query'}
              </button>
            </div>
            {loadingDB && <div className="muted" style={{ marginTop: 8 }}>Initializing database?</div>}
            {!!error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
          </div>
        </div>
        <div className="col">
          <div className="card">
            <label className="label">Generated SQL (editable)</label>
            <textarea
              className="textarea"
              placeholder="SQL will appear here"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
            />
            {desc && <div className="muted" style={{ marginTop: 8 }}>Intent: {desc}</div>}
          </div>
        </div>
      </div>

      <div className="spacer" />
      <div className="card">
        <div className="section-title">Results</div>
        <ResultsTable columns={result.columns} rows={result.rows} />
      </div>

      <div className="spacer" />
      <div className="card">
        <div className="section-title">Visualization</div>
        <AutoChart columns={result.columns} rows={result.rows} />
        {!result.rows.length && <div className="muted">Run a query to see a chart.</div>}
      </div>

      <div className="spacer" />
      <div className="muted" style={{ fontSize: 12 }}>
        Demo schema: tables `customers`, `orders`, `products`. Sales = `quantity * price`.
      </div>
    </main>
  );
}

