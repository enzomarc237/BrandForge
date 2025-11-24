import React, { useState } from 'react';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { ImageAspectRatio, ImageSize } from '../types';

interface Props {
  isGenerating: boolean;
  onGenerate: (mission: string, ratio: ImageAspectRatio, size: ImageSize) => void;
}

const TEMPLATES = [
  {
    label: "Tech Startup",
    text: "A cutting-edge SaaS platform designed to automate workflow for remote engineering teams using AI. The vibe is futuristic, sleek, and reliable, targeting enterprise CTOs."
  },
  {
    label: "Eco Cafe",
    text: "A zero-waste coffee shop offering organic, fair-trade blends in a cozy, biophilic space. The aesthetic is earthy, raw, and minimalist, appealing to eco-conscious millennials."
  },
  {
    label: "Wellness App",
    text: "A holistic wellness app combining yoga, meditation, and nutrition tracking. The brand voice is empathetic, calming, and empowering for busy professionals seeking balance."
  },
  {
    label: "Luxury Fashion",
    text: "A high-end bespoke tailoring service using heritage fabrics with a modern twist. The look is sophisticated, timeless, and exclusive, aimed at modern gentlemen."
  }
];

export const GeneratorForm: React.FC<Props> = ({ isGenerating, onGenerate }) => {
  const [mission, setMission] = useState('');
  const [ratio, setRatio] = useState<ImageAspectRatio>(ImageAspectRatio.SQUARE);
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mission.trim()) {
      onGenerate(mission, ratio, size);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-12 px-6 pb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500">Brand Identity</span>
        </h1>
        <p className="text-xl text-gray-400">
          Describe your mission, and our AI will build your entire visual language.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-2xl p-2 shadow-2xl">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0 mr-2">
              <Lightbulb size={14} />
              <span>Templates:</span>
            </div>
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setMission(t.text)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-brand-400 text-xs text-gray-300 hover:text-white transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="e.g. A sustainable coffee roaster based in Portland that focuses on direct trade and compostable packaging. The vibe is rustic, warm, and inviting..."
            className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none min-h-[140px] leading-relaxed"
            disabled={isGenerating}
          />
        </div>
        
        <div className="bg-gray-900/50 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 border-t border-gray-700">
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <select 
              value={ratio}
              onChange={(e) => setRatio(e.target.value as ImageAspectRatio)}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none hover:border-brand-500 transition-colors cursor-pointer"
            >
              {Object.values(ImageAspectRatio).map(r => (
                 <option key={r} value={r}>Aspect: {r}</option>
              ))}
            </select>

            <select 
              value={size}
              onChange={(e) => setSize(e.target.value as ImageSize)}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none hover:border-brand-500 transition-colors cursor-pointer"
            >
              {Object.values(ImageSize).map(s => (
                 <option key={s} value={s}>Res: {s}</option>
              ))}
            </select>
          </div>

          <div className="flex-grow"></div>

          <button
            type="submit"
            disabled={isGenerating || !mission.trim()}
            className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              isGenerating || !mission.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transform hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Crafting Brand...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate Identity</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
           <h3 className="font-bold text-white mb-2 flex items-center gap-2">
             <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
             Strategy & Voice
           </h3>
           <p className="text-sm text-gray-400">Gemini 3 Pro defines your brand's core identity, tone of voice, and messaging strategy with deep reasoning.</p>
        </div>
        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
           <h3 className="font-bold text-white mb-2 flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
             Visual Identity
           </h3>
           <p className="text-sm text-gray-400">Generates 5 distinct logo concepts and an 8-color palette tailored to your mission statement.</p>
        </div>
        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
           <h3 className="font-bold text-white mb-2 flex items-center gap-2">
             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
             Market Analysis
           </h3>
           <p className="text-sm text-gray-400">Leverage Gemini Grounding to research competitors and ensure your brand stands out in the current market.</p>
        </div>
      </div>
    </div>
  );
};