import React, { useState } from "react";
import { Sparkles, Play, Award, Brain, Target, Calendar, CloudSun, AlertCircle, Plus, Send, ChevronRight, Zap } from "lucide-react";
import { Task, Habit, ScheduleBlock, FocusSession, Achievement } from "../types";

interface DashboardProps {
  userState: {
    username: string;
    level: number;
    xp: number;
    coins: number;
    emergencyModeActive: boolean;
  };
  tasks: Task[];
  habits: Habit[];
  schedule: ScheduleBlock[];
  focusSessions: FocusSession[];
  achievements: Achievement[];
  onAddTask: (task: Omit<Task, "id" | "completed" | "actualTime" | "subtasks">) => void;
  onStartFocus: (taskId?: string) => void;
  onNavigate: (tab: "dashboard" | "tasks" | "calendar" | "goals" | "habits" | "analytics" | "assistant" | "settings") => void;
  onTriggerEmergency: () => void;
}

export default function Dashboard({
  userState,
  tasks,
  habits,
  schedule,
  focusSessions,
  achievements,
  onAddTask,
  onStartFocus,
  onNavigate,
  onTriggerEmergency,
}: DashboardProps) {
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<Task["category"]>("Study");
  const [quickPriority, setQuickPriority] = useState<Task["priority"]>("Medium");

  const [aiFocusModeActive, setAiFocusModeActive] = useState(false);
  const [liveBonus, setLiveBonus] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveBonus(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return Math.max(-10, Math.min(15, next));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Derive simple scores for premium indicators
  const productivityScore = Math.min(100, Math.round(completionRate * 0.7 + (focusSessions.length * 10)));
  const focusScore = Math.min(100, Math.round(80 + (focusSessions.filter((s) => s.rating >= 4).length * 4) - (userState.emergencyModeActive ? 15 : 0)));

  // Generate simple SVG path/points for a modern chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  const chartData = [
    35 + Math.round(liveBonus * 0.4),
    45 - Math.round(liveBonus * 0.2),
    80 + Math.round(liveBonus * 0.3),
    50 + Math.round(liveBonus * 0.5),
    65 - Math.round(liveBonus * 0.1),
    95 + Math.round(liveBonus * 0.2),
    Math.max(10, Math.min(100, productivityScore + liveBonus))
  ];

  const chartPoints = chartData
    .map((val, idx) => `${idx * 60 + 20},${130 - (val / 100) * 100}`)
    .join(" ");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddTask({
      title: quickTitle,
      category: quickCategory,
      priority: quickPriority,
      difficulty: "Medium",
      estimatedTime: 45,
      deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow default
    });
    setQuickTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-rose-500/10 blur-[64px]"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[64px]"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold uppercase tracking-wider text-rose-400">System Ready</span>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">{userState.username || "Crusher"}</span>!
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Today is {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. 
              {userState.emergencyModeActive 
                ? " ⚠️ Emergency crash protocol is active! We've rearranged your day. Focus only on high priority sprints."
                : " Your AI coach has analyzed your schedule and estimated a free 3.5 hour focus slot this evening."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setAiFocusModeActive(!aiFocusModeActive)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-xs uppercase tracking-wider border transition active:scale-[0.98] ${
                aiFocusModeActive
                  ? "bg-indigo-500/25 border-indigo-500/80 text-indigo-400 shadow-lg shadow-indigo-500/15 animate-pulse"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400"
              }`}
            >
              <Target className="h-4 w-4" />
              {aiFocusModeActive ? "Highlight Focus Active" : "AI Focus Highlight"}
            </button>
            <button
              onClick={onTriggerEmergency}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-xs uppercase tracking-wider border transition active:scale-[0.98] ${
                userState.emergencyModeActive
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-rose-400"
              }`}
            >
              <Zap className="h-4 w-4" />
              {userState.emergencyModeActive ? "Emergency Active" : "Trigger Emergency"}
            </button>
            <button
              onClick={() => onStartFocus()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2.5 font-bold text-xs uppercase tracking-wider text-white hover:brightness-110 transition shadow-lg shadow-rose-500/15"
            >
              <Play className="h-4 w-4 fill-white" />
              Quick Focus Session
            </button>
          </div>
        </div>
      </div>

      {aiFocusModeActive && tasks.filter(t => !t.completed)[0] ? (
        <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/5 p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden animate-slide-in-right">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-500/[0.03] blur-[128px]"></div>
          
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full">
              ⚡ ACTIVE SINGLE-TASK HIGHLIGHT PROTOCOL
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-4 max-w-2xl leading-tight">
              "{tasks.filter(t => !t.completed)[0].title}"
            </h3>
            <p className="text-xs text-slate-400 font-semibold font-mono">
              Category: {tasks.filter(t => !t.completed)[0].category} • Priority: <span className="text-rose-400">{tasks.filter(t => !t.completed)[0].priority}</span>
            </p>
          </div>

          {/* Majestic countdown ticker */}
          <div className="flex gap-4 md:gap-6 justify-center items-center">
            <div className="bg-slate-950 border border-slate-900 px-5 py-4 rounded-2xl text-center min-w-20 shadow-xl">
              <div className="text-2xl font-black text-indigo-400 font-mono">08</div>
              <div className="text-[8px] uppercase font-bold tracking-wider text-slate-500 mt-1 font-mono">Hours</div>
            </div>
            <span className="text-xl font-bold text-slate-800 animate-pulse">:</span>
            <div className="bg-slate-950 border border-slate-900 px-5 py-4 rounded-2xl text-center min-w-20 shadow-xl">
              <div className="text-2xl font-black text-indigo-400 font-mono">42</div>
              <div className="text-[8px] uppercase font-bold tracking-wider text-slate-500 mt-1 font-mono">Minutes</div>
            </div>
            <span className="text-xl font-bold text-slate-800 animate-pulse">:</span>
            <div className="bg-slate-950 border border-slate-900 px-5 py-4 rounded-2xl text-center min-w-20 shadow-xl">
              <div className="text-2xl font-black text-indigo-400 font-mono">15</div>
              <div className="text-[8px] uppercase font-bold tracking-wider text-slate-500 mt-1 font-mono">Seconds</div>
            </div>
          </div>

          <div className="max-w-md text-slate-400 text-xs leading-relaxed border border-slate-800/80 bg-slate-950/60 p-4 rounded-2xl">
            🧠 <b>AI Cognitive Shield</b>: "I have disabled peripheral bento displays, charts, and habits. Outer telemetry is zero. Block all sensory distraction and complete this single target now."
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onStartFocus(tasks.filter(t => !t.completed)[0].id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 px-8 py-3.5 font-black text-xs uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition shadow-2xl shadow-indigo-500/15"
            >
              <Play className="h-4.5 w-4.5 fill-white" />
              Launch Pomodoro Shield
            </button>
            <button
              onClick={() => setAiFocusModeActive(false)}
              className="text-xs font-bold text-slate-500 hover:text-white transition px-5 py-3.5 border border-slate-800 bg-slate-950/40 rounded-xl"
            >
              Disable Focus Highlight
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden group hover:border-rose-500/30 hover:shadow-rose-500/[0.02] transition duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/25 to-transparent"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productivity Score</span>
            <Brain className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{productivityScore}</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">+5% today</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: `${productivityScore}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/30 hover:shadow-amber-500/[0.02] transition duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Focus Score</span>
            <Target className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{focusScore}%</span>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Stable</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${focusScore}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 hover:shadow-indigo-500/[0.02] transition duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">XP & Gamification</span>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">Lvl {userState.level}</span>
            <span className="text-xs font-semibold text-indigo-400">{userState.xp} XP / {userState.coins} Gold</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: `${(userState.xp % 100)}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 hover:shadow-emerald-500/[0.02] transition duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Completion</span>
            <Target className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{completionRate}%</span>
            <span className="text-xs font-semibold text-slate-400">{completedCount}/{tasks.length} finished</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Advisor Panel */}
          <div className="rounded-2xl border border-rose-500/10 bg-gradient-to-tr from-slate-900/40 to-slate-900/10 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500" />
              <h3 className="font-extrabold text-white text-md">AI Productivity Coach Briefing</h3>
            </div>
            
            <div className="mt-3 text-sm text-slate-300 leading-relaxed border-l-2 border-rose-500/40 pl-4 py-1">
              {userState.emergencyModeActive ? (
                <span>
                  <b>CRASH PLAN ENGAGED</b>: We have shifted focus exclusively to high priority sprints. I have blocked the calendar from distractions and set your Pomodoro cycle to 50m work / 5m reset. Avoid checking external websites!
                </span>
              ) : tasks.filter(t => !t.completed).length > 0 ? (
                <span>
                  "You have <b>{tasks.filter(t => !t.completed).length} pending tasks</b> due soon. Your study statistics show you are 34% more focused after dinner. I recommend blocking 7:00 PM for the <b>'{tasks.filter(t => !t.completed)[0]?.title}'</b> assignment."
                </span>
              ) : (
                <span>
                  "Incredible work! All targets completed. I suggest establishing a daily habit block of 15 minutes today to plan tomorrow's challenges and stay ahead of the curve."
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => onNavigate("assistant")}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                Consult Coach Chat
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick task list & schedule overview */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Urgent Tasks */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                Urgent Priorities
              </h3>
              
              <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {tasks.filter(t => !t.completed).slice(0, 3).length > 0 ? (
                  tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onNavigate("tasks")}
                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">{task.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span className="text-rose-400 font-semibold">{task.priority}</span>
                          <span>•</span>
                          <span>Due {task.deadline}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">No pending tasks! Add one below.</div>
                )}
              </div>
            </div>

            {/* Smart Schedule Blocks */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                Today's Schedule
              </h3>

              <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {schedule.length > 0 ? (
                  schedule.slice(0, 3).map(block => (
                    <div 
                      key={block.id} 
                      className={`p-3 rounded-xl border ${
                        block.isFocusBlock 
                          ? "border-rose-500/10 bg-rose-500/5 text-rose-300" 
                          : "border-slate-800 bg-slate-950/30 text-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold truncate pr-2">{block.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{block.start} - {block.end}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">Calendar empty. Use AI Planner to schedule!</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Add Task Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5">
            <h3 className="font-bold text-white text-sm">Quick Add Task</h3>
            <form onSubmit={handleQuickAdd} className="mt-4 flex gap-3">
              <input
                type="text"
                required
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What assignment or chore needs cracking?"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
              />
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as Task["category"])}
                className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-rose-500"
              >
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Life Admin">Admin</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition p-2.5 text-white"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Interactive Weather Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Workspace Conditions</div>
              <div className="text-xl font-bold text-white">72°F / Optimal</div>
              <div className="text-xs text-slate-500">Perfect temperature for deep study & CS focus!</div>
            </div>
            <CloudSun className="h-10 w-10 text-amber-500 animate-pulse" />
          </div>

          {/* Weekly Analytics Mini Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Productivity Chart</h3>
              <span className="flex items-center gap-1 text-[8px] font-bold text-rose-400 uppercase tracking-widest font-mono bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                LIVE UPDATES
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Consistency rate of completing targeted milestones</p>
            
            <div className="mt-4 flex items-center justify-center">
              <svg className="w-full h-36" viewBox="0 0 380 140">
                {/* Horizontal grid lines */}
                <line x1="10" y1="30" x2="370" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="10" y1="80" x2="370" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="10" y1="130" x2="370" y2="130" stroke="#1e293b" />

                {/* Animated gradient area */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 20,130 ${chartData
                    .map((val, idx) => `L ${idx * 60 + 20},${130 - (val / 100) * 100}`)
                    .join(" ")} L 380,130 Z`}
                  fill="url(#chartGrad)"
                />

                {/* Main line */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  points={chartPoints}
                />

                {/* Data point dots */}
                {chartData.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={idx * 60 + 20}
                    cy={130 - (val / 100) * 100}
                    r="5"
                    fill="#f43f5e"
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                ))}

                {/* Labels */}
                {last7Days.map((day, idx) => (
                  <text
                    key={idx}
                    x={idx * 60 + 20}
                    y="140"
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="9"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {day}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Locked Achievements Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-indigo-400" />
              Unlocked Achievements
            </h3>

            <div className="mt-4 space-y-3">
              {achievements.filter(a => a.unlockedAt).length > 0 ? (
                achievements.filter(a => a.unlockedAt).slice(0, 3).map(ach => (
                  <div key={ach.id} className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">
                      {ach.icon || "🏆"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{ach.title}</div>
                      <div className="text-[10px] text-slate-500">{ach.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">Crush tasks to unlock badges!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )}
  </div>
);
}
