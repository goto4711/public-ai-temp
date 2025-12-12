import React, { useState, useMemo, useCallback } from 'react';
import { useSuiteStore } from '../../stores/suiteStore';
import { CollectionSidebar } from './CollectionSidebar';
import { DataGrid } from './DataGrid';
import { ContextPanel } from './ContextPanel';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderUp } from 'lucide-react';
import type { DataItem } from '../../types';

export const Dashboard: React.FC = () => {
    const { dataset, addItems, createCollection } = useSuiteStore();
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

    // Filter items by collection
    const filteredItems = useMemo(() => {
        if (!activeCollectionId) return dataset;
        return dataset.filter(item => item.collectionId === activeCollectionId);
    }, [dataset, activeCollectionId]);

    // Helper to read file content
    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const isImage = file.type.startsWith('image/');
            if (isImage) {
                resolve(URL.createObjectURL(file));
                return;
            }

            // For non-images (text, csv, json, md, etc.), read as text
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string || '');
            };
            reader.onerror = () => resolve('Error reading file');
            reader.readAsText(file);
        });
    };

    // Handle File Drop
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newItems = await Promise.all(acceptedFiles.map(async (file) => {
            const isImage = file.type.startsWith('image/');
            const type = isImage ? 'image' :
                file.name.endsWith('.csv') ? 'tabular' :
                    file.name.endsWith('.json') ? 'timeseries' : 'text';

            const content = await readFileContent(file);

            return {
                id: crypto.randomUUID(),
                name: file.name,
                type,
                content,
                rawFile: file,
                collectionId: activeCollectionId || undefined,
                metadata: {
                    size: file.size,
                    lastModified: file.lastModified,
                    mimeType: file.type
                }
            } as DataItem;
        }));

        addItems(newItems);
    }, [addItems, activeCollectionId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true // Prevent click from opening file dialog
    });

    // Handle Folder Upload
    const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const folderName = files[0].webkitRelativePath.split('/')[0];
        if (!folderName) return;

        const collectionId = createCollection(folderName);

        const newItems = await Promise.all(Array.from(files).map(async (file) => {
            const isImage = file.type.startsWith('image/');
            const type = isImage ? 'image' : 'text';
            const content = await readFileContent(file);

            return {
                id: crypto.randomUUID(),
                name: file.name,
                type,
                content,
                rawFile: file,
                collectionId: collectionId,
                metadata: {
                    size: file.size,
                    lastModified: file.lastModified,
                    mimeType: file.type
                }
            } as DataItem;
        }));

        addItems(newItems);
        setActiveCollectionId(collectionId);
    };

    return (
        <div className="flex h-full overflow-hidden relative">
            {/* Sidebar */}
            <CollectionSidebar
                activeCollectionId={activeCollectionId}
                onSelectCollection={setActiveCollectionId}
            />

            {/* Main Content (Data Grid + Drop Zone) */}
            <div className="flex-1 flex flex-col relative" {...getRootProps()}>
                <input {...getInputProps()} />

                {/* Header / Toolbar */}
                <div className="h-14 border-b-2 border-main flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold tracking-tight text-main uppercase leading-none">
                            Data Dashboard
                        </h1>
                        {activeCollectionId && (
                            <span className="text-[10px] font-bold text-main/60 uppercase tracking-wider">
                                Collection View
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Hidden Folder Input Hack */}
                        <div className="relative overflow-hidden inline-block">
                            <button className="flex items-center gap-2 px-3 py-1.5 font-bold uppercase text-sm transition-transform hover:-translate-y-0.5 border-2 border-main bg-white text-main shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                <FolderUp className="w-4 h-4" />
                                <span>Upload Folder</span>
                            </button>
                            <input
                                type="file"
                                // @ts-ignore - webkitdirectory is standard but TS might complain
                                webkitdirectory="true"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFolderSelect}
                            />
                        </div>

                        <div className="bg-main text-white px-3 py-1.5 font-mono text-xs font-bold border-2 border-main shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            {filteredItems.length} items
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-hidden relative p-4">
                    <DataGrid items={filteredItems} />

                    {/* Drag Overlay */}
                    {isDragActive && (
                        <div className="absolute inset-0 bg-main/10 backdrop-blur-sm border-4 border-main border-dashed m-4 flex items-center justify-center z-50 pointer-events-none">
                            <div className="flex flex-col items-center gap-4 text-main bg-white p-8 border-2 border-main shadow-card">
                                <Upload className="w-12 h-12" />
                                <p className="text-xl font-bold uppercase">Drop items to add</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Context Panel */}
            <ContextPanel />
        </div>
    );
};
