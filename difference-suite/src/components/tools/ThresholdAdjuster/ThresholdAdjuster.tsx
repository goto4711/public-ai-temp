import { useState, useEffect } from 'react';
import { generateMockData } from './data/mockData';
import ThresholdHistogram from './components/ThresholdHistogram';
import ImpactStats from './components/ImpactStats';
import CaseList from './components/CaseList';
import { Sliders, Scale } from 'lucide-react';
import ToolLayout from '../../shared/ToolLayout';

import { useSuiteStore } from '../../../stores/suiteStore';
import { parseCSV } from '../DiscontinuityDetector/utils/DataProcessor';

const ThresholdAdjuster = () => {
    const { dataset, activeItem, setActiveItem } = useSuiteStore();
    const [data, setData] = useState<any[]>([]);
    const [threshold, setThreshold] = useState(0.5);

    const dataItems = dataset.filter(i =>
        i.type === 'tabular' || i.type === 'timeseries' || i.name.endsWith('.json') || i.name.endsWith('.csv')
    );

    const selectedItem = dataset.find(i => i.id === activeItem);

    useEffect(() => {
        if (selectedItem && selectedItem.content) {
            loadData(selectedItem);
        } else if (data.length === 0) {
            setData(generateMockData(1000));
        }
    }, [selectedItem]);

    const loadData = (item: any) => {
        try {
            let parsed = [];
            if (item.name.endsWith('.json')) {
                parsed = JSON.parse(item.content);
            } else {
                parsed = parseCSV(item.content);
            }

            // Normalize CSV data if needed (rename fields to match expected schema if possible, or just expect correct headers)
            // Expect: risk_score, applicant_name, etc.
            if (Array.isArray(parsed) && parsed.length > 0) {
                setData(parsed);
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    };

    const mainContent = (
        <div className="flex flex-col h-full gap-6">
            {/* Top Analysis: Histogram */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-main flex items-center gap-2">
                            <Sliders className="w-5 h-5" />
                            Decision Boundary
                        </h2>
                        <p className="text-xs text-text-muted">
                            Drag the slider to adjust the classification threshold
                        </p>
                    </div>
                    <div className="bg-alt/20 px-3 py-1 text-sm font-mono text-main font-bold border border-main/20 rounded">
                        Threshold: {(threshold * 100).toFixed(1)}%
                    </div>
                </div>

                <div className="flex-1 p-6 relative">
                    <ThresholdHistogram
                        data={data}
                        threshold={threshold}
                        setThreshold={setThreshold}
                    />
                </div>
            </div>

            {/* Bottom Evidence: Case List */}
            <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-main flex items-center gap-2 uppercase tracking-wide">
                        Sample Cases
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <CaseList data={data} threshold={threshold} />
                </div>
            </div>
        </div>
    );

    const sideContent = (
        <div className="flex flex-col h-full gap-6 p-1">
            {/* Data Selector */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="text-xs font-bold text-text-muted block mb-2">Select Dataset:</label>
                <select
                    className="deep-input w-full text-xs"
                    value={activeItem || ''}
                    onChange={(e) => setActiveItem(e.target.value)}
                >
                    <option value="" disabled>-- Choose Dataset --</option>
                    {dataItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
            </div>

            {/* Impact Stats Panel */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold flex items-center gap-2 uppercase tracking-wide text-text-muted">
                        <Scale className="w-4 h-4" />
                        Impact Analysis
                    </h2>
                </div>
                <div className="p-6">
                    <ImpactStats data={data} threshold={threshold} />
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs text-text-muted space-y-2">
                <p className="font-bold mb-1">Observation Guide:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li>Move the slider to shift outcomes.</li>
                    <li>Observe how False Positives vs False Negatives trade off.</li>
                    <li>In the Sample Cases below, notice how some lives (cases) flip between approved/rejected based on your arbitrary line.</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200 opacity-60 italic">
                    "The threshold is not neutral - it embodies values and priorities."
                </div>
            </div>
        </div>
    );

    return (
        <ToolLayout
            title="Threshold Adjuster"
            subtitle="The Ethics of the Cut: adjusting decision boundaries in classification systems"
            mainContent={mainContent}
            sideContent={sideContent}
        />
    );
};

export default ThresholdAdjuster;
