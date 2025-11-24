import React, { useState, useRef } from 'react';
import { Upload, Wand2, Loader2, Save, X, Sparkles } from 'lucide-react';
import { editImage } from '../services/geminiService';

const SUGGESTIONS = [
  { 
    category: "Art Styles", 
    prompts: ["Make it a watercolor painting", "Convert to pixel art", "Cyberpunk style", "Vintage retro photo", "Pencil sketch", "Oil painting", "Pop art style"] 
  },
  { 
    category: "Lighting & Atmosphere", 
    prompts: ["Add cinematic lighting", "Golden hour sunlight", "Neon noir atmosphere", "Dramatic studio lighting", "Soft foggy mist", "Bioluminescent glow"] 
  },
  { 
    category: "Creative Edits", 
    prompts: ["Make it underwater", "Set in outer space", "Turn into a marble statue", "Add floating particles", "Make it black and white", "Glitch effect"] 
  }
];

export const ImageStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;
    setIsProcessing(true);
    try {
      // Use the result image if available for chained edits
      const sourceImage = resultImage || selectedImage;
      const newImage = await editImage(sourceImage, prompt);
      setResultImage(newImage);
      setPrompt('');
    } catch (e) {
      console.error(e);
      alert('Failed to edit image. Try a simpler prompt.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `brandforge-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wand2 className="text-brand-500" />
          Nano Banana Studio
        </h2>
        <div className="flex gap-2">
          {selectedImage && (
             <button 
               onClick={() => { setSelectedImage(null); setResultImage(null); }}
               className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
               title="Clear Image"
             >
               <X size={20} />
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center relative overflow-hidden min-h-[300px] lg:min-h-0 group">
           {!selectedImage ? (
             <div className="text-center">
               <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
               <p className="text-gray-400 mb-4">Upload an image to start editing</p>
               <input
                 type="file"
                 ref={fileInputRef}
                 className="hidden"
                 accept="image/*"
                 onChange={handleFileChange}
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
               >
                 Select Image
               </button>
             </div>
           ) : (
             <div className="relative w-full h-full p-4 flex items-center justify-center bg-gray-900/50">
                <img 
                  src={resultImage || selectedImage} 
                  alt="Workspace" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
                {resultImage && (
                  <button
                    onClick={handleSave}
                    className="absolute bottom-6 right-6 bg-gray-900/80 hover:bg-brand-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    title="Download Image"
                  >
                    <Save size={20} />
                  </button>
                )}
             </div>
           )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col h-[400px] lg:h-auto">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-brand-400" />
            Edit Instructions
          </h3>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your edit (e.g., 'Add a neon glow', 'Make it look like a sketch')"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm h-24 resize-none focus:border-brand-500 outline-none transition-colors placeholder-gray-600"
              />
              <button
                onClick={handleEdit}
                disabled={!selectedImage || isProcessing || !prompt}
                className={`mt-2 w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  !selectedImage || isProcessing || !prompt
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                {isProcessing ? 'Processing...' : 'Apply Edit'}
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 sticky top-0 bg-gray-800 py-2">Suggested Actions</p>
               <div className="space-y-5">
                  {SUGGESTIONS.map((group) => (
                    <div key={group.category}>
                        <h4 className="text-xs font-medium text-brand-300 mb-2">{group.category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {group.prompts.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPrompt(p)}
                                    className="text-[11px] leading-relaxed bg-gray-750 hover:bg-gray-700 hover:text-brand-300 text-gray-300 px-3 py-1.5 rounded-md border border-gray-700 hover:border-brand-500/30 transition-all text-left"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};