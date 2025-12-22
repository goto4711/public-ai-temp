import { transformersManager } from '../../../../utils/TransformersManager';

export interface AlignmentResult {
    id: string;
    name: string;
    url: string;
    score: number;
}

export const alignDatasetToPrompt = async (prompt: string, dataset: any[]): Promise<AlignmentResult[]> => {
    if (!prompt.trim()) return [];

    const imageItems = dataset.filter(item => item.type === 'image');
    if (imageItems.length === 0) return [];

    const imageUrls = imageItems.map(item => item.content as string);

    try {
        const alignments = await transformersManager.getMultimodalAlignmentBatch(prompt, imageUrls);

        // Map back to dataset items
        return alignments.map(a => {
            const item = imageItems.find(img => img.content === a.url);
            return {
                id: item?.id || '',
                name: item?.name || 'Unknown',
                url: a.url,
                score: a.score
            };
        });
    } catch (error) {
        console.error("Dataset alignment failed:", error);
        return [];
    }
};
