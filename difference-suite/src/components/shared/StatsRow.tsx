import { useSuiteStore } from '../../stores/suiteStore';
import { Image, FileText, Cpu } from 'lucide-react';

const StatsRow = () => {
    const { dataset } = useSuiteStore();

    // Calculate real stats from the store
    const imageCount = dataset.filter(i => i.type === 'image').length;
    const textCount = dataset.filter(i => i.type === 'text').length;

    // Simulate load based on dataset size for realism (or use store isProcessing state)
    const loadPercentage = Math.min(100, Math.floor(20 + (dataset.length * 2)));

    return (
        <div className="px-8 pt-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Visual Corpus */}
                <div className="dc-card p-6 border-0 shadow-card">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-[#6c757d] mb-2">Visual Corpus</h6>
                            <h2 className="text-2xl font-bold text-main">
                                {imageCount > 0 ? imageCount : '0'} <span className="text-sm font-normal text-text-muted">Images</span>
                            </h2>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-[#f8f9fa] flex items-center justify-center text-main">
                            <Image className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Text Corpus */}
                <div className="dc-card p-6 border-0 shadow-card">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-[#6c757d] mb-2">Text Corpus</h6>
                            <h2 className="text-2xl font-bold text-secondary">
                                {textCount > 0 ? textCount : '0'} <span className="text-sm font-normal text-text-muted">Documents</span>
                            </h2>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-[#f8f9fa] flex items-center justify-center text-secondary">
                            <FileText className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Load */}
                <div className="dc-card p-6 border-0 shadow-card">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-[#6c757d] mb-2">Processing Load</h6>
                            <h2 className="text-2xl font-bold text-[#2c3e50]">{loadPercentage}%</h2>
                            <div className="h-1.5 w-[85%] bg-[#f8f9fa] rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-[#2c3e50] transition-all duration-1000"
                                    style={{ width: `${loadPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-[#f8f9fa] flex items-center justify-center text-[#2c3e50]">
                            <Cpu className="w-8 h-8" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StatsRow;
