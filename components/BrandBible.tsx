import React, { useState, useEffect } from 'react';
import { BrandStrategy, ImageAspectRatio, ImageSize } from '../types';
import { Download, Share2, Palette, Sparkles, Loader2, RefreshCcw, Settings2, Check } from 'lucide-react';
import { generateBrandImage } from '../services/geminiService';
import { IMAGE_GENERATION_MODELS } from '../constants';

interface Props {
  strategy: BrandStrategy;
  initialRatio: ImageAspectRatio;
  initialSize: ImageSize;
}

export const BrandBible: React.FC<Props> = ({ strategy, initialRatio, initialSize }) => {
  const [activeLogoConcept, setActiveLogoConcept] = useState(0);
  const [logoImages, setLogoImages] = useState<Record<number, { primary: string | null; secondary: string | null }>>({});
  const [loadingLogos, setLoadingLogos] = useState<Record<number, boolean>>({});
  const [selectedModel, setSelectedModel] = useState(IMAGE_GENERATION_MODELS[0].id);
  const [regeneratingSpecific, setRegeneratingSpecific] = useState<Record<string, boolean>>({}); // key: "index-type"
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLogosForConcept = async (index: number) => {
    if (loadingLogos[index] || (logoImages[index]?.primary && logoImages[index]?.secondary)) return;

    setLoadingLogos(prev => ({ ...prev, [index]: true }));
    try {
      const concept = strategy.logoConcepts[index];
      const [primary, secondary] = await Promise.all([
        generateBrandImage(concept.primaryPrompt, initialRatio, initialSize, selectedModel),
        generateBrandImage(concept.secondaryPrompt, ImageAspectRatio.SQUARE, ImageSize.SIZE_1K, selectedModel)
      ]);
      setLogoImages(prev => ({
        ...prev,
        [index]: { primary, secondary }
      }));
    } catch (e) {
      console.error("Failed to generate logos for concept", index, e);
    } finally {
      setLoadingLogos(prev => ({ ...prev, [index]: false }));
    }
  };

  const regenerateSpecificImage = async (index: number, type: 'primary' | 'secondary') => {
    const key = `${index}-${type}`;
    if (regeneratingSpecific[key]) return;

    setRegeneratingSpecific(prev => ({ ...prev, [key]: true }));
    try {
      const concept = strategy.logoConcepts[index];
      const prompt = type === 'primary' ? concept.primaryPrompt : concept.secondaryPrompt;
      const ratio = type === 'primary' ? initialRatio : ImageAspectRatio.SQUARE;
      const size = type === 'primary' ? initialSize : ImageSize.SIZE_1K;

      const newImage = await generateBrandImage(prompt, ratio, size, selectedModel);

      setLogoImages(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [type]: newImage
        }
      }));
    } catch (e) {
      console.error(`Failed to regenerate ${type} logo`, e);
    } finally {
      setRegeneratingSpecific(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Construct a standalone HTML file
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${strategy.brandName} - Brand Bible</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px; background: #fff; }
            h1 { font-size: 3em; color: #111; margin-bottom: 0.2em; letter-spacing: -1px; }
            h2 { font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 40px; color: #333; }
            .tagline { font-size: 1.5em; color: #666; font-style: italic; margin-bottom: 40px; }
            .section { margin-bottom: 40px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
            .color-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .color-swatch { height: 120px; width: 100%; }
            .color-info { padding: 15px; }
            .color-hex { font-family: monospace; color: #888; display: block; margin-bottom: 5px; }
            .color-name { font-weight: bold; display: block; margin-bottom: 5px; }
            .color-usage { font-size: 0.9em; color: #555; }
            .typography-card { background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
            .font-header { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
            .font-body { font-size: 1.2em; }
            .logo-container { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; }
            .logo-card { flex: 1; min-width: 300px; border: 1px solid #eee; padding: 20px; border-radius: 8px; text-align: center; }
            .logo-card img { max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 15px; }
            .voice-badge { display: inline-block; background: #eee; padding: 5px 12px; border-radius: 20px; font-size: 0.9em; margin-right: 8px; }
            .copy-example { background: #f4f6f8; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; font-style: italic; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>${strategy.brandName}</h1>
          <div class="tagline">${strategy.tagline}</div>

          <div class="section">
            <h2>Brand Voice</h2>
            <p><strong>Tone:</strong> ${strategy.brandVoice.tone}</p>
            <div style="margin: 20px 0;">
              ${strategy.brandVoice.keywords.map(k => `<span class="voice-badge">${k}</span>`).join('')}
            </div>
            
            <h3>Website Copy</h3>
            <div class="copy-example">"${strategy.brandVoice.copyExamples.website}"</div>
            
            <h3>Social Media</h3>
            <div class="copy-example">"${strategy.brandVoice.copyExamples.social}"</div>
          </div>

          <div class="section">
            <h2>Color Palette</h2>
            <div class="grid">
              ${strategy.palette.map(c => `
                <div class="color-card">
                  <div class="color-swatch" style="background-color: ${c.hex}"></div>
                  <div class="color-info">
                    <span class="color-name">${c.name}</span>
                    <span class="color-hex">${c.hex}</span>
                    <div class="color-usage">${c.usage}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2>Typography</h2>
            <div class="typography-card">
              <h3>Header Font: ${strategy.typography.headerFont}</h3>
              <div class="font-header" style="font-family: sans-serif;">The quick brown fox jumps over the lazy dog</div>
            </div>
            <div class="typography-card">
              <h3>Body Font: ${strategy.typography.bodyFont}</h3>
              <div class="font-body" style="font-family: sans-serif;">
                abcdefghijklmnopqrstuvwxyz<br>
                1234567890<br>
                ${strategy.typography.reasoning}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Selected Visual Identity (${strategy.logoConcepts[activeLogoConcept].title})</h2>
            <p>${strategy.logoConcepts[activeLogoConcept].description}</p>
            
            <div class="logo-container">
              ${logoImages[activeLogoConcept]?.primary ? `
              <div class="logo-card">
                <h3>Primary Logo</h3>
                <img src="${logoImages[activeLogoConcept].primary}" alt="Primary Logo" />
                <p style="font-size: 0.8em; color: #888;">${strategy.logoConcepts[activeLogoConcept].primaryPrompt}</p>
              </div>` : ''}
              
              ${logoImages[activeLogoConcept]?.secondary ? `
              <div class="logo-card">
                <h3>Secondary Mark</h3>
                <img src="${logoImages[activeLogoConcept].secondary}" alt="Secondary Mark" />
                <p style="font-size: 0.8em; color: #888;">${strategy.logoConcepts[activeLogoConcept].secondaryPrompt}</p>
              </div>` : ''}
            </div>
          </div>
          
          <div style="margin-top: 60px; font-size: 0.8em; color: #888; text-align: center;">
            Generated by BrandForge AI
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${strategy.brandName.toLowerCase().replace(/\s+/g, '-')}-brand-bible.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    const text = `
Brand: ${strategy.brandName}
Tagline: ${strategy.tagline}

Voice: ${strategy.brandVoice.tone}
Keywords: ${strategy.brandVoice.keywords.join(', ')}

Palette:
${strategy.palette.map(c => `- ${c.name} (${c.hex}): ${c.usage}`).join('\n')}

Typography: ${strategy.typography.headerFont} & ${strategy.typography.bodyFont}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-generate the first concept on mount
  useEffect(() => {
    generateLogosForConcept(0);
  }, [strategy]);

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-8 space-y-12 pb-24">
      {/* Header */}
      <div className="border-b border-gray-700 pb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{strategy.brandName}</h1>
            <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400 font-medium">
              {strategy.tagline}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleShare}
               className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition flex items-center gap-2"
               title="Copy Summary"
             >
               {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
             </button>
             <button 
               onClick={handleExport}
               disabled={isExporting}
               className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
               title="Download HTML Bible"
             >
               {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
             </button>
          </div>
        </div>
      </div>

      {/* Brand Voice */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
            Brand Voice
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {strategy.brandVoice.tone}
          </p>
          <div className="flex flex-wrap gap-2">
            {strategy.brandVoice.keywords.map((keyword, i) => (
              <span key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-brand-300">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Website Copy</h3>
            <p className="text-white italic font-medium leading-relaxed">"{strategy.brandVoice.copyExamples.website}"</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Social Media</h3>
            <p className="text-white italic font-medium leading-relaxed">"{strategy.brandVoice.copyExamples.social}"</p>
          </div>
        </div>
      </section>

      {/* Logo Concepts */}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
            Logo Variations
          </h2>
          
          <div className="flex items-center gap-2 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
            <Settings2 size={16} className="text-gray-400 ml-2" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none py-1 pr-2"
            >
              {IMAGE_GENERATION_MODELS.map(model => (
                <option key={model.id} value={model.id} className="bg-gray-800">
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
          {strategy.logoConcepts.map((concept, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveLogoConcept(idx);
                // Trigger generation if not exists, otherwise user sees existing
                if (!logoImages[idx]) generateLogosForConcept(idx);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeLogoConcept === idx 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Var {idx + 1}: {concept.title}
            </button>
          ))}
        </div>

        {/* Selected Concept Display */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
           <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{strategy.logoConcepts[activeLogoConcept].title}</h3>
              <p className="text-gray-400">{strategy.logoConcepts[activeLogoConcept].description}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Primary Logo */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col relative group">
                <div className="flex justify-between mb-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500">Primary Logo</h3>
                </div>
                <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {loadingLogos[activeLogoConcept] && !logoImages[activeLogoConcept]?.primary ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="text-sm">Generating Concept...</span>
                    </div>
                  ) : regeneratingSpecific[`${activeLogoConcept}-primary`] ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="animate-spin text-orange-500" size={32} />
                      <span className="text-sm text-orange-500">Regenerating...</span>
                    </div>
                  ) : logoImages[activeLogoConcept]?.primary ? (
                    <>
                       <img src={logoImages[activeLogoConcept].primary!} alt="Primary" className="w-full h-full object-contain" />
                       <button 
                         onClick={() => regenerateSpecificImage(activeLogoConcept, 'primary')}
                         className="absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-orange-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                         title="Regenerate this specific image"
                       >
                         <RefreshCcw size={16} />
                       </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => generateLogosForConcept(activeLogoConcept)}
                      className="flex flex-col items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      <RefreshCcw size={32} />
                      <span className="text-sm">Generate Image</span>
                    </button>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500 font-mono line-clamp-2" title={strategy.logoConcepts[activeLogoConcept].primaryPrompt}>
                  {strategy.logoConcepts[activeLogoConcept].primaryPrompt}
                </p>
             </div>

             {/* Secondary Mark */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col relative group">
                <div className="flex justify-between mb-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500">Secondary Mark</h3>
                </div>
                <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {loadingLogos[activeLogoConcept] && !logoImages[activeLogoConcept]?.secondary ? (
                     <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="animate-spin" size={32} />
                    </div>
                  ) : regeneratingSpecific[`${activeLogoConcept}-secondary`] ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="animate-spin text-orange-500" size={32} />
                      <span className="text-sm text-orange-500">Regenerating...</span>
                    </div>
                  ) : logoImages[activeLogoConcept]?.secondary ? (
                    <>
                      <img src={logoImages[activeLogoConcept].secondary!} alt="Secondary" className="w-full h-full object-contain" />
                      <button 
                         onClick={() => regenerateSpecificImage(activeLogoConcept, 'secondary')}
                         className="absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-orange-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                         title="Regenerate this specific image"
                       >
                         <RefreshCcw size={16} />
                       </button>
                    </>
                  ) : (
                    <div className="text-gray-600">Waiting for generation...</div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500 font-mono line-clamp-2" title={strategy.logoConcepts[activeLogoConcept].secondaryPrompt}>
                  {strategy.logoConcepts[activeLogoConcept].secondaryPrompt}
                </p>
             </div>
           </div>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
           Extended Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {strategy.palette.map((color, idx) => (
            <div key={idx} className="group cursor-pointer bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div 
                className="h-32 w-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.hex }}
              ></div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{color.name}</h4>
                  <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded">{color.hex}</span>
                </div>
                <p className="text-xs text-gray-400 leading-tight border-t border-gray-700 pt-2 mt-2">
                  <span className="text-purple-400 font-semibold">Usage:</span> {color.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
           Typography
        </h2>
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 grid md:grid-cols-2 gap-12">
           <div>
             <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Header Font</h3>
             <p className="text-4xl text-white font-bold mb-4">{strategy.typography.headerFont}</p>
             <div className="space-y-2 text-gray-300">
               <p className="text-3xl font-bold">The quick brown fox</p>
               <p className="text-2xl font-bold">Jumps over the lazy dog</p>
             </div>
           </div>
           <div>
             <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Body Font</h3>
             <p className="text-xl text-white mb-4">{strategy.typography.bodyFont}</p>
             <div className="space-y-4 text-gray-300 leading-relaxed">
               <p>
                 Typeface selection is crucial for brand consistency. 
                 {strategy.typography.bodyFont} was chosen because {strategy.typography.reasoning}
               </p>
               <p className="text-sm opacity-70">
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                 abcdefghijklmnopqrstuvwxyz<br/>
                 1234567890 !@#$%^&*()
               </p>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};