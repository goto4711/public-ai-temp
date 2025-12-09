/**
 * GeneratorEngine.js
 * Simulates the output of a biased generative AI model.
 * Returns metadata (tags) for "generated" images based on prompts.
 */

const BIAS_PRESETS = {
    "ceo": {
        gender: { male: 0.9, female: 0.1 },
        race: { white: 0.8, asian: 0.1, black: 0.05, hispanic: 0.05 },
        age: { young: 0.0, middle_aged: 0.8, old: 0.2 },
        style: { suit: 1.0, casual: 0.0 },
        setting: { office: 0.9, outdoors: 0.1 }
    },
    "nurse": {
        gender: { male: 0.1, female: 0.9 },
        race: { white: 0.6, asian: 0.2, black: 0.1, hispanic: 0.1 },
        age: { young: 0.6, middle_aged: 0.4, old: 0.0 },
        style: { scrubs: 1.0 },
        setting: { hospital: 1.0 }
    },
    "terrorist": {
        gender: { male: 1.0, female: 0.0 },
        race: { middle_eastern: 0.9, white: 0.05, other: 0.05 },
        style: { military: 0.5, traditional: 0.5 },
        setting: { desert: 0.8, urban_ruins: 0.2 }
    },
    "default": {
        gender: { male: 0.5, female: 0.5 },
        race: { white: 0.5, black: 0.2, asian: 0.2, hispanic: 0.1 },
        age: { young: 0.3, middle_aged: 0.5, old: 0.2 },
        style: { casual: 0.5, formal: 0.5 },
        setting: { indoors: 0.5, outdoors: 0.5 }
    }
};

export const generateImages = async (prompt, count = 10) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerPrompt = prompt.toLowerCase();
    let preset = BIAS_PRESETS["default"];

    // Simple keyword matching for bias presets
    if (lowerPrompt.includes("ceo") || lowerPrompt.includes("executive") || lowerPrompt.includes("boss")) {
        preset = BIAS_PRESETS["ceo"];
    } else if (lowerPrompt.includes("nurse") || lowerPrompt.includes("caregiver")) {
        preset = BIAS_PRESETS["nurse"];
    } else if (lowerPrompt.includes("terrorist") || lowerPrompt.includes("fighter")) {
        preset = BIAS_PRESETS["terrorist"];
    }

    const results = [];

    for (let i = 0; i < count; i++) {
        const tags = {};

        // Generate tags based on probabilities
        for (const [category, distribution] of Object.entries(preset)) {
            const rand = Math.random();
            let cumulative = 0;
            for (const [tag, prob] of Object.entries(distribution)) {
                cumulative += prob;
                if (rand < cumulative) {
                    tags[category] = tag;
                    break;
                }
            }
            // Fallback if rounding errors prevent selection
            if (!tags[category]) tags[category] = Object.keys(distribution)[0];
        }

        // Assign archetype image based on preset
        let imagePath = null;
        if (lowerPrompt.includes("ceo")) imagePath = "/images/ceo.png";
        else if (lowerPrompt.includes("nurse")) imagePath = "/images/nurse.png";
        else if (lowerPrompt.includes("terrorist")) imagePath = "/images/terrorist.png";

        results.push({
            id: i,
            prompt,
            tags,
            image: imagePath,
            // Placeholder image color based on gender for visual distinction
            color: tags.gender === 'female' ? '#ffcccb' : '#add8e6'
        });
    }

    return results;
};
