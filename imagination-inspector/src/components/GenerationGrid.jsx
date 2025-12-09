import React from 'react';
import { User } from 'lucide-react';

const GenerationGrid = ({ results }) => {
    if (!results || results.length === 0) {
        return (
            <div className="card h-full flex items-center justify-center opacity-50 min-h-[300px]">
                <p className="font-mono">No generations yet. Enter a prompt to start.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-lg font-bold uppercase text-[var(--color-main)] mb-4">
                Generated Samples ({results.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {results.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 group">
                        <div
                            className="aspect-square bg-gray-200 border-2 border-transparent group-hover:border-[var(--color-main)] transition-all flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: item.color }}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.prompt}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={48} className="opacity-20 text-black" />
                            )}

                            {/* Overlay Tags */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs text-white font-mono overflow-y-auto">
                                {Object.entries(item.tags).map(([k, v]) => (
                                    <div key={k}><span className="opacity-50">{k}:</span> {v}</div>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs font-mono text-center opacity-60">
                            #{item.id + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenerationGrid;
