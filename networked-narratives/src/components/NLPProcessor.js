import nlp from 'compromise';

export class NLPProcessor {
    constructor() {
        this.text = "";
    }

    process(text) {
        this.text = text;
        const doc = nlp(text);

        // Custom Lexicon for the Demo to ensure robust detection
        const customEntities = [
            { text: 'Normandy', type: 'place' },
            { text: 'Paris', type: 'place' },
            { text: 'Lyon', type: 'place' },
            { text: 'London', type: 'place' },
            { text: 'French Resistance', type: 'org' },
            { text: 'Gestapo', type: 'org' },
            { text: 'Allies', type: 'org' },
            { text: 'Nazi occupation', type: 'org' },
            { text: 'Jean Moulin', type: 'person' },
            { text: 'Charles de Gaulle', type: 'person' },
            { text: 'General Eisenhower', type: 'person' }
        ];

        // Extract Entities from NLP
        const people = doc.people().out('array');
        const places = doc.places().out('array');
        const orgs = doc.organizations().out('array');

        // Create Nodes
        const nodes = [];
        const nodeMap = new Map();

        const addNode = (name, type) => {
            const id = name.toLowerCase().trim();
            if (!nodeMap.has(id)) {
                const node = { id, name, type, val: 1 };
                nodes.push(node);
                nodeMap.set(id, node);
            } else {
                nodeMap.get(id).val += 1; // Increase size for frequency
            }
            return id;
        };

        // Add entities detected by compromise
        people.forEach(p => addNode(p, 'person'));
        places.forEach(p => addNode(p, 'place'));
        orgs.forEach(p => addNode(p, 'org'));

        // Add custom entities if they appear in the text (case-insensitive)
        const lowerText = text.toLowerCase();
        customEntities.forEach(ent => {
            if (lowerText.includes(ent.text.toLowerCase())) {
                addNode(ent.text, ent.type);
            }
        });

        // Extract Relations (Co-occurrence in sentences)
        const links = [];
        const sentences = doc.sentences().out('array');

        sentences.forEach(sentence => {
            const sDoc = nlp(sentence);
            const sPeople = sDoc.people().out('array');
            const sPlaces = sDoc.places().out('array');
            const sOrgs = sDoc.organizations().out('array');

            const entities = [...sPeople, ...sPlaces, ...sOrgs];

            // Link all entities in the same sentence
            for (let i = 0; i < entities.length; i++) {
                for (let j = i + 1; j < entities.length; j++) {
                    const source = entities[i].toLowerCase().trim();
                    const target = entities[j].toLowerCase().trim();

                    if (nodeMap.has(source) && nodeMap.has(target)) {
                        links.push({ source, target });
                    }
                }
            }
        });

        return { nodes, links };
    }
}
