import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, RefreshCw, AlertTriangle, Layers } from "lucide-react";
import { Task, ScheduleBlock } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  schedule: ScheduleBlock[];
  onAddScheduleBlock: (block: Omit<ScheduleBlock, "id">) => void;
  onAutoSchedule: () => void;
  onClearSchedule: () => void;
}

export default function CalendarView({
  tasks,
  schedule,
  onAddScheduleBlock,
  onAutoSchedule,
  onClearSchedule,
}: CalendarViewProps) {
  const [view, setView] = useState<"Month" | "Week" | "Day" | "Agenda">("Week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Google Calendar Sync Simulation
  const [isSynced, setIsSynced] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Auto scheduling state
  const [scheduling, setScheduling] = useState(false);

  const handleSyncGoogle = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      setIsSynced(!isSynced);
    }, 1500);
  };

  const handleAiAutoSchedule = () => {
    setScheduling(true);
    setTimeout(() => {
      onAutoSchedule();
      setScheduling(false);
    }, 1500);
  };

  // Derive simple month layout array
  const monthDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOffset = d.getDay();
    d.setDate(d.getDate() - startOffset + i);
    return d;
  });

  const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8:00 to 22:00

  // Day names helper
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const curr = d.getDay();
    d.setDate(d.getDate() - curr + i);
    return d;
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Focus Calendar</h2>
            <p className="text-xs text-slate-500">Heuristic conflict detection & auto-scheduling active</p>
          </div>
        </div>

        {/* Sync panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAiAutoSchedule}
            disabled={scheduling || tasks.filter(t => !t.completed).length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/10 hover:brightness-110 transition disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {scheduling ? "Reclaiming time..." : "AI Auto Schedule"}
          </button>
          
          {schedule.length > 0 && (
            <button
              onClick={onClearSchedule}
              className="text-xs text-slate-500 hover:text-slate-300 transition underline decoration-dotted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Calendar View Selectors & Navigate buttons */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-900 rounded-xl p-1">
          {(["Month", "Week", "Day", "Agenda"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setView(opt)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                view === opt
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() - 1);
              setCurrentDate(d);
            }}
            className="p-2 border border-slate-800 bg-slate-950/20 text-slate-400 rounded-lg hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-slate-300">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button 
            onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() + 1);
              setCurrentDate(d);
            }}
            className="p-2 border border-slate-800 bg-slate-950/20 text-slate-400 rounded-lg hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Conflicts Banner */}
      {tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <div>
            <b>Schedule Conflict Detected</b>: You have past due assignments. Use AI Auto Scheduling to run a heuristic crash recovery and push non-critical activities.
          </div>
        </div>
      )}

      {/* WEEK VIEW (DEFAULT) */}
      {view === "Week" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days row */}
            <div className="grid grid-cols-8 border-b border-slate-900 text-center py-3.5 bg-slate-950/30 text-xs font-bold text-slate-400">
              <div className="border-r border-slate-900/60 font-mono">Time</div>
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center font-bold ${
                    day.toDateString() === new Date().toDateString()
                      ? "bg-rose-500 text-white"
                      : "text-slate-200"
                  }`}>{day.getDate()}</span>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="divide-y divide-slate-900/50">
              {hours.map((hour, idx) => (
                <div key={idx} className="grid grid-cols-8 min-h-[50px]">
                  {/* Hour label */}
                  <div className="border-r border-slate-900 text-[10px] font-mono text-slate-600 text-right pr-3 py-2.5">
                    {hour}
                  </div>

                  {/* Day slots */}
                  {weekDays.map((day, dIdx) => {
                    // Match items scheduled for this hour on this day index relative to today
                    const isToday = dIdx === new Date().getDay();
                    const dayBlocks = schedule.filter(b => {
                      // Simple hour starts matching
                      const bHour = b.start.split(":")[0];
                      const slotHour = hour.split(":")[0];
                      return bHour === slotHour && isToday; // For simulation, show today's schedule on current weekday slot
                    });

                    return (
                      <div key={dIdx} className="border-r border-slate-900/40 relative p-1 group min-h-[50px] hover:bg-slate-900/20">
                        {dayBlocks.map(block => (
                          <div
                            key={block.id}
                            className={`rounded-lg p-2.5 text-[10px] leading-tight flex flex-col justify-between shadow-sm border ${
                              block.isFocusBlock
                                ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                                : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                            }`}
                          >
                            <span className="font-bold truncate">{block.title}</span>
                            <span className="text-[9px] font-mono text-slate-500 mt-1">{block.start} - {block.end}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MONTH VIEW */}
      {view === "Month" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 grid grid-cols-7 divide-x divide-y divide-slate-900 overflow-hidden">
          {/* Month Weekdays headers */}
          {(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).map(day => (
            <div key={day} className="py-2.5 bg-slate-950/40 border-b border-slate-900 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
              {day}
            </div>
          ))}

          {/* Month Day grid cells */}
          {monthDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div 
                key={i} 
                className={`min-h-[100px] p-2 relative flex flex-col justify-between transition hover:bg-slate-900/10 ${
                  isCurrentMonth ? "bg-slate-950/10" : "bg-slate-950/40 opacity-30"
                }`}
              >
                <span className={`text-xs font-bold font-mono ${
                  isToday 
                    ? "bg-rose-500 text-white h-5 w-5 rounded-full flex items-center justify-center font-bold" 
                    : "text-slate-400"
                }`}>
                  {day.getDate()}
                </span>

                <div className="space-y-1 mt-2">
                  {/* Simulate a tiny calendar block indicator if anything exists for that date */}
                  {isToday && schedule.slice(0, 2).map(block => (
                    <div 
                      key={block.id} 
                      className={`rounded px-1.5 py-0.5 text-[8px] font-bold truncate border ${
                        block.isFocusBlock 
                          ? "bg-rose-500/15 border-rose-500/20 text-rose-400" 
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      }`}
                    >
                      {block.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY VIEW */}
      {view === "Day" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4 max-w-2xl mx-auto">
          <div className="text-center font-bold text-slate-300">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          
          <div className="space-y-3.5 divide-y divide-slate-900">
            {hours.map((hour, idx) => {
              const hourBlocks = schedule.filter(b => b.start.split(":")[0] === hour.split(":")[0]);
              
              return (
                <div key={idx} className="flex gap-4 pt-3.5 first:pt-0">
                  <div className="w-16 text-right font-mono text-slate-600 text-xs py-1">{hour}</div>
                  <div className="flex-1 min-h-[45px]">
                    {hourBlocks.map(block => (
                      <div
                        key={block.id}
                        className={`rounded-xl p-3 border text-xs leading-relaxed ${
                          block.isFocusBlock
                            ? "bg-rose-500/15 border-rose-500/20 text-rose-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="font-bold">{block.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{block.start} - {block.end}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {view === "Agenda" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 max-w-xl mx-auto space-y-4">
          <h3 className="font-bold text-white text-sm">Target focus milestones list</h3>
          <div className="space-y-3">
            {schedule.length > 0 ? (
              schedule.map(block => (
                <div 
                  key={block.id} 
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    block.isFocusBlock 
                      ? "border-rose-500/10 bg-rose-500/5 text-rose-400" 
                      : "border-slate-800 bg-slate-950/40 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{block.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Time allocation block</div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-900/80 px-3 py-1 rounded border border-slate-800">{block.start} - {block.end}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs">No focus allocations scheduled. Run 'AI Auto Schedule'.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
