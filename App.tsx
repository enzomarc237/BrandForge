import React, { useState } from 'react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { Sidebar } from './components/Sidebar';
import { GeneratorForm } from './components/GeneratorForm';
import { BrandBible } from './components/BrandBible';
import { ImageStudio } from './components/ImageStudio';
import { ChatAssistant } from './components/ChatAssistant';
import { MarketResearch } from './components/MarketResearch';
import { Analyzer } from './components/Analyzer';
import { generateBrandStrategy } from './services/geminiService';
import { AppView, BrandStrategy, ImageAspectRatio, ImageSize } from './types';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.GENERATOR);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Brand Data
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  // We store the selected config to pass to BrandBible for image generation
  const [generationConfig, setGenerationConfig] = useState<{ratio: ImageAspectRatio, size: ImageSize}>({
    ratio: ImageAspectRatio.SQUARE,
    size: ImageSize.SIZE_1K
  });

  const handleGenerate = async (mission: string, ratio: ImageAspectRatio, size: ImageSize) => {
    setIsGenerating(true);
    try {
      setGenerationConfig({ ratio, size });
      // 1. Generate Strategy (JSON) including 5 logo concepts, 8 colors, etc.
      const strat = await generateBrandStrategy(mission);
      setStrategy(strat);
      
      // Move to result view immediately. 
      // The BrandBible component handles generating the images for the first concept on mount.
      setCurrentView(AppView.BIBLE);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Something went wrong during generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelected={() => setHasApiKey(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 relative overflow-hidden bg-gray-900">
        {currentView === AppView.GENERATOR && (
          <GeneratorForm isGenerating={isGenerating} onGenerate={handleGenerate} />
        )}

        {currentView === AppView.BIBLE && strategy && (
          <BrandBible 
            strategy={strategy} 
            initialRatio={generationConfig.ratio}
            initialSize={generationConfig.size}
          />
        )}
        
        {currentView === AppView.BIBLE && !strategy && (
           <div className="h-full flex items-center justify-center text-gray-500">
             No brand generated yet. Go to Generator.
           </div>
        )}

        {currentView === AppView.STUDIO && <ImageStudio />}
        
        {currentView === AppView.CHAT && <ChatAssistant />}

        {currentView === AppView.RESEARCH && <MarketResearch />}

        {currentView === AppView.ANALYZER && <Analyzer />}
      </main>
    </div>
  );
}

export default App;