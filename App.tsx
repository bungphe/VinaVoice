import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { ControlPanel } from './components/ControlPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioHelpers';
import { VoiceName, ReadingStyle } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';

const SAMPLE_RATE = 24000;

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [style, setStyle] = useState<ReadingStyle>(ReadingStyle.Expressive);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Context ref (created on user interaction to adhere to browser policies)
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: SAMPLE_RATE });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    initializeAudioContext();
    setIsLoading(true);
    setError(null);
    setAudioBuffer(null); // Reset current audio

    try {
      // Pass the selected style to the service
      const base64Audio = await generateSpeech(text, voice, style);
      
      if (!base64Audio) {
        throw new Error("Không nhận được dữ liệu âm thanh từ AI.");
      }

      if (audioContextRef.current) {
        const decodedBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContextRef.current,
          SAMPLE_RATE,
          1
        );
        setAudioBuffer(decodedBuffer);
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo âm thanh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Nhập nội dung sách
            </h2>
            <TextInput 
              value={text} 
              onChange={setText} 
              placeholder="Dán nội dung văn bản hoặc tải lên file PDF/TXT để bắt đầu..." 
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Column: Controls & Player */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Settings Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">2</span>
              Cấu hình giọng đọc
            </h2>
            <ControlPanel 
              selectedVoice={voice} 
              onVoiceChange={setVoice}
              selectedStyle={style}
              onStyleChange={setStyle}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              hasText={!!text.trim()}
            />
             {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Audio Player Panel */}
          <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-opacity duration-300 ${audioBuffer ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">3</span>
              Nghe Sách Nói
            </h2>
            
            {isLoading ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                <p>Đang phân tích ngữ cảnh và tạo audio...</p>
              </div>
            ) : (
              <AudioPlayer 
                audioBuffer={audioBuffer} 
                audioContext={audioContextRef.current} 
              />
            )}
          </div>

          {/* Info Card */}
          <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <h3 className="text-indigo-900 font-medium mb-2">Công nghệ Gemini Context-Aware</h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              VinaVoice sử dụng Gemini 2.5 để phân tích nội dung văn bản, tự động điều chỉnh ngữ điệu (lên/xuống giọng) phù hợp với cảm xúc của câu chuyện.
            </p>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        Powered by Google Gemini 2.5 Flash TTS
      </footer>
    </div>
  );
};

export default App;