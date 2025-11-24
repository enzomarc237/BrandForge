import React, { useState, useRef } from 'react';
import { Upload, ScanEye, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

export const Analyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzeImage(
        image, 
        "Analyze this image from a brand perspective. What is the color palette? What is the mood/vibe? What font styles would match this?"
      );
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-700 min-h-[400px]">
        {image ? (
          <img src={image} alt="Analyze" className="max-h-[500px] w-auto object-contain rounded-lg shadow-lg mb-6" />
        ) : (
          <div className="text-center p-12">
            <ScanEye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Upload a logo or moodboard to analyze</p>
          </div>
        )}
        
        <input type="file" ref={inputRef} onChange={handleFile} className="hidden" accept="image/*" />
        
        <div className="flex gap-4">
          <button 
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            {image ? 'Change Image' : 'Select Image'}
          </button>
          
          {image && (
            <button 
              onClick={runAnalysis}
              disabled={loading}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ScanEye size={18} />}
              Analyze Brand Style
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-8 overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">Analysis Results</h3>
        {analysis ? (
          <div className="prose prose-invert">
            <p className="whitespace-pre-wrap leading-relaxed text-gray-300">{analysis}</p>
          </div>
        ) : (
          <div className="text-gray-600 italic">
            {loading ? 'Gemini 3 Pro is analyzing visual elements...' : 'Results will appear here...'}
          </div>
        )}
      </div>
    </div>
  );
};
