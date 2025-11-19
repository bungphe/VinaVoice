import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  audioContext: AudioContext | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, audioContext }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for managing audio playback logic
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
      setProgress(0);
      setIsPlaying(false);
      pauseTimeRef.current = 0;
      startTimeRef.current = 0;
      
      if (audioContext) {
        // Initialize gain node for volume control
        gainNodeRef.current = audioContext.createGain();
        gainNodeRef.current.connect(audioContext.destination);
      }
    }
    
    return () => {
      stopAudio();
    };
  }, [audioBuffer, audioContext]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore error if already stopped
      }
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const updateProgress = () => {
    if (!audioContext || !isPlaying) return;

    const currentTime = audioContext.currentTime;
    const elapsedTime = currentTime - startTimeRef.current;
    
    // If played till end
    if (elapsedTime >= (audioBuffer?.duration || 0)) {
      setIsPlaying(false);
      setProgress(0);
      pauseTimeRef.current = 0;
      stopAudio();
    } else {
      setProgress(elapsedTime);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handlePlayPause = () => {
    if (!audioContext || !audioBuffer) return;

    // Resume context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (isPlaying) {
      // Pause
      stopAudio();
      // Calculate where we stopped. Current AudioContext time minus start time
      pauseTimeRef.current = audioContext.currentTime - startTimeRef.current;
    } else {
      // Play
      sourceNodeRef.current = audioContext.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      
      if (gainNodeRef.current) {
        sourceNodeRef.current.connect(gainNodeRef.current);
      }

      // If buffer ended previously, restart
      if (pauseTimeRef.current >= audioBuffer.duration) {
        pauseTimeRef.current = 0;
      }

      // Start playback at the paused offset
      sourceNodeRef.current.start(0, pauseTimeRef.current);
      
      // Record when the *segment* started playing in AudioContext timeline
      // To calculate current progress: (CTX.currentTime - startTime) = progress
      // So startTime = CTX.currentTime - currentProgress
      startTimeRef.current = audioContext.currentTime - pauseTimeRef.current;

      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleRestart = () => {
    stopAudio();
    pauseTimeRef.current = 0;
    setProgress(0);
    handlePlayPause();
  };

  const handleToggleMute = () => {
    if (gainNodeRef.current) {
      if (isMuted) {
        gainNodeRef.current.gain.value = 1;
        setIsMuted(false);
      } else {
        gainNodeRef.current.gain.value = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioBuffer) {
    return (
      <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
        Chưa có dữ liệu âm thanh
      </div>
    );
  }

  const progressPercentage = (progress / duration) * 100 || 0;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
      {/* Visualization Bar (Simulated) */}
      <div className="h-16 flex items-center justify-center space-x-1 mb-6 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-300 ease-in-out ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ 
              height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '20%',
              opacity: isPlaying ? 1 : 0.5
            }}
          ></div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative w-full h-1.5 bg-slate-700 rounded-full cursor-pointer overflow-hidden">
           <div 
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
             style={{ width: `${progressPercentage}%` }}
           />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={handleToggleMute}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="flex items-center space-x-6">
          <button 
            onClick={handleRestart}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="w-14 h-14 bg-white rounded-full text-indigo-900 flex items-center justify-center hover:scale-105 hover:bg-indigo-50 transition-all shadow-lg shadow-white/10"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        <div className="w-5"></div> {/* Spacer for balance */}
      </div>
    </div>
  );
};