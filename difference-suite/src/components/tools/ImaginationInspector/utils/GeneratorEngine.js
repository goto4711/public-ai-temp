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
    "professor": {
        gender: { male: 0.8, female: 0.2 },
        race: { white: 0.85, asian: 0.1, black: 0.05 },
        age: { old: 0.9, middle_aged: 0.1 },
        style: { tweed: 0.9, formal: 0.1 },
        setting: { library: 0.6, blackboard: 0.4 }
    },
    "criminal": {
        gender: { male: 0.95, female: 0.05 },
        race: { black: 0.45, hispanic: 0.35, white: 0.2 },
        age: { young: 0.8, middle_aged: 0.2 },
        style: { hoodie: 0.9 },
        setting: { street_night: 0.8, mugshot: 0.2 }
    },
    "worker": {
        gender: { male: 0.9, female: 0.1 },
        race: { white: 0.6, hispanic: 0.3, black: 0.1 },
        age: { middle_aged: 0.7, young: 0.3 },
        style: { vest: 0.8, overalls: 0.2 },
        setting: { construction: 0.9, factory: 0.1 }
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
    let presetKey = "default";

    // Simple keyword matching for bias presets
    if (lowerPrompt.includes("ceo") || lowerPrompt.includes("executive") || lowerPrompt.includes("boss")) {
        presetKey = "ceo";
    } else if (lowerPrompt.includes("nurse") || lowerPrompt.includes("caregiver")) {
        presetKey = "nurse";
    } else if (lowerPrompt.includes("terrorist") || lowerPrompt.includes("fighter")) {
        presetKey = "terrorist";
    } else if (lowerPrompt.includes("professor") || lowerPrompt.includes("academic") || lowerPrompt.includes("teacher")) {
        presetKey = "professor";
    } else if (lowerPrompt.includes("criminal") || lowerPrompt.includes("thief") || lowerPrompt.includes("suspect")) {
        presetKey = "criminal";
    } else if (lowerPrompt.includes("worker") || lowerPrompt.includes("laborer") || lowerPrompt.includes("construction")) {
        presetKey = "worker";
    }

    const preset = BIAS_PRESETS[presetKey];
    const results = [];

    // Map presets to archetype images
    const archetypeMap = {
        "ceo": "/images/ceo_archetype.png",
        "nurse": "/images/nurse_archetype.png",
        "terrorist": "/images/terrorist_archetype.png",
        "professor": "/images/professor_archetype.png",
        "criminal": "/images/criminal_archetype.png",
        "worker": "/images/worker_archetype.png",
        "default": null
    };

    // Find best matching archetype even if we are using default preset logic but prompt matches partially
    let imagePath = archetypeMap[presetKey];

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
            if (!tags[category]) tags[category] = Object.keys(distribution)[0];
        }

        // Construct synthetic prompt
        const syntheticPrompt = `A hyper-realistic photo of a ${tags.age.replace('_', ' ')} ${tags.race} ${tags.gender} ${prompt}, wearing ${tags.style}, inside ${tags.setting.replace('_', ' ')}, detailed, 8k.`;

        results.push({
            id: i,
            prompt,
            tags,
            syntheticPrompt, // New field for UI
            image: imagePath,
            color: tags.gender === 'female' ? '#ffcccb' : '#add8e6' // Fallback color
        });
    }

    return results;
};
