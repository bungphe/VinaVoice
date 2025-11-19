import React from 'react';
import { VoiceName, VOICE_OPTIONS, ReadingStyle, STYLE_OPTIONS } from '../types';
import { Wand2, Check, Volume2, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  selectedStyle: ReadingStyle;
  onStyleChange: (style: ReadingStyle) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasText: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedVoice,
  onVoiceChange,
  selectedStyle,
  onStyleChange,
  onGenerate,
  isLoading,
  hasText,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Style Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center">
          <Sparkles size={14} className="mr-1.5 text-indigo-500" />
          Phong cách đọc (Ngữ cảnh)
        </label>
        <select
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value as ReadingStyle)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          {STYLE_OPTIONS.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 px-1">
          {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.description}
        </p>
      </div>

      {/* Voice Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 block">Chọn giọng đọc</label>
        <div className="grid grid-cols-1 gap-3">
          {VOICE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onVoiceChange(option.id)}
              disabled={isLoading}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left w-full group ${
                selectedVoice === option.id
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${selectedVoice === option.id ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                   <Volume2 size={18} />
                </div>
                <div>
                  <p className={`font-medium text-sm ${selectedVoice === option.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {option.name}
                  </p>
                  <p className={`text-xs ${selectedVoice === option.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {option.gender} • {option.description}
                  </p>
                </div>
              </div>
              {selectedVoice === option.id && (
                <Check size={16} className="text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isLoading || !hasText}
          className={`w-full py-3.5 px-6 rounded-xl flex items-center justify-center font-semibold text-white shadow-md transition-all duration-200 transform active:scale-[0.98] ${
            isLoading || !hasText
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <>
              <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              Đang xử lý...
            </>
          ) : (
            <>
              <Wand2 size={20} className="mr-2" />
              Chuyển đổi thành Audio
            </>
          )}
        </button>
      </div>
    </div>
  );
};