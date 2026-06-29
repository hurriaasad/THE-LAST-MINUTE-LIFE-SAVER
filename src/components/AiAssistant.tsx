import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Mic, MicOff, Volume2, VolumeX, AlertTriangle, Play, Calendar, ListTodo, ShieldAlert } from "lucide-react";
import { Task, ScheduleBlock } from "../types";

interface Message {
  role: "user" | "model";
  text: string;
  actions?: any[];
}

interface AiAssistantProps {
  tasks: Task[];
  schedule: ScheduleBlock[];
  focusScore: number;
  onExecuteAiActions: (actions: any[]) => void;
}

export default function AiAssistant({
  tasks,
  schedule,
  focusScore,
  onExecuteAiActions,
}: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "### 👋 Hello! I am your Last-Minute Life Saver Coach.\n\nI don't just send notifications—I actively help you complete your assignments and crush looming deadlines.\n\nTell me what you are working on, or try one of these suggestion prompts:\n- *'I have a biology assignment due tomorrow at 9 AM and haven't started.'*\n- *'I'm procrastinating and feeling super stuck.'*\n- *'I'm stressed and need to activate Emergency Mode.'*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Speech and voice synthesis
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Setup Web Speech API for voice assistant!
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceInputToggle = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text-to-speech output
  const speakText = (text: string) => {
    if (!isSpeakingEnabled) return;

    // Clean markdown before speaking
    const cleanText = text.replace(/[#*`_]/g, "").slice(0, 300); // speak first 300 chars
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          taskList: tasks,
          schedule: schedule,
          focusScore: focusScore,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process chat");
      }

      const modelMessage: Message = {
        role: "model",
        text: data.text,
        actions: data.actions,
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Speak answer if enabled
      speakText(data.text);

      // Execute structured layout/rescheduling actions automatically!
      if (data.actions && data.actions.length > 0) {
        onExecuteAiActions(data.actions);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ **Error matching your prompt**: ${err.message || "The coach is temporarily disconnected."} Please try again!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render text helper that handles bold marks and simple markdown
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2"></div>;

      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-black text-white mt-4 mb-2">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-md font-bold text-white mt-4 mb-2">{trimmed.replace("##", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-lg font-black text-rose-400 mt-4 mb-2">{trimmed.replace("#", "").trim()}</h2>;
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc mt-1">
            {trimmed.replace(/^[-*]\s*/, "")}
          </li>
        );
      }

      // Simple strong formatting replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mt-1">{parts}</p>;
    });
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)]">
      {/* Left chat panel (3 cols) */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/10 flex flex-col justify-between overflow-hidden">
        {/* Messages feed */}
        <div className="flex-grow p-5 overflow-y-auto space-y-5">
          {messages.map((msg, i) => {
            const isModel = msg.role === "model";
            return (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isModel ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/15 text-indigo-400"
                }`}>
                  {isModel ? "🤖" : "👤"}
                </div>

                <div className={`rounded-2xl p-4 border text-xs ${
                  isModel 
                    ? "bg-slate-950/40 border-slate-900 text-slate-300" 
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-200"
                }`}>
                  {renderMessageContent(msg.text)}

                  {/* Execution tag */}
                  {isModel && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-900 flex items-center gap-2 text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Executed rescheduling Sprints & Schedulers
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-400">
                🤖
              </div>
              <div className="rounded-2xl p-4 border border-slate-900 bg-slate-950/40 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-rose-500" />
                Coach is rearranging schedules...
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center gap-3">
          <button
            onClick={handleVoiceInputToggle}
            className={`rounded-xl border p-3.5 transition shrink-0 ${
              isListening
                ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
            title="Speech-to-text voice assistant command"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your assignment crunch, stress level, or task due dates..."
            className="flex-grow rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3.5 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
          />

          <button
            onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
            className={`rounded-xl border p-3.5 transition shrink-0 ${
              isSpeakingEnabled
                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                : "border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
            title="Voice coaching TTS output toggle"
          >
            {isSpeakingEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 p-3.5 text-white shadow shadow-rose-500/15 active:scale-95 transition disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Right control diagnostics/actions panels (1 col) */}
      <div className="space-y-4">
        {/* Quick action shortcuts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
          <h4 className="font-bold text-white text-xs">Diagnostic Prompt Templates</h4>
          
          <div className="space-y-2">
            {[
              { text: "Break tomorrow's homework into sprints", icon: <ListTodo className="h-4 w-4 text-rose-400" /> },
              { text: "Suggest study times and block focus gaps", icon: <Calendar className="h-4 w-4 text-indigo-400" /> },
              { text: "Set Emergency mode and clear low priority", icon: <ShieldAlert className="h-4 w-4 text-amber-400" /> },
            ].map((shortcut, i) => (
              <button
                key={i}
                onClick={() => handleSend(shortcut.text)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-850 bg-slate-950/30 text-left hover:border-slate-700 hover:bg-slate-900/30 transition text-[11px]"
              >
                {shortcut.icon}
                <span className="text-slate-300 font-semibold">{shortcut.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic status block */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-2.5">
          <h4 className="font-bold text-white text-xs">Workspace Diagnostics</h4>
          <div className="text-[11px] space-y-1.5 text-slate-400">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>Model Selected</span>
              <span className="font-mono text-rose-400">gemini-3.5-flash</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>Task Density</span>
              <span className="text-white font-bold">{tasks.length} items</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Autoscheduling Rules</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
