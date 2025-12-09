import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AbsenceReport = ({ report }) => {
    if (!report) return null;

    return (
        <div className="card flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b-2 border-[var(--color-main)] pb-2">
                <AlertTriangle className="text-[var(--color-main)]" />
                <h2 className="text-xl font-bold uppercase text-[var(--color-main)]">
                    Latent Space Inspector
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(report.categories).map(([category, data]) => (
                    <div key={category} className="flex flex-col gap-2">
                        <h3 className="font-bold uppercase text-sm bg-[var(--color-main)] text-white px-2 py-1 inline-block self-start">
                            {category}
                        </h3>

                        {/* Presence Bar */}
                        <div className="space-y-1">
                            {data.present.map((item) => (
                                <div key={item.tag} className="flex items-center gap-2 text-sm">
                                    <div className="w-24 font-mono truncate text-right">{item.tag}</div>
                                    <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                        <div
                                            className="h-full bg-[var(--color-main)]"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-xs opacity-60">{Math.round(item.percentage)}%</div>
                                </div>
                            ))}
                        </div>

                        {/* Absences */}
                        {data.absent.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm">
                                <div className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase mb-1">
                                    <XCircle size={12} /> Absent (0%)
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {data.absent.map(tag => (
                                        <span key={tag} className="px-1 bg-white border border-red-200 text-red-500 text-xs rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AbsenceReport;
