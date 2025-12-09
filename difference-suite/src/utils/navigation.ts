import {
    Search,
    Share2,
    Clock,
    Zap,
    Layers,
    AlertTriangle,
    Image as ImageIcon,
    Sliders,
    FileText
} from 'lucide-react';

export const TOOLS = [
    {
        path: '/detail-extractor',
        label: 'Detail Extractor',
        icon: Search,
        description: 'Analyze and extract fine-grained details from images.'
    },
    {
        path: '/context-weaver',
        label: 'Context Weaver',
        icon: Share2,
        description: 'Weave together context from multiple sources.'
    },
    {
        path: '/discontinuity-detector',
        label: 'Discontinuity Detector',
        icon: Clock,
        description: 'Detect temporal and spatial discontinuities.'
    },
    {
        path: '/ambiguity-amplifier',
        label: 'Ambiguity Amplifier',
        icon: Zap,
        description: 'Amplify ambiguous elements in the data stream.'
    },
    {
        path: '/latent-navigator',
        label: 'Latent Space Navigator',
        icon: Layers,
        description: 'Navigate through the latent space of the model.'
    },
    {
        path: '/glitch-detector',
        label: 'Glitch Detector',
        icon: AlertTriangle,
        description: 'Identify and analyze system glitches.'
    },
    {
        path: '/noise-predictor',
        label: 'Noise Predictor',
        icon: ImageIcon,
        description: 'Predict and visualize noise patterns.'
    },
    {
        path: '/threshold-adjuster',
        label: 'Threshold Adjuster',
        icon: Sliders,
        description: 'Fine-tune detection thresholds.'
    },
    {
        path: '/deep-vector-mirror',
        label: 'Deep Vector Mirror',
        icon: Layers,
        description: ' Visualize deep learning vectorization.'
    },
    {
        path: '/networked-narratives',
        label: 'Networked Narratives',
        icon: FileText,
        description: 'Explore narrative structures in networked data.'
    },
];
