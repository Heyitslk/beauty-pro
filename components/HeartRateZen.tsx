
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_ICONS } from '../constants';

const HeartRateZen: React.FC = () => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [targetBpm, setTargetBpm] = useState<number | null>(null);
  const [currentMusicBpm, setCurrentMusicBpm] = useState<number | null>(null);
  const [isRelaxing, setIsRelaxing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState<number>(0);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const padOsc1Ref = useRef<OscillatorNode | null>(null);
  const padOsc2Ref = useRef<OscillatorNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const padFilterRef = useRef<BiquadFilterNode | null>(null);
  const tapGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const musicIntervalRef = useRef<number | null>(null);

  // PPG State
  const dataPoints = useRef<number[]>([]);
  const smoothedPoints = useRef<number[]>([]);
  const lastPeakTime = useRef<number>(0);
  const bpms = useRef<number[]>([]);
  const sessionSeed = useRef<number>(Math.random());

  const startMeasurement = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Try to enable torch/flash
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.torch) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: true }]
            } as any);
            setIsTorchOn(true);
          } catch (e) {
            console.warn('Torch not available', e);
          }
        }

        setIsMeasuring(true);
        startPPG();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera to measure heart rate.');
      console.error(err);
    }
  };

  const stopMeasurement = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        // Try to turn off torch
        try {
          track.applyConstraints({ advanced: [{ torch: false }] } as any);
        } catch (e) {}
        track.stop();
      });
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsMeasuring(false);
    setSignalStrength(0);
    setIsTorchOn(false);
  };

  const startPPG = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { WILL_READ_FREQUENTLY: true } as any) as CanvasRenderingContext2D;
    if (!ctx) return;

    const windowSize = 60; // ~2 seconds at 30fps
    const values: number[] = [];
    const smoothedValues: number[] = [];
    let isAboveThreshold = false;

    intervalRef.current = window.setInterval(() => {
      if (video.paused || video.ended || video.readyState < 2) return;

      const size = 80; // Smaller sample area for better focus
      const x = Math.max(0, (video.videoWidth - size) / 2);
      const y = Math.max(0, (video.videoHeight - size) / 2);
      ctx.drawImage(video, x, y, size, size, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let rSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
      }
      const avgR = rSum / (data.length / 4);
      
      setSignalStrength(Math.min(100, (avgR / 255) * 100));

      // Add to sliding window
      values.push(avgR);
      if (values.length > windowSize) values.shift();

      // Simple Low-pass Filter (Moving Average)
      const smoothingFactor = 5;
      if (values.length >= smoothingFactor) {
        const sum = values.slice(-smoothingFactor).reduce((a, b) => a + b, 0);
        const smoothed = sum / smoothingFactor;
        smoothedValues.push(smoothed);
        if (smoothedValues.length > windowSize) smoothedValues.shift();
        
        // Visualize signal
        dataPoints.current.push(avgR);
        if (dataPoints.current.length > 60) dataPoints.current.shift();
        smoothedPoints.current.push(smoothed);
        if (smoothedPoints.current.length > 60) smoothedPoints.current.shift();

        // Peak detection logic
        if (values.length >= windowSize) {
          const max = Math.max(...values);
          const min = Math.min(...values);
          const range = max - min;
          
          // Dynamic threshold for cleaner heart rate detection
          const threshold = min + range * 0.85; 
  
          if (avgR > threshold && !isAboveThreshold && range > 0.3) {
            isAboveThreshold = true;
            const now = Date.now();
            const diff = now - (lastPeakTime.current || now - 800);
            
            if (diff > 400 && diff < 1200) { // Stable 50 - 150 BPM
              const currentBpm = 60000 / diff;
              bpms.current.push(currentBpm);
              if (bpms.current.length > 10) bpms.current.shift();
              
              const avg = bpms.current.reduce((a, b) => a + b, 0) / bpms.current.length;
              setBpm(Math.round(avg));
            }
            lastPeakTime.current = now;
          } else if (avgR < threshold - range * 0.1) {
            isAboveThreshold = false;
          }
        }
      }
    }, 33);
  };

  const startRelaxation = async () => {
    if (!bpm) return;
    
    // Ensure AudioContext is initialized and resumed
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    setIsRelaxing(true);
    setCurrentMusicBpm(bpm);
    setTargetBpm(60); 
    initAudio(bpm); // Pass bpm directly to avoid state race condition
    stopMeasurement();
  };

  const initAudio = (initialBpm: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // --- MASTER GAIN ---
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.8, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // --- LAYER 1: WARM AIRY PADS ---
    const padOsc1 = ctx.createOscillator();
    const padOsc2 = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padFilter = ctx.createBiquadFilter();

    // Personalize base frequency slightly per session
    const baseFreq = 164.81 + (sessionSeed.current * 10 - 5); // E3 +/- 5Hz
    padOsc1.type = 'sine';
    padOsc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    
    padOsc2.type = 'sine';
    padOsc2.frequency.setValueAtTime(baseFreq + 0.7, ctx.currentTime); 
    
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(400, ctx.currentTime);
    padFilter.Q.setValueAtTime(1, ctx.currentTime);

    padGain.gain.setValueAtTime(0.05, ctx.currentTime);

    padOsc1.connect(padFilter);
    padOsc2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(masterGain);

    padOsc1.start();
    padOsc2.start();
    
    padOsc1Ref.current = padOsc1;
    padOsc2Ref.current = padOsc2;
    padGainRef.current = padGain;
    padFilterRef.current = padFilter;

    // --- LAYER 2: SOFT TAPPING TEXTURE (ASMR) ---
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(0.8, ctx.currentTime);
    tapGain.connect(masterGain);
    tapGainRef.current = tapGain;

    // --- LAYER 3: ASMR CRACKLE (PERSONALIZED) ---
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.02 + (sessionSeed.current * 0.01), ctx.currentTime);
    crackleGain.connect(masterGain);
    
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000 + (sessionSeed.current * 500), ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.5, ctx.currentTime);
    
    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(crackleGain);
    whiteNoise.start();

    playPulse(initialBpm);
  };

  const playPianoNote = (now: number, freq: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.5);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 2.1);
  };

  const playPulse = (bpmToUse: number) => {
    if (!audioCtxRef.current || !padGainRef.current || !padFilterRef.current || !tapGainRef.current) return;
    
    const ctx = audioCtxRef.current;
    const pGain = padGainRef.current;
    const pFilter = padFilterRef.current;
    const tGain = tapGainRef.current;
    
    // Pentatonic scale for personalized piano (E Major Pentatonic)
    const scale = [164.81, 185.00, 207.65, 246.94, 277.18, 329.63, 370.00, 415.30];
    let beatCount = 0;

    const scheduleNext = (currentBpm: number) => {
      const beatDuration = 60 / currentBpm;
      const now = ctx.currentTime;
      
      // --- PAD BREATHING ---
      pGain.gain.cancelScheduledValues(now);
      pGain.gain.setValueAtTime(pGain.gain.value, now);
      pGain.gain.linearRampToValueAtTime(0.3, now + beatDuration * 0.4); 
      pGain.gain.exponentialRampToValueAtTime(0.1, now + beatDuration * 0.95); 
      
      pFilter.frequency.cancelScheduledValues(now);
      pFilter.frequency.setValueAtTime(pFilter.frequency.value, now);
      pFilter.frequency.linearRampToValueAtTime(800, now + beatDuration * 0.4);
      pFilter.frequency.exponentialRampToValueAtTime(400, now + beatDuration * 0.95);

      // --- ASMR SPONGE TAP ---
      const tapOsc = ctx.createOscillator();
      const tapEnv = ctx.createGain();
      const tapFilter = ctx.createBiquadFilter();

      tapOsc.type = 'sine';
      tapOsc.frequency.setValueAtTime(200, now);
      tapOsc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

      tapFilter.type = 'lowpass';
      tapFilter.frequency.setValueAtTime(400, now);

      tapEnv.gain.setValueAtTime(0, now);
      tapEnv.gain.linearRampToValueAtTime(0.2, now + 0.01); 
      tapEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      tapOsc.connect(tapFilter);
      tapFilter.connect(tapEnv);
      tapEnv.connect(tGain);

      tapOsc.start(now);
      tapOsc.stop(now + 0.15);

      // --- RANDOMIZED PIANO (PERSONALIZED) ---
      // Play a note every 4 or 8 beats, with some randomness
      if (beatCount % 4 === 0 && Math.random() > 0.3) {
        const noteIndex = Math.floor(Math.random() * scale.length);
        const freq = scale[noteIndex];
        playPianoNote(now, freq);
      }
      
      beatCount++;
      
      musicIntervalRef.current = window.setTimeout(() => {
        const nextBpm = (window as any)._currentZenBpm || currentBpm;
        scheduleNext(nextBpm);
      }, beatDuration * 1000);
    };

    scheduleNext(bpmToUse);
  };

  // Keep a global-ish ref for the pulse loop to access the slowing BPM
  useEffect(() => {
    if (currentMusicBpm) {
      (window as any)._currentZenBpm = currentMusicBpm;
    }
  }, [currentMusicBpm]);

  useEffect(() => {
    if (isRelaxing && currentMusicBpm && targetBpm && currentMusicBpm > targetBpm) {
      const timer = setInterval(() => {
        setCurrentMusicBpm(prev => {
          if (prev && prev > targetBpm) {
            return prev - 0.5;
          }
          return prev;
        });
      }, 2000); // Slow down every 2 seconds
      return () => clearInterval(timer);
    }
  }, [isRelaxing, targetBpm]);

  useEffect(() => {
    return () => {
      stopMeasurement();
      if (musicIntervalRef.current) clearTimeout(musicIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-[40px] shadow-2xl border border-pink-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        {BRAND_ICONS.Heart}
      </div>
      
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Artist Zen</h3>
        <p className="text-gray-500 font-light px-4">
          {!isMeasuring && !isRelaxing 
            ? "Place your finger over the rear camera and flash to detect your pulse." 
            : "Sync your breath with your heartbeat for a flawless focus."}
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {!isRelaxing ? (
          <>
            <div className="relative w-48 h-48 rounded-full bg-pink-50 flex items-center justify-center border-4 border-white shadow-inner overflow-hidden">
              <video 
                ref={videoRef} 
                className={`absolute inset-0 w-full h-full object-cover ${isMeasuring ? 'opacity-40 scale-150' : 'opacity-20'}`}
                muted
                playsInline
              />
              <canvas ref={canvasRef} width="10" height="10" className="hidden" />
              
              <AnimatePresence mode="wait">
                {isMeasuring ? (
                  <motion.div 
                    key="measuring"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="text-pink-500 mb-2"
                    >
                      {BRAND_ICONS.Heart}
                    </motion.div>
                    <div className="text-4xl font-bold text-gray-900">
                      {bpm || '--'}
                    </div>
                    <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">BPM</div>
                    
                    {/* Signal Strength Indicator */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Signal</div>
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${signalStrength}%` }}
                            className={`h-full ${signalStrength > 70 ? 'bg-emerald-400' : signalStrength > 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Flash</div>
                        <div className={`w-2 h-2 rounded-full ${isTorchOn ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]' : 'bg-gray-200'}`} />
                      </div>
                    </div>

                    {/* Pulse Waveform Visualization */}
                    <div className="flex items-end gap-0.5 h-6 mt-2">
                      {smoothedPoints.current.slice(-30).map((p, i) => {
                        const min = Math.min(...smoothedPoints.current.slice(-30));
                        const max = Math.max(...smoothedPoints.current.slice(-30));
                        const range = max - min || 1;
                        const height = ((p - min) / range) * 24;
                        return (
                          <div 
                            key={i} 
                            className="w-1 bg-pink-400 rounded-full transition-all duration-75" 
                            style={{ height: `${Math.max(2, height)}px` }} 
                          />
                        );
                      })}
                    </div>
                    
                    <p className="mt-2 text-[10px] text-gray-400 font-medium animate-pulse">Keep finger still on lens</p>
                  </motion.div>
                ) : (
                  <motion.button
                    key="start"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startMeasurement}
                    className="relative z-10 w-32 h-32 rounded-full bg-pink-600 text-white flex flex-col items-center justify-center shadow-xl shadow-pink-200"
                  >
                    <div className="mb-1">{BRAND_ICONS.Zap}</div>
                    <span className="text-xs font-bold uppercase tracking-tighter">Measure</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-medium bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2">
                {BRAND_ICONS.Alert} {error}
              </div>
            )}

            {bpm && bpm > 0 && isMeasuring && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={startRelaxation}
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all"
              >
                Begin Relaxation
              </motion.button>
            )}

            {!bpm && isMeasuring && (
              <button
                onClick={() => {
                  setBpm(70);
                  setTimeout(() => startRelaxation(), 100);
                }}
                className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-pink-500 transition-colors"
              >
                Skip to Music (Use Default 70 BPM)
              </button>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-12 py-8"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: currentMusicBpm ? 60 / currentMusicBpm : 1 
                  }}
                  className="absolute inset-0 bg-pink-400 rounded-full blur-3xl"
                />
                <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border border-pink-50">
                   <div className="text-pink-500 scale-150">
                    {BRAND_ICONS.Air}
                   </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  {Math.round(currentMusicBpm || 0)}
                </div>
                <div className="text-xs font-bold text-pink-400 uppercase tracking-[0.3em]">Current Tempo</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Initial: {bpm} BPM</span>
                <span>Target: 60 BPM</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${((currentMusicBpm || 0) - 60) / ((bpm || 100) - 60) * 100}%` }}
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400"
                />
              </div>
              <p className="text-center text-sm text-gray-500 italic font-light">
                The music is slowing down to help you find your center.
              </p>
            </div>

            <button 
              onClick={() => {
                setIsRelaxing(false);
                if (audioCtxRef.current) audioCtxRef.current.close();
                audioCtxRef.current = null;
              }}
              className="w-full py-4 border-2 border-pink-100 text-pink-600 rounded-2xl font-bold hover:bg-pink-50 transition-all"
            >
              End Session
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HeartRateZen;
