import React from 'react';
import { BookOpen, Mic } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">VinaVoice</h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Sách Nói AI thông minh</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 flex items-center border border-slate-200">
             <Mic size={12} className="mr-1.5 text-indigo-500" />
             Gemini 2.5 Flash TTS
           </span>
        </div>
      </div>
    </header>
  );
};