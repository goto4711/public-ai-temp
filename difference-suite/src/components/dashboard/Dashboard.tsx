import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    CheckCircle2,
    Loader2,
    AlertTriangle,
    Play,
    Upload
} from 'lucide-react';
import { TOOLS } from '../../utils/navigation';
import ToolLayout from '../shared/ToolLayout';
import DataUploadModal from '../shared/DataUploadModal';



const data = [
    { time: '00:00', value: 12 },
    { time: '04:00', value: 19 },
    { time: '08:00', value: 3 },
    { time: '12:00', value: 5 },
    { time: '16:00', value: 20 },
    { time: '20:00', value: 15 },
    { time: '24:00', value: 25 },
];

const Dashboard = () => {

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const MainContent = () => (
        <div className="h-full flex flex-col">
            <DataUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-1 text-text">Deep Culture Tools</h2>
                    <p className="text-text-muted font-light">Monitoring and extraction of cultural data vectors.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="btn-outline flex items-center gap-2 bg-white shadow-sm border-gray-200"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Data
                    </button>
                    <button className="btn-primary rounded-full px-6 shadow-sm">
                        <Play className="w-3 h-3 fill-current" />
                        Run Batch Analysis
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
                {/* [Big Box] Difference Toolbox - Chart */}
                <div className="lg:col-span-8 h-full">
                    <div className="dc-card h-full flex flex-col border-0 shadow-card">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white rounded-t-xl">
                            <span className="font-semibold text-lg">Difference Toolbox</span>
                            <div className="flex text-xs rounded border border-gray-200 overflow-hidden">
                                <button className="px-3 py-1 bg-white hover:bg-gray-50 text-text-muted transition-colors">Live</button>
                                <button className="px-3 py-1 bg-gray-100 text-text font-semibold shadow-inner">History</button>
                            </div>
                        </div>
                        <div className="flex-1 p-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#832161" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#832161" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#832161"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        dot={{ fill: '#fff', stroke: '#832161', strokeWidth: 2, r: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* [Small Box] Tool Status */}
                <div className="lg:col-span-4 h-full">
                    <div className="dc-card h-full flex flex-col border-0 shadow-card">
                        <div className="px-6 py-4 border-b border-border bg-white rounded-t-xl font-semibold text-lg">
                            Tool Status
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="divide-y divide-gray-50">
                                {/* Context Weaver */}
                                <div className="px-6 py-4 flex items-center group hover:bg-gray-50 transition-colors">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-4" />
                                    <div>
                                        <h6 className="text-sm font-semibold text-text">Context Weaver</h6>
                                        <p className="text-xs text-text-muted">Operational - Idle</p>
                                    </div>
                                </div>

                                {/* Ambiguity Amplifier */}
                                <div className="px-6 py-4 flex items-center group hover:bg-gray-50 transition-colors">
                                    <Loader2 className="w-5 h-5 text-main animate-spin mr-4" />
                                    <div>
                                        <h6 className="text-sm font-semibold text-text">Ambiguity Amplifier</h6>
                                        <p className="text-xs text-text-muted">Processing Batch #204</p>
                                    </div>
                                </div>

                                {/* Glitch Detector */}
                                <div className="px-6 py-4 flex items-center group hover:bg-gray-50 transition-colors">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-4" />
                                    <div>
                                        <h6 className="text-sm font-semibold text-text">Glitch Detector</h6>
                                        <p className="text-xs text-text-muted">Threshold warning</p>
                                    </div>
                                </div>

                                {/* Networked Narratives - Extra mockup */}
                                <div className="px-6 py-4 flex items-center group hover:bg-gray-50 transition-colors opacity-50">
                                    <CheckCircle2 className="w-5 h-5 text-gray-300 mr-4" />
                                    <div>
                                        <h6 className="text-sm font-semibold text-text">Networked Narratives</h6>
                                        <p className="text-xs text-text-muted">Offline</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <MainContent />;
};

export default Dashboard;
