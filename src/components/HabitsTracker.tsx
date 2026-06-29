import React, { useState } from "react";
import { Plus, Check, Award, ShieldAlert, Zap, Flame, Grid, Trophy, Coins } from "lucide-react";
import { Habit, Achievement } from "../types";

interface HabitsTrackerProps {
  habits: Habit[];
  achievements: Achievement[];
  onAddHabit: (name: string, category: string, icon: string) => void;
  onToggleHabitDay: (id: string, dateStr: string) => void;
  userState: {
    level: number;
    xp: number;
    coins: number;
  };
}

export default function HabitsTracker({
  habits,
  achievements,
  onAddHabit,
  onToggleHabitDay,
  userState,
}: HabitsTrackerProps) {
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Focus");
  const [newHabitIcon, setNewHabitIcon] = useState("📚");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    onAddHabit(newHabitName.trim(), newHabitCategory, newHabitIcon);
    setNewHabitName("");
  };

  // Build a simple 7-column x 4-row matrix for a 28-day habit completion heatmap!
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column: Habits & Streaks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Habits Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-md flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              Daily Habit Streaks
            </h3>
          </div>

          <div className="space-y-3.5">
            {habits.length > 0 ? (
              habits.map((habit) => {
                const isCompletedToday = habit.completedDays.includes(todayStr);

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-850 bg-slate-950/40 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Circular Progress Ring wrapping Icon */}
                      <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 44 44">
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#111827"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke={isCompletedToday ? "#ec4899" : "#f43f5e"}
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={113}
                            strokeDashoffset={isCompletedToday ? 0 : 113 - (Math.min(10, habit.streak) / 10) * 113}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="relative z-10 text-base">{habit.icon || "🌱"}</div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{habit.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{habit.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <Flame className="h-3 w-3 fill-amber-500" />
                            {habit.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleHabitDay(habit.id, todayStr)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition shrink-0 ${
                        isCompletedToday
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-slate-800 bg-slate-950 hover:border-rose-500/50"
                      }`}
                    >
                      <Check className={`h-5 w-5 stroke-[2.5] ${isCompletedToday ? "text-white" : "text-slate-600"}`} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs">No daily habits tracked yet. Create one below!</div>
            )}
          </div>

          {/* Quick Create Habit */}
          <form onSubmit={handleCreateHabit} className="flex gap-2 border-t border-slate-900 pt-5">
            <input
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Read research paper"
              className="flex-grow rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
            />
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-rose-500"
            >
              <option value="Focus">Focus</option>
              <option value="Health">Health</option>
              <option value="Studies">Studies</option>
              <option value="Routine">Routine</option>
            </select>
            <select
              value={newHabitIcon}
              onChange={(e) => setNewHabitIcon(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs outline-none focus:border-rose-500"
            >
              <option value="📚">📚</option>
              <option value="🧘">🧘</option>
              <option value="💧">💧</option>
              <option value="🏃">🏃</option>
              <option value="💤">💤</option>
              <option value="✍️">✍️</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition px-4 text-white"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

        {/* Heatmap Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 md:p-6 space-y-4">
          <h3 className="font-extrabold text-white text-md flex items-center gap-2">
            <Grid className="h-5 w-5 text-indigo-400" />
            28-Day Focus Activity Grid
          </h3>
          <p className="text-xs text-slate-500">Visual mapping of overall daily consistency and milestone check-offs</p>

          <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-slate-950/40 border border-slate-900 justify-center">
            {heatmapDays.map((dateStr, idx) => {
              // Check how many habits completed on this date
              const completedCount = habits.filter((h) => h.completedDays.includes(dateStr)).length;
              let levelClass = "bg-slate-900 border-slate-850/60"; // none
              if (completedCount === 1) levelClass = "bg-rose-500/20 border-rose-500/30 text-rose-400";
              if (completedCount === 2) levelClass = "bg-rose-500/40 border-rose-500/50 text-rose-300";
              if (completedCount >= 3) levelClass = "bg-rose-500 border-rose-600 text-white font-black";

              return (
                <div
                  key={idx}
                  title={`${dateStr}: ${completedCount} habits completed`}
                  className={`h-7 w-7 rounded-md border flex items-center justify-center text-[9px] font-mono transition hover:scale-105 select-none ${levelClass}`}
                >
                  {completedCount > 0 ? completedCount : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Gamification Rewards Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 md:p-6 space-y-5">
        <h3 className="font-extrabold text-white text-md flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Achievements & Store
        </h3>

        {/* Level Stats */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">Level Progression</span>
            <span className="text-xs font-mono font-bold text-amber-500">Lvl {userState.level}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-grow rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(userState.xp % 100)}%` }}></div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">{userState.xp % 100}/100 XP</span>
          </div>

          <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Coins className="h-4.5 w-4.5 text-amber-500" />
              {userState.coins} gold coins
            </span>
            <span>+{userState.level * 10} XP per task</span>
          </div>
        </div>

        {/* Badges and achievements list */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Available Milestones</div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {achievements.map((ach) => {
              const isUnlocked = !!ach.unlockedAt;
              return (
                <div 
                  key={ach.id} 
                  className={`p-3.5 rounded-xl border transition ${
                    isUnlocked 
                      ? "border-emerald-500/15 bg-emerald-500/[0.02] text-emerald-300" 
                      : "border-slate-850 bg-slate-950/20 text-slate-500"
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      isUnlocked ? "bg-emerald-500/10 text-white" : "bg-slate-900/60"
                    }`}>
                      {ach.icon || "🏆"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{ach.title}</div>
                      <div className="text-[10px] mt-0.5 line-clamp-1">{ach.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
