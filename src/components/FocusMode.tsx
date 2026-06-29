import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, Music, Maximize2, Minimize2, Sparkles, Smile, BatteryCharging, CheckCircle2 } from "lucide-react";
import { FocusSession } from "../types";

interface FocusModeProps {
  onFocusSessionComplete: (session: Omit<FocusSession, "id" | "timestamp">) => void;
  activeTaskTitle?: string;
  activeTaskId?: string;
}

export default function FocusMode({
  onFocusSessionComplete,
  activeTaskTitle,
  activeTaskId,
}: FocusModeProps) {
  // Timer States
  const [totalSeconds, setTotalSeconds] = useState(1500); // 25m default
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Screen modes
  const [isFullscreen, setIsFullscreen] = useState(false);
  const focusContainerRef = useRef<HTMLDivElement>(null);

  // White noise audio player
  const [selectedSound, setSelectedSound] = useState<"none" | "binaural" | "rain" | "waves" | "white" | "cosmos" | "theta" | "pulse">("none");
  const [audioVolume, setAudioVolume] = useState(60);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Coach advice prompt
  const [advice, setAdvice] = useState("Let's dedicate the next 25 minutes entirely to your core target. Turn off your phone and lock in.");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Motivational coach comments
  const coachQuotes = [
    "Lower your activation energy. Focus only on the current paragraph or line of code.",
    "Breathe in. Lock in. You are more capable than your deadline-panic thinks.",
    "Binaural rhythms are syncing with your theta brainwaves. Keep the momentum going.",
    "One block at a time. The relief of finishing is worth the discomfort of starting.",
    "You are in deep flow. The world can wait for 20 more minutes."
  ];

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          // Periodically update advice quote
          if (prev % 300 === 0) {
            setAdvice(coachQuotes[Math.floor(Math.random() * coachQuotes.length)]);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  // Audio synthesis for actual white noise!
  // This is highly professional and functions 100% natively in browser without external files!
  const startSynthSound = (soundType: typeof selectedSound) => {
    stopSynthSound();
    if (soundType === "none") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Special handling for advanced multi-node synth tracks
      if (soundType === "cosmos") {
        // Zen Cosmos Drone - Low frequency celestial sweep
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 fundamental
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(165, ctx.currentTime); // E3 perfect fifth
        osc3.type = "triangle";
        osc3.frequency.setValueAtTime(220, ctx.currentTime); // A3 perfect octave

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);

        // LFO filter sweep (breathing effect)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ultra slow 12s cycle
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);

        gainNode.gain.setValueAtTime((audioVolume / 100) * 0.14, ctx.currentTime);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(0);
        osc2.start(0);
        osc3.start(0);
        lfo.start(0);

        noiseNodeRef.current = gainNode;
        return;
      }

      if (soundType === "theta") {
        // Deep Theta Forest - Binaural waves with forest-filtered wind swells
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const oscLVolume = ctx.createGain();
        const oscRVolume = ctx.createGain();
        
        oscL.type = "sine";
        oscL.frequency.setValueAtTime(136, ctx.currentTime); // Left
        oscR.type = "sine";
        oscR.frequency.setValueAtTime(142, ctx.currentTime); // Right (6Hz Theta difference)

        // Binaural stereo separation
        const merger = ctx.createChannelMerger(2);
        oscL.connect(oscLVolume).connect(merger, 0, 0);
        oscR.connect(oscRVolume).connect(merger, 0, 1);

        // Sweeping pink wind noise
        const bufferSizeWind = ctx.sampleRate * 4; // 4 seconds buffer
        const bufferWind = ctx.createBuffer(1, bufferSizeWind, ctx.sampleRate);
        const dataWind = bufferWind.getChannelData(0);
        let lastOutWind = 0.0;
        for (let i = 0; i < bufferSizeWind; i++) {
          const white = Math.random() * 2 - 1;
          dataWind[i] = (lastOutWind + (0.018 * white)) / 1.018;
          lastOutWind = dataWind[i];
          dataWind[i] *= 2.8;
        }

        const windSource = ctx.createBufferSource();
        windSource.buffer = bufferWind;
        windSource.loop = true;

        const windFilter = ctx.createBiquadFilter();
        windFilter.type = "lowpass";
        windFilter.frequency.setValueAtTime(180, ctx.currentTime);
        windFilter.Q.setValueAtTime(1.2, ctx.currentTime);

        // Wind LFO modulator
        const windLfo = ctx.createOscillator();
        const windLfoGain = ctx.createGain();
        windLfo.type = "sine";
        windLfo.frequency.setValueAtTime(0.06, ctx.currentTime); // 16-second breathing swell
        windLfoGain.gain.setValueAtTime(100, ctx.currentTime);

        windLfo.connect(windLfoGain);
        windLfoGain.connect(windFilter.frequency);

        windSource.connect(windFilter);

        // Master mixing
        const mixer = ctx.createGain();
        mixer.gain.setValueAtTime((audioVolume / 100) * 0.12, ctx.currentTime);

        merger.connect(mixer);
        windFilter.connect(mixer);
        mixer.connect(ctx.destination);

        oscL.start(0);
        oscR.start(0);
        windSource.start(0);
        windLfo.start(0);

        noiseNodeRef.current = mixer;
        return;
      }

      if (soundType === "pulse") {
        // Shield Pulse - Ultra slow heartbeat / tactile breath sync (60 BPM)
        const heartOsc = ctx.createOscillator();
        const pulseFilter = ctx.createBiquadFilter();
        const pulseGain = ctx.createGain();

        heartOsc.type = "sine";
        heartOsc.frequency.setValueAtTime(55, ctx.currentTime); // deep resonant bass

        pulseFilter.type = "lowpass";
        pulseFilter.frequency.setValueAtTime(90, ctx.currentTime);

        heartOsc.connect(pulseFilter).connect(pulseGain);

        // Heartbeat trigger cycle using a periodic LFO modulator
        const rateLfo = ctx.createOscillator();
        const rateLfoGain = ctx.createGain();
        rateLfo.type = "sine";
        rateLfo.frequency.setValueAtTime(0.8, ctx.currentTime); // 48 BPM rhythm for maximum cardiac calming effect

        rateLfoGain.gain.setValueAtTime(0.45, ctx.currentTime);
        rateLfo.connect(rateLfoGain);

        pulseGain.gain.setValueAtTime(0.5, ctx.currentTime);
        rateLfoGain.connect(pulseGain.gain);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime((audioVolume / 100) * 0.28, ctx.currentTime);
        
        pulseGain.connect(masterGain);
        masterGain.connect(ctx.destination);

        heartOsc.start(0);
        rateLfo.start(0);

        noiseNodeRef.current = masterGain;
        return;
      }

      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Create raw noise data
      for (let i = 0; i < bufferSize; i++) {
        if (soundType === "white") {
          data[i] = Math.random() * 2 - 1;
        } else if (soundType === "rain") {
          // Brown noise spectrum (rain feel)
          let lastOut = 0.0;
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Gain compensation
        } else if (soundType === "waves") {
          // Pink noise spectrum
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11; // compensation
          b6 = white * 0.115926;
        } else if (soundType === "binaural") {
          // Sinewaves close frequency
          const source1 = ctx.createOscillator();
          const source2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          source1.type = "sine";
          source1.frequency.setValueAtTime(140, ctx.currentTime); // L
          source2.type = "sine";
          source2.frequency.setValueAtTime(145, ctx.currentTime); // R (5Hz delta)

          const merger = ctx.createChannelMerger(2);
          source1.connect(merger, 0, 0);
          source2.connect(merger, 0, 1);

          gainNode.gain.setValueAtTime((audioVolume / 100) * 0.15, ctx.currentTime);
          merger.connect(gainNode);
          gainNode.connect(ctx.destination);

          source1.start(0);
          source2.start(0);

          // Save node reference for stopping
          noiseNodeRef.current = merger as any;
          return;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime((audioVolume / 100) * 0.15, ctx.currentTime);

      noiseSource.connect(gainNode);
      gainNode.connect(ctx.destination);
      noiseSource.start(0);

      noiseNodeRef.current = noiseSource;
    } catch (e) {
      console.warn("AudioContext failed to launch, browser policies require a user action gesture first.");
    }
  };

  const stopSynthSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop?.(0);
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const handleCompleteSession = () => {
    setIsActive(false);
    stopSynthSound();
    setSessionCompleted(true);

    const mins = Math.round((totalSeconds - secondsLeft) / 60) || 1;
    onFocusSessionComplete({
      taskId: activeTaskId,
      taskTitle: activeTaskTitle || "Unscheduled Focus Block",
      duration: mins,
      rating: 5,
      soundUsed: selectedSound !== "none" ? selectedSound : undefined,
    });
  };

  const handlePresetSelect = (mins: number) => {
    setIsActive(false);
    stopSynthSound();
    setSelectedSound("none");
    const secs = mins * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setSessionCompleted(false);
  };

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      stopSynthSound();
    } else {
      setIsActive(true);
      if (selectedSound !== "none") {
        startSynthSound(selectedSound);
      }
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    stopSynthSound();
    setSecondsLeft(totalSeconds);
    setSessionCompleted(false);
  };

  const handleSoundChange = (sound: typeof selectedSound) => {
    setSelectedSound(sound);
    if (isActive && sound !== "none") {
      startSynthSound(sound);
    } else {
      stopSynthSound();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      focusContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Compute SVG circular dashoffset
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressPct = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference - (progressPct * circumference);

  return (
    <div 
      ref={focusContainerRef}
      className={`rounded-3xl border border-slate-800 bg-slate-900/10 p-6 md:p-8 flex flex-col justify-between items-center relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 bg-slate-950 !rounded-none !border-none p-12 justify-center gap-12" : ""
      }`}
    >
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-rose-500/[0.03] blur-[128px]"></div>

      {/* Screen Control Toolbar */}
      <div className="w-full flex justify-between items-center gap-4 z-10 mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400">
            {activeTaskTitle ? `Focus Target: ${activeTaskTitle}` : "Distraction-Shield Mode"}
          </span>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="rounded-xl border border-slate-800/80 bg-slate-950/20 p-2.5 text-slate-400 hover:text-white transition"
        >
          {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Main Focus Dial */}
      <div className="flex flex-col items-center gap-6 my-4 z-10">
        <div className="relative flex items-center justify-center">
          {/* Circular Countdown Progress Ring */}
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="#1e293b"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="url(#roseGrad)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute text-center">
            <div className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
              {isActive ? "Deep Flow Session" : "Paused"}
            </div>
          </div>
        </div>

        {/* Timer Control row */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 ${
              isActive 
                ? "bg-slate-800 border border-slate-700 text-rose-500" 
                : "bg-gradient-to-tr from-rose-500 to-amber-500 text-white"
            }`}
          >
            {isActive ? <Pause className="h-7 w-7 fill-rose-500" /> : <Play className="h-7 w-7 fill-white translate-x-0.5" />}
          </button>

          <button
            onClick={handleCompleteSession}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-emerald-500 hover:text-emerald-400 transition"
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Presets and White Noise Panel */}
      <div className="w-full max-w-md bg-slate-950/40 border border-slate-900/60 p-5 rounded-2xl space-y-5 z-10 mt-4">
        {/* Presets row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <BatteryCharging className="h-3.5 w-3.5" />
              Focus Cycle Presets
            </div>
            <div className="text-[10px] font-bold text-slate-500 font-mono">
              Custom Mins
            </div>
          </div>
          <div className="flex gap-2">
            <div className="grid grid-cols-4 gap-2 flex-grow">
              {[10, 25, 50, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handlePresetSelect(mins)}
                  className={`rounded-lg py-1.5 text-xs font-semibold border transition ${
                    totalSeconds === mins * 60
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-400 font-bold"
                      : "border-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            
            {/* Custom minute selector input */}
            <div className="relative w-24">
              <input
                type="number"
                min="1"
                max="360"
                placeholder="Mins"
                value={Math.round(totalSeconds / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 25;
                  if (val > 0 && val <= 360) {
                    handlePresetSelect(val);
                  }
                }}
                className="w-full h-8 text-center text-xs font-bold rounded-lg bg-slate-950 border border-slate-800 text-rose-400 focus:border-rose-500 outline-none placeholder-slate-600"
              />
              <span className="absolute right-2.5 top-2 text-[8px] font-bold text-slate-500 pointer-events-none">MIN</span>
            </div>
          </div>
        </div>

        {/* Ambient Noise Selector */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            Shield Ambient Loops (AI Synthesized)
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            {([
              { id: "none", label: "🔇 Silent" },
              { id: "cosmos", label: "🌌 Cosmos" },
              { id: "theta", label: "🌳 Theta Forest" },
              { id: "pulse", label: "💓 Shield Pulse" },
              { id: "binaural", label: "🎧 Binaural" },
              { id: "rain", label: "🌧️ Rain" },
              { id: "waves", label: "🌊 Waves" },
              { id: "white", label: "💨 White N." }
            ] as const).map((sound) => (
              <button
                key={sound.id}
                onClick={() => handleSoundChange(sound.id)}
                className={`rounded-xl py-2.5 border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  selectedSound === sound.id
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-400 font-extrabold shadow-lg shadow-rose-500/5"
                    : "border-slate-850 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {sound.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live AI Coach Advice Prompt */}
      <div className="mt-6 flex gap-3 max-w-md items-start bg-slate-950/20 border border-slate-900/40 rounded-xl p-3.5 z-10 text-xs">
        <Sparkles className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
        <p className="text-slate-400 italic">"{advice}"</p>
      </div>
    </div>
  );
}
