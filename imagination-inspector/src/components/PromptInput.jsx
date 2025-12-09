import React from 'react';
import { Search } from 'lucide-react';

const PromptInput = ({ prompt, setPrompt, onGenerate, loading }) => {
    return (
        <div className="card flex flex-col gap-2">
            <label className="text-sm font-bold uppercase text-[var(--color-main)]">
                Probe the Latent Space
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Enter a concept (e.g., "CEO", "Nurse", "Terrorist")...'
                    className="flex-1 p-4 border-2 border-[var(--color-main)] font-mono text-lg focus:outline-none focus:bg-[var(--color-main-secondary)]/20"
                    onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                />
                <button
                    onClick={onGenerate}
                    disabled={loading || !prompt.trim()}
                    className="btn-primary text-xl px-8"
                >
                    {loading ? 'Scanning...' : <Search />}
                </button>
            </div>
        </div>
    );
};

export default PromptInput;
