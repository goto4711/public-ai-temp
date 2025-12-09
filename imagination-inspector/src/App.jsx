import React, { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import PromptInput from './components/PromptInput';
import GenerationGrid from './components/GenerationGrid';
import AbsenceReport from './components/AbsenceReport';
import { generateImages } from './utils/GeneratorEngine';
import { analyzeBias } from './utils/BiasAnalyzer';

function App() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResults([]);
    setReport(null);

    try {
      const generated = await generateImages(prompt);
      setResults(generated);

      const analysis = analyzeBias(generated);
      setReport(analysis);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-2 border-b-4 border-[var(--color-main)] pb-6">
        <h1 className="text-5xl font-bold text-[var(--color-main)] uppercase tracking-tighter flex items-center gap-4">
          <Eye size={48} />
          The Imagination Inspector
        </h1>
        <p className="text-lg font-mono opacity-80 max-w-2xl">
          "To see what the machine <span className="font-bold text-[var(--color-main)]">cannot</span> imagine."
          <br />
          Probing the absences and boundaries of the latent space.
        </p>
      </header>

      <main className="flex flex-col gap-8">
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          loading={loading}
        />

        {loading && (
          <div className="flex items-center justify-center py-12 animate-pulse text-[var(--color-main)] font-mono text-xl gap-2">
            <Sparkles className="animate-spin" /> Dreaming of "{prompt}"...
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <GenerationGrid results={results} />
            <AbsenceReport report={report} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
