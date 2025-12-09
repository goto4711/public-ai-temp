import React, { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw, Brain } from 'lucide-react';
import TimelineViz from './components/TimelineViz';
import AnomalyInspector from './components/AnomalyInspector';
import UploadZone from './components/UploadZone';
import { generateMockData } from './utils/AnomalyDetector'; // Keep mock generator
import { DeepAnomalyDetector } from './utils/DeepAnomalyDetector';
import { parseCSV } from './utils/DataProcessor';

function App() {
  const [data, setData] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState(null);
  const detectorRef = useRef(new DeepAnomalyDetector());

  // Load mock data on start
  useEffect(() => {
    handleReset();
  }, []);

  const processDataWithModel = async (rawData) => {
    setLoading(true);
    setTrainingProgress(0);
    setTrainingLoss(null);

    try {
      // Train the model
      await detectorRef.current.train(rawData, (epoch, loss) => {
        setTrainingProgress(Math.round(((epoch + 1) / 50) * 100));
        setTrainingLoss(loss);
      });

      // Detect anomalies
      const processed = detectorRef.current.detect(rawData);
      setData(processed);
      setSelectedAnomaly(null);
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const mock = generateMockData(100);
    processDataWithModel(mock);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let parsedData;

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(text);
        } else {
          parsedData = parseCSV(text);
        }

        processDataWithModel(parsedData);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error parsing file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <header className="flex justify-between items-center border-b-4 border-[var(--color-main)] pb-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-main)] uppercase tracking-tighter flex items-center gap-2">
            <Activity size={40} />
            The Discontinuity Detector
          </h1>
          <p className="text-sm opacity-60 font-mono mt-2">
            "History is not smooth - it is punctuated by contingent events."
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn-secondary"
          disabled={loading}
        >
          <RefreshCw size={20} />
          Load Demo Data
        </button>
      </header>

      {loading && (
        <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center flex-col gap-4 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-[var(--color-main)] border-t-[var(--color-alt)] rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="font-mono text-xl text-[var(--color-main)] animate-pulse flex items-center justify-center gap-2">
              <Brain /> Training Neural Network...
            </p>
            <div className="w-64 h-4 bg-gray-200 rounded-full mt-4 overflow-hidden border border-[var(--color-main)]">
              <div
                className="h-full bg-[var(--color-main)] transition-all duration-200"
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <p className="font-mono text-sm mt-2 opacity-60">
              Epoch: {Math.round((trainingProgress / 100) * 50)}/50 | Loss: {trainingLoss?.toFixed(4) || '...'}
            </p>
          </div>
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-[600px]">

        {/* Left: Visualization & Upload */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Temporal Ruptures</h2>
              <div className="text-sm font-mono opacity-60">
                {data.filter(d => d.isAnomaly).length} Anomalies Detected
              </div>
            </div>
            <TimelineViz
              data={data}
              onSelectAnomaly={setSelectedAnomaly}
              selectedId={selectedAnomaly?.id}
            />
          </div>

          <div className="mt-auto">
            <UploadZone onFileUpload={handleFileUpload} />
          </div>
        </div>

        {/* Right: Inspector */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[var(--color-main)] uppercase">Event Inspector</h2>
          <AnomalyInspector anomaly={selectedAnomaly} />
        </div>

      </main>
    </div>
  );
}

export default App;
