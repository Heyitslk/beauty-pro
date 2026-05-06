
import React, { useState, useEffect, useRef } from 'react';
import { BRAND_ICONS } from '../constants';

interface RhythmTimerProps {
  onComplete?: () => void;
}

const RhythmTimer: React.FC<RhythmTimerProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tapGainRef = useRef<GainNode | null>(null);
  const musicIntervalRef = useRef<number | null>(null);

  const initAudio = (bpm: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    // --- ASMR SPONGE TAP ONLY ---
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(1, ctx.currentTime);
    tapGain.connect(ctx.destination);
    tapGainRef.current = tapGain;

    playRhythm(bpm);
  };

  const playRhythm = (bpm: number) => {
    if (!audioCtxRef.current || !tapGainRef.current) return;
    
    const ctx = audioCtxRef.current;
    const tGain = tapGainRef.current;
    const beatDuration = 60 / bpm;

    const scheduleNext = () => {
      const now = ctx.currentTime;
      
      // --- ASMR SPONGE TAP ---
      const tapOsc = ctx.createOscillator();
      const tapEnv = ctx.createGain();
      const tapFilter = ctx.createBiquadFilter();

      tapOsc.type = 'sine';
      tapOsc.frequency.setValueAtTime(120, now);
      tapOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      tapFilter.type = 'lowpass';
      tapFilter.frequency.setValueAtTime(250, now);

      tapEnv.gain.setValueAtTime(0, now);
      tapEnv.gain.linearRampToValueAtTime(0.15, now + 0.01);
      tapEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      tapOsc.connect(tapFilter);
      tapFilter.connect(tapEnv);
      tapEnv.connect(tGain);

      tapOsc.start(now);
      tapOsc.stop(now + 0.15);
      
      musicIntervalRef.current = window.setTimeout(scheduleNext, beatDuration * 1000);
    };

    scheduleNext();
  };

  const startTimer = async (seconds: number) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsActive(true);

    // Determine BPM based on time
    let bpm = 60;
    if (seconds === 180) bpm = 75;
    if (seconds === 300) bpm = 65;

    if (musicIntervalRef.current) clearTimeout(musicIntervalRef.current);
    initAudio(bpm);
  };

  const toggleActive = async () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    
    if (audioCtxRef.current) {
      if (nextActive) {
        await audioCtxRef.current.resume();
      } else {
        await audioCtxRef.current.suspend();
      }
    }
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(0);
    setTotalTime(0);
    if (musicIntervalRef.current) clearTimeout(musicIntervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().then(() => audioCtxRef.current = null);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isActive && onComplete) onComplete();
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, onComplete]);

  useEffect(() => {
    if (audioCtxRef.current && tapGainRef.current) {
      const targetGain = isMuted ? 0 : 1;
      tapGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (musicIntervalRef.current) clearTimeout(musicIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMusicLabel = () => {
    if (!isActive || isMuted) return 'Rhythmic Audio Off';
    if (totalTime === 180) return 'Playing: 75 BPM ASMR Sponge Tap';
    if (totalTime === 300) return 'Playing: 65 BPM Gentle ASMR Rhythm';
    return 'Playing: 60 BPM Deep Zen Rhythm';
  };

  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  return (
    <div className="glass rounded-[30px] md:rounded-[40px] p-6 md:p-8 shadow-xl md:shadow-2xl border border-pink-100 flex flex-col items-center relative overflow-hidden w-full max-w-md mx-auto">
      {isActive && (
        <div className="absolute inset-0 bg-pink-400/5 animate-pulse -z-10" />
      )}

      <div className="text-center mb-6">
        <h3 className="font-bold text-gray-800 text-sm md:text-lg tracking-tight">Blending Rhythm Session</h3>
        <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mt-1">Master the bounce</p>
      </div>

      <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6 md:mb-8 group">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            fill="none"
            stroke="#fce7f3"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="10"
            strokeDasharray="264%"
            strokeDashoffset={`${264 - (264 * percentage) / 100}%`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter">{formatTime(timeLeft)}</span>
          {isActive && (
            <div className="flex gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 w-full justify-center">
        {[180, 300, 600].map((s) => (
          <button
            key={s}
            onClick={() => startTimer(s)}
            className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm transition-all flex-1 ${
              totalTime === s ? 'bg-pink-600 text-white shadow-lg' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            }`}
          >
            {s / 60} MIN
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors shrink-0 ${isMuted ? 'text-gray-400' : 'text-pink-500 bg-pink-50'}`}
        >
          {isMuted ? BRAND_ICONS.VolumeOff : BRAND_ICONS.VolumeOn}
        </button>

        <button
          onClick={toggleActive}
          disabled={timeLeft === 0}
          className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-[30px] shadow-xl transition-all active:scale-95 disabled:opacity-30 shrink-0 ${
            isActive ? 'bg-gray-900 text-white' : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {isActive ? React.cloneElement(BRAND_ICONS.Pause as any, { size: 28 }) : React.cloneElement(BRAND_ICONS.Play as any, { size: 28, className: "ml-1" })}
        </button>

        <button
          onClick={reset}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
        >
          {React.cloneElement(BRAND_ICONS.Rotate as any, { size: 20 })}
        </button>
      </div>

      <div className="mt-6 md:mt-8 flex items-center gap-2 text-gray-400">
        <span className={isActive && !isMuted ? 'animate-spin text-pink-400 shrink-0' : 'shrink-0'}>{BRAND_ICONS.Music}</span>
        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">
          {getMusicLabel()}
        </span>
      </div>
    </div>
  );
};

export default RhythmTimer;
