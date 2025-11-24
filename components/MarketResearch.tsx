import React, { useState } from 'react';
import { Search, ExternalLink, Loader2, Globe } from 'lucide-react';
import { searchMarket } from '../services/geminiService';
import { SearchResult } from '../types';

export const MarketResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; links: SearchResult[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchMarket(query);
      setResults(data);
    } catch (e) {
      console.error(e);
      // Basic error handling visual
      setResults({ text: "Failed to fetch research data.", links: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
           <Globe className="text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Market Intelligence</h2>
        <p className="text-gray-400">Powered by Google Search & Gemini 2.5 Flash Grounding</p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative">
        <input
           type="text"
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           placeholder="Research competitors (e.g., 'Top sustainable sneaker brands 2025')"
           className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-lg shadow-xl"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Analyze'}
        </button>
      </form>

      {results && (
        <div className="animate-fade-in space-y-8">
           <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
             <h3 className="text-xl font-semibold text-white mb-4">Summary</h3>
             <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{results.text}</p>
             </div>
           </div>

           {results.links.length > 0 && (
             <div>
               <h3 className="text-lg font-semibold text-gray-400 mb-4 uppercase text-xs tracking-wider">Sources & Competitors</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {results.links.map((link, idx) => (
                   <a 
                     key={idx} 
                     href={link.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="block p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-lg transition-all group"
                   >
                     <div className="flex items-start justify-between">
                       <div>
                         <h4 className="font-medium text-blue-400 group-hover:text-blue-300 truncate max-w-[250px]">
                           {link.title}
                         </h4>
                         <p className="text-xs text-gray-500 mt-1 truncate max-w-[250px]">{link.url}</p>
                       </div>
                       <ExternalLink size={16} className="text-gray-600 group-hover:text-white" />
                     </div>
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
