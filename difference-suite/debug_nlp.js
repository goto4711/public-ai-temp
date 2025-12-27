import nlp from 'compromise';

const text = "The old detective walked into the room. In the center stood a dark wooden table, weathered by centuries of use. On top of it, catching the single ray of sunlight, lay a golden key. He knew this key would unlock the mystery of the manor.";

const doc = nlp(text);

const topics = doc.topics().out('array');
const nouns = doc.nouns().out('array');

// Merge and filter
const concepts = [...new Set([...topics, ...nouns])].filter(c => {
    const lower = c.toLowerCase();
    if (lower.length < 3) return false;
    const stops = ['the', 'and', 'from', 'that', 'with', 'this', 'what', 'where', 'when', 'there'];
    if (stops.includes(lower)) return false;
    return true;
});

console.log("Raw Topics:", topics);
console.log("Raw Nouns:", nouns);
console.log("Filtered Concepts:", concepts);
