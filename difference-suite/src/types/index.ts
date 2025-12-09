export type DataType = 'image' | 'text' | 'timeseries' | 'tabular';

export interface DataItem {
    id: string;
    name: string;
    type: DataType;
    content: string | File; // URL for images, raw text for text
    rawFile?: File;
    metadata?: {
        size: number;
        lastModified: number;
        mimeType: string;
        [key: string]: any;
    };
    embedding?: number[]; // Computed embedding
    analysisResults?: Record<string, any>; // Results from different tools
}

export interface AnalysisResult {
    toolId: string;
    timestamp: number;
    summary: string;
    data: any;
}

export interface SuiteState {
    dataset: DataItem[];
    activeItem: string | null; // ID of currently selected item
    isProcessing: boolean;

    // Actions
    addItem: (item: DataItem) => void;
    addItems: (items: DataItem[]) => void;
    removeItem: (id: string) => void;
    setActiveItem: (id: string | null) => void;
    updateItemResult: (itemId: string, toolId: string, result: any) => void;
    clearDataset: () => void;
}
