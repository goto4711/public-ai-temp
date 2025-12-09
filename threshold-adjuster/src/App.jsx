import React, { useState, useEffect } from 'react';
import { generateMockData } from './data/mockData';
import ThresholdHistogram from './components/ThresholdHistogram';
import ImpactStats from './components/ImpactStats';
import CaseList from './components/CaseList';
import { AlertTriangle } from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    const mockData = generateMockData(1000);
    setData(mockData);
  }, []);

  return (
    <div className="app-container">
      <header className="text-center mb-8 border-b-4 border-[var(--color-main)] pb-6">
        <h1 className="text-4xl font-bold mb-2 text-[var(--color-main)] uppercase tracking-tighter">The Threshold Adjuster</h1>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col gap-8">

        {/* Top Row: Controls & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Left: Histogram (Controls) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Decision Boundary</h2>
              <div className="bg-white/80 px-3 py-1 border border-[var(--color-main)] text-sm font-mono text-[var(--color-main)]">
                Threshold: <strong>{(threshold * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <ThresholdHistogram
              data={data}
              threshold={threshold}
              setThreshold={setThreshold}
            />
          </div>

          {/* Right: Impact Stats */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Impact Analysis</h2>
            <ImpactStats data={data} threshold={threshold} />
          </div>

        </div>

        {/* Bottom Row: Case List */}
        <CaseList data={data} threshold={threshold} />

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm opacity-60 pb-8">
        <p>A Deep Culture "Little Tool of Difference"</p>
      </footer>
    </div>
  );
}

export default App;
