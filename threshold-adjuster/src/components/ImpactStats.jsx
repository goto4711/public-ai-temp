import React from 'react';

const ImpactStats = ({ data, threshold }) => {
    if (!data) return null;

    const accepted = data.filter(d => d.risk_score >= threshold).length;
    const rejected = data.filter(d => d.risk_score < threshold).length;
    const total = data.length;

    // Calculate "In Doubt" (within +/- 5% of threshold)
    const doubtRange = 0.05;
    const inDoubt = data.filter(d => Math.abs(d.risk_score - threshold) < doubtRange).length;

    return (
        <div className="grid grid-cols-3 gap-4 mb-6 w-full">
            <div className="bg-[var(--color-alt)] p-4 border-2 border-[var(--color-main)] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                <h4 className="text-[var(--color-text)] font-bold text-sm uppercase opacity-70">Accepted</h4>
                <p className="text-3xl font-bold text-[var(--color-text)]">{accepted}</p>
                <p className="text-sm text-[var(--color-text)] font-mono">{((accepted / total) * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-[var(--color-main-secondary)] p-4 border-2 border-[var(--color-main)] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                <h4 className="text-[var(--color-text)] font-bold text-sm uppercase opacity-70">In Doubt</h4>
                <p className="text-3xl font-bold text-[var(--color-text)]">{inDoubt}</p>
                <p className="text-sm text-[var(--color-text)] font-mono">Cases within ±5%</p>
            </div>

            <div className="bg-[var(--color-main)] p-4 border-2 border-[var(--color-main)] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                <h4 className="text-white font-bold text-sm uppercase opacity-80">Rejected</h4>
                <p className="text-3xl font-bold text-white">{rejected}</p>
                <p className="text-sm text-white font-mono">{((rejected / total) * 100).toFixed(1)}%</p>
            </div>
        </div>
    );
};

export default ImpactStats;
