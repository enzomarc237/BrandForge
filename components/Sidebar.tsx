import React from 'react';
import { 
  Palette, 
  Wand2, 
  Image as ImageIcon, 
  MessageSquare, 
  Search, 
  ScanEye 
} from 'lucide-react';
import { AppView } from '../types';

interface Props {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Sidebar: React.FC<Props> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: AppView.GENERATOR, label: 'Generator', icon: Wand2 },
    { id: AppView.BIBLE, label: 'Brand Bible', icon: Palette },
    { id: AppView.STUDIO, label: 'Image Studio', icon: ImageIcon },
    { id: AppView.ANALYZER, label: 'Visual Analyzer', icon: ScanEye },
    { id: AppView.RESEARCH, label: 'Market Research', icon: Search },
    { id: AppView.CHAT, label: 'Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col items-center lg:items-stretch py-6 z-20">
      <div className="flex items-center gap-3 px-0 lg:px-6 mb-8 justify-center lg:justify-start">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex-shrink-0"></div>
        <span className="text-xl font-bold text-white hidden lg:block">BrandForge</span>
      </div>

      <nav className="flex-1 space-y-2 w-full px-2 lg:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-400' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-medium hidden lg:block ${isActive ? 'text-brand-400' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 hidden lg:block"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-800 rounded-lg p-3 hidden lg:block">
           <p className="text-xs text-gray-500 mb-2">Powered by</p>
           <div className="flex items-center gap-2 text-white font-semibold text-sm">
             <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
             Gemini 2.5 & 3.0
           </div>
        </div>
      </div>
    </div>
  );
};