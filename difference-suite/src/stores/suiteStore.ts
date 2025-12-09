import { create } from 'zustand';
import type { SuiteState, DataItem } from '../types';

export const useSuiteStore = create<SuiteState>((set) => ({
    dataset: [],
    activeItem: null,
    isProcessing: false,

    addItem: (item) => set((state) => ({
        dataset: [...state.dataset, item],
        activeItem: state.activeItem || item.id // Auto-select first item
    })),

    addItems: (items) => set((state) => ({
        dataset: [...state.dataset, ...items],
        activeItem: state.activeItem || items[0]?.id
    })),

    removeItem: (id) => set((state) => ({
        dataset: state.dataset.filter((i) => i.id !== id),
        activeItem: state.activeItem === id ? null : state.activeItem
    })),

    setActiveItem: (id) => set({ activeItem: id }),

    updateItemResult: (itemId, toolId, result) => set((state) => ({
        dataset: state.dataset.map((item) => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                analysisResults: {
                    ...(item.analysisResults || {}),
                    [toolId]: result
                }
            };
        })
    })),

    clearDataset: () => set({ dataset: [], activeItem: null })
}));
