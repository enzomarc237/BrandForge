import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle } from 'lucide-react';

interface Props {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<Props> = ({ onKeySelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectKey = async () => {
    if (isSelecting) return;
    setIsSelecting(true);
    setError(null);

    try {
      if ((window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
        // Prompt guidance suggests assuming success to avoid race condition
        onKeySelected();
      } else {
        // Fallback or dev environment
        if (process.env.API_KEY) {
           onKeySelected();
        } else {
           setError("No API Key environment found. Please check your configuration.");
        }
      }
    } catch (e: any) {
      console.error("Key selection error:", e);
      if (e.message && e.message.includes("Requested entity was not found")) {
        setError("Key selection failed. Please try creating a new project or selecting a different one.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSelecting(false);
    }
  };

  useEffect(() => {
    const checkKey = async () => {
       try {
         if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
           onKeySelected();
         } else if (!(window as any).aistudio && process.env.API_KEY) {
           onKeySelected();
         }
       } catch (e) {
         // Silent failure on check, wait for user interaction
         console.warn("Auto-check for key failed", e);
       }
    };
    checkKey();
  }, [onKeySelected]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-blue-500"></div>

        <div className="mx-auto bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-1 ring-gray-600">
          <Key className="w-10 h-10 text-brand-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3 text-white">API Key Required</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          To use Gemini 3 Pro and Image Generation features, please select a valid API key associated with a paid Google Cloud project.
        </p>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSelectKey}
          disabled={isSelecting}
          className={`w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3 px-6 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 ${isSelecting ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isSelecting ? 'Connecting...' : 'Select API Key'}
        </button>
        
        <div className="mt-8 border-t border-gray-700/50 pt-4">
          <p className="text-xs text-gray-500">
            Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      </div>
    </div>
  );
};