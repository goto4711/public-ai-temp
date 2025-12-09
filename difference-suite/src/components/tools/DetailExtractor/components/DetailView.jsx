import React from 'react';

const DetailView = ({ item, normDistance }) => {
    if (!item) {
        return (
            <div className="h-full flex items-center justify-center text-[var(--color-main)] opacity-50 italic border-2 border-dashed border-[var(--color-main)]">
                Select a point to analyze its difference
            </div>
        );
    }

    // Heuristic narrative generation
    const getNarrative = (dist) => {
        if (dist < 0.5) return "This item sits comfortably within the norm. It shares the common patterns of the cluster.";
        if (dist < 1.0) return "This item shows slight deviations. It conforms to the general pattern but has unique characteristics.";
        return "This item is a distinct outlier. It resists the simplifying logic of the cluster, holding details that don't fit the standard profile.";
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-[var(--color-alt)] p-6 border-2 border-[var(--color-main)] shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                <h2 className="text-xl font-bold text-[var(--color-main)] mb-2 uppercase">The Detail</h2>
                <div className="text-lg font-serif leading-relaxed bg-white/50 p-4 border border-[var(--color-main)] leading-relaxed">
                    "{item.content}"
                </div>
            </div>
        </div>
    );
};

export default DetailView;
