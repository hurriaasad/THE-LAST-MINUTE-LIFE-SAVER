import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Calendar, 
  ListTodo, 
  Flame, 
  ShieldAlert, 
  Clock, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Brain,
  Award,
  ChevronRight,
  Shield,
  Coins,
  Bell,
  Mic,
  MessageSquareCode
} from "lucide-react";
import AuthScreens from "./components/AuthScreens";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import CalendarView from "./components/CalendarView";
import FocusMode from "./components/FocusMode";
import HabitsTracker from "./components/HabitsTracker";
import AiAssistant from "./components/AiAssistant";
import Settings from "./components/Settings";
import { encryptData, decryptData } from "./components/EncryptionUtility";
import { Task, Habit, ScheduleBlock, FocusSession, Achievement } from "./types";

export default function App() {
  // Navigation & User session states
  const [session, setSession] = useState<{
    token: string | null;
    username: string;
    email: string;
    level: number;
    xp: number;
    coins: number;
    emergencyModeActive: boolean;
    e2eEncryptionEnabled: boolean;
    biometricLinked: boolean;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    "landing" | "auth" | "dashboard" | "tasks" | "calendar" | "goals" | "habits" | "analytics" | "assistant" | "settings"
  >("landing");

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // AI loading trigger
  const [aiLoadingTaskId, setAiLoadingTaskId] = useState<string | null>(null);

  // New Hackathon Elements & States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [focusModeOnlyCurrent, setFocusModeOnlyCurrent] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Procrastination Risk Detected",
      body: "Submit Biology Lab Report is due tomorrow! Rescheduled minor grocery list to clear 2h study zone.",
      type: "alert",
      time: "Just now",
      suggestion: "Enter Focus Mode"
    },
    {
      id: "notif-2",
      title: "Streak Maintain Bonus Ready",
      body: "Yoga Practice habit is at 5-day streak! Check off today to unlock +50 XP and Pro Badge.",
      type: "streak",
      time: "5m ago",
      suggestion: "Check off"
    },
    {
      id: "notif-3",
      title: "Optimal Hour Opening",
      body: "Focus levels are statistically highest between 6:00 PM and 8:00 PM. Lock in a Pomodoro Session.",
      type: "tip",
      time: "1h ago",
      suggestion: "Schedule block"
    }
  ]);

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  };

  // Initialize with robust mock sandbox data so preview looks astonishing
  useEffect(() => {
    // Tasks
    setTasks([
      {
        id: "task-1",
        title: "Submit Biology Lab Report Outline",
        category: "Study",
        priority: "Urgent",
        difficulty: "Hard",
        estimatedTime: 90,
        actualTime: 0,
        deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
        completed: false,
        subtasks: [
          { id: "sub-1-1", title: "Review lab manual page 23-28", completed: true, duration: 15 },
          { id: "sub-1-2", title: "Draft hypothesis and variable list", completed: false, duration: 25 },
          { id: "sub-1-3", title: "Plot graph of findings in D3", completed: false, duration: 50 },
        ],
        notes: "Remember to reference standard deviation calculations.",
      },
      {
        id: "task-2",
        title: "Review React Spring Transition Bug",
        category: "Work",
        priority: "High",
        difficulty: "Medium",
        estimatedTime: 45,
        actualTime: 0,
        deadline: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        completed: false,
        subtasks: [],
        notes: "Check if the ref is being detached during unmount.",
      },
    ]);

    // Habits
    setHabits([
      {
        id: "habit-1",
        name: "Morning Core Meditation",
        category: "Health",
        icon: "🧘",
        streak: 5,
        maxStreak: 5,
        completedDays: [
          new Date(Date.now() - 86400000).toISOString().split("T")[0],
          new Date(Date.now() - 172800000).toISOString().split("T")[0],
        ],
      },
      {
        id: "habit-2",
        name: "Read 1 Research Article",
        category: "Focus",
        icon: "📚",
        streak: 12,
        maxStreak: 12,
        completedDays: [
          new Date(Date.now() - 86400000).toISOString().split("T")[0],
        ],
      },
    ]);

    // Schedule Blocks
    setSchedule([
      { id: "sched-1", title: "Morning Routine & Coffee", start: "08:30", end: "09:00", isFocusBlock: false },
      { id: "sched-2", title: "Deep Focus: Biology Lab Report", start: "10:00", end: "11:30", isFocusBlock: true },
      { id: "sched-3", title: "Consult AI Coach Chat", start: "14:00", end: "14:30", isFocusBlock: false },
    ]);

    // Achievements
    setAchievements([
      { id: "ach-1", title: "First Sprint Master", description: "Complete your first deep focus block", xpReward: 50, icon: "⚡", unlockedAt: new Date().toISOString() },
      { id: "ach-2", title: "Distraction Shield Activated", description: "Use white noise loops during study session", xpReward: 30, icon: "🛡️" },
      { id: "ach-3", title: "Emergency Hero", description: "Fulfill all high priorities under emergency mode", xpReward: 100, icon: "🚨" },
    ]);
  }, []);

  // Handlers
  const handleLoginSuccess = (username: string, email: string, biometricLinked: boolean) => {
    setSession({
      token: "mock-session-jwt-token-xyz",
      username,
      email,
      level: 1,
      xp: 45,
      coins: 200,
      emergencyModeActive: false,
      e2eEncryptionEnabled: true,
      biometricLinked,
    });
    setActiveTab("dashboard");

    // Automatically attempt cloud pull
    handleCloudRestore(username, "mock-session-jwt-token-xyz");
  };

  const handleStartDemoSandbox = () => {
    setSession({
      token: "sandbox-token-123",
      username: "Sandbox Warrior",
      email: "sandbox@lifesaver.ai",
      level: 3,
      xp: 240,
      coins: 450,
      emergencyModeActive: false,
      e2eEncryptionEnabled: false,
      biometricLinked: false,
    });
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setSession(null);
    setActiveTab("landing");
  };

  // Gamification rewards adder
  const addRewards = (xpReward: number, coinsReward: number) => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return null;
      const newXp = prev.xp + xpReward;
      const currentLvl = prev.level;
      const newLvl = Math.floor(newXp / 100) + 1;
      
      return {
        ...prev,
        xp: newXp,
        level: newLvl,
        coins: prev.coins + coinsReward,
      };
    });
  };

  // Add Task
  const handleAddTask = (newTaskData: Omit<Task, "id" | "completed" | "actualTime" | "subtasks">) => {
    const task: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      completed: false,
      actualTime: 0,
      subtasks: [],
    };
    setTasks(prev => [task, ...prev]);
    addRewards(15, 10);
  };

  // Update Task
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // If completing, award big rewards
        if (updates.completed && !t.completed) {
          addRewards(50, 40);
          triggerConfetti();
          // Add congratulations notification
          setNotifications(prevNotif => [
            {
              id: `notif-congrats-${crypto.randomUUID()}`,
              title: "🎉 Congratulations on Your Task!",
              body: `Spectacular job completing "${t.title}"! You earned +50 XP and +40 Gold. Cognitive defenses reinforced!`,
              type: "streak",
              time: "Just now",
              suggestion: "Keep it up!"
            },
            ...prevNotif
          ]);
        }
        return updated;
      }
      return t;
    }));
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // AI Breakdown via server-side Gemini integration
  const handleAiBreakdown = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setAiLoadingTaskId(taskId);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Break the task "${task.title}" into exactly 3 highly actionable study subtasks with estimated minutes. Provide subtasks in structured actions format.`,
          taskList: [task],
          schedule: [],
          focusScore: 80,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Breakdown failed");

      // Extract generated subtasks or fallback
      let subtasksList = [
        { id: crypto.randomUUID(), title: "Analyze key specifications & constraints", completed: false, duration: 15 },
        { id: crypto.randomUUID(), title: "Draft first modular component prototype", completed: false, duration: 20 },
        { id: crypto.randomUUID(), title: "Run verification suite & debug layout", completed: false, duration: 10 },
      ];

      // If AI returned actions with subtasks, let's use them!
      if (data.actions) {
        const createSubtasksAction = data.actions.find((a: any) => a.type === "CREATE_SUBTASKS");
        if (createSubtasksAction && createSubtasksAction.payload?.subtasks) {
          subtasksList = createSubtasksAction.payload.subtasks.map((s: any) => ({
            id: crypto.randomUUID(),
            title: s.title,
            completed: false,
            duration: s.duration || 15,
          }));
        }
      }

      handleUpdateTask(taskId, { subtasks: subtasksList });
      addRewards(30, 20);
    } catch (e) {
      // Fallback
      const fallbackSubs = [
        { id: crypto.randomUUID(), title: "Phase 1: Research and note collection", completed: false, duration: 15 },
        { id: crypto.randomUUID(), title: "Phase 2: Execution and layout structuring", completed: false, duration: 25 },
        { id: crypto.randomUUID(), title: "Phase 3: Final review and proofing", completed: false, duration: 10 },
      ];
      handleUpdateTask(taskId, { subtasks: fallbackSubs });
    } finally {
      setAiLoadingTaskId(null);
    }
  };

  // AI Auto-Scheduling logic
  const handleAutoSchedule = () => {
    // Generate scheduled Blocks matching our pending tasks!
    const pending = tasks.filter(t => !t.completed);
    const newBlocks: ScheduleBlock[] = [
      { id: "sched-1", title: "Morning Routine & Coffee", start: "08:30", end: "09:00", isFocusBlock: false },
    ];

    let hour = 10;
    pending.forEach((task, idx) => {
      newBlocks.push({
        id: `sched-auto-${idx}`,
        title: `Deep Focus: ${task.title}`,
        start: `${hour.toString().padStart(2, "0")}:00`,
        end: `${(hour + 1).toString().padStart(2, "0")}:30`,
        isFocusBlock: true,
      });
      hour += 3;
    });

    setSchedule(newBlocks);
    addRewards(40, 20);

    // Unlock achievement
    setAchievements(prev => prev.map(a => a.id === "ach-2" ? { ...a, unlockedAt: new Date().toISOString() } : a));
  };

  // Clear Calendar Schedule
  const handleClearSchedule = () => {
    setSchedule([]);
  };

  // Complete Focus Session
  const handleFocusSessionComplete = (sessionDetails: Omit<FocusSession, "id" | "timestamp">) => {
    const focus: FocusSession = {
      ...sessionDetails,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setFocusSessions(prev => [focus, ...prev]);
    addRewards(75, 50); // Big rewards for focus time!
  };

  // Toggle Habit Complete
  const handleToggleHabitDay = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const completed = h.completedDays.includes(dateStr);
        let days = [...h.completedDays];
        let streak = h.streak;

        if (completed) {
          days = days.filter(d => d !== dateStr);
          streak = Math.max(0, streak - 1);
        } else {
          days.push(dateStr);
          streak += 1;
          addRewards(20, 15);
        }

        return { ...h, completedDays: days, streak };
      }
      return h;
    }));
  };

  // Add Habit
  const handleAddHabit = (name: string, category: string, icon: string) => {
    const newH: Habit = {
      id: crypto.randomUUID(),
      name,
      category,
      icon,
      streak: 1,
      maxStreak: 1,
      completedDays: [new Date().toISOString().split("T")[0]],
    };
    setHabits(prev => [...prev, newH]);
    addRewards(10, 5);
  };

  // Trigger Emergency Mode
  const handleTriggerEmergency = () => {
    if (!session) return;
    
    const activeState = !session.emergencyModeActive;
    setSession(prev => prev ? { ...prev, emergencyModeActive: activeState } : null);

    if (activeState) {
      // Re-structure schedule to focus mode blocks
      setSchedule([
        { id: "sched-em-1", title: "🔴 SPRINT: Crucial Assignment Prep", start: "09:00", end: "11:00", isFocusBlock: true },
        { id: "sched-em-2", title: "🧘 Coach Checkin & Break", start: "11:00", end: "11:30", isFocusBlock: false },
        { id: "sched-em-3", title: "🔴 SPRINT: Final Proofing & Submission", start: "13:00", end: "15:00", isFocusBlock: true },
      ]);
      // Mark all past due tasks with emergency crash plan tag!
      setTasks(prev => prev.map(t => (!t.completed ? { ...t, isEmergencyPlan: true } : t)));

      // Unlock Emergency Hero Badge
      setAchievements(prev => prev.map(a => a.id === "ach-3" ? { ...a, unlockedAt: new Date().toISOString() } : a));
    } else {
      // Reset
      setTasks(prev => prev.map(t => ({ ...t, isEmergencyPlan: false })));
    }
  };

  // E2E Encryption and Cloud Sync Handlers
  const handleCloudBackup = async () => {
    if (!session) return;

    const rawData = JSON.stringify({
      tasks,
      habits,
      schedule,
      focusSessions,
    });

    let payload = rawData;

    // Apply E2E encryption if enabled
    if (session.e2eEncryptionEnabled) {
      const key = localStorage.getItem("life_saver_sec_key") || "fallback-secret-phrase";
      payload = await encryptData(rawData, key);
    }

    const res = await fetch("/api/workspace/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        username: session.username,
        workspaceData: payload,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Cloud Save failed");
    }
  };

  const handleCloudRestore = async (usr?: string, tok?: string) => {
    const currentUsername = usr || session?.username;
    const currentToken = tok || session?.token;

    if (!currentUsername || !currentToken) return;

    try {
      const res = await fetch(`/api/workspace/load?username=${currentUsername}`, {
        headers: {
          "Authorization": `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.workspaceData) return;

      let decrypted = data.workspaceData;

      if (session?.e2eEncryptionEnabled || true) {
        const key = localStorage.getItem("life_saver_sec_key") || "fallback-secret-phrase";
        try {
          decrypted = await decryptData(data.workspaceData, key);
        } catch (e) {
          // Decryption failed (could be due to incorrect passphrase, keep previous state)
          return;
        }
      }

      const parsed = JSON.parse(decrypted);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.schedule) setSchedule(parsed.schedule);
      if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
    } catch (e) {
      console.warn("Restoring cloud state failed: fallback local states will continue.");
    }
  };

  // AI assistant callbacks panel dispatcher
  const handleExecuteAiActions = (actions: any[]) => {
    actions.forEach(action => {
      if (action.type === "CREATE_TASKS" && action.payload?.tasks) {
        action.payload.tasks.forEach((t: any) => {
          handleAddTask({
            title: t.title,
            category: t.category || "Study",
            priority: t.priority || "Medium",
            difficulty: t.difficulty || "Medium",
            estimatedTime: t.estimatedTime || 45,
            deadline: t.deadline || new Date(Date.now() + 86400000).toISOString().split("T")[0],
          });
        });
      }

      if (action.type === "TRIGGER_EMERGENCY") {
        handleTriggerEmergency();
      }

      if (action.type === "AUTO_SCHEDULE") {
        handleAutoSchedule();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Landing view */}
      {activeTab === "landing" && (
        <LandingPage 
          onStartDemo={handleStartDemoSandbox} 
          onGoToAuth={() => setActiveTab("auth")} 
        />
      )}

      {/* Authentication screens */}
      {activeTab === "auth" && (
        <AuthScreens onLoginSuccess={handleLoginSuccess} currentUsername="" />
      )}

      {/* Main logged in workspace layout */}
      {session && activeTab !== "landing" && activeTab !== "auth" && (
        <div className="flex min-h-screen flex-col md:flex-row relative overflow-hidden bg-[#040815] selection:bg-rose-500 selection:text-white">
          {/* Animated Ambient background blobs */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.05] blur-[120px] pointer-events-none animate-blob-slow" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/[0.04] blur-[140px] pointer-events-none animate-blob-slow-reverse" />
          <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.02] blur-[90px] pointer-events-none animate-blob-slow" />

          {/* Vertical Sidebar / Navigation */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900/40 bg-slate-950/45 backdrop-blur-2xl p-5 flex flex-col justify-between shrink-0 relative z-10">
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-sm text-slate-100 tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">LifeSaver AI</span>
              </div>

              {/* Profile Card Summary with Smart Notification Bell */}
              <div className="p-3 bg-slate-900/30 rounded-xl border border-white/[0.04] backdrop-blur-md flex items-center justify-between relative shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0">
                    {session.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{session.username}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>Level {session.level}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Coins className="h-2.5 w-2.5" />
                        {session.coins}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Notification Bell Icon */}
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-1.5 rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 hover:text-rose-400 transition cursor-pointer shrink-0"
                >
                  <Bell className="h-3.5 w-3.5 text-slate-400" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 border border-slate-950 animate-ping"></span>
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 border border-slate-950"></span>
                </button>

                {/* Notifications Panel overlay */}
                {isNotificationsOpen && (
                  <div className="absolute top-12 left-0 right-0 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl z-50 space-y-3.5 animate-slide-in-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-[10px] uppercase tracking-widest font-black text-rose-400">AI Diagnostics</span>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-[9px] text-slate-500 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className="text-left space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-white">
                            <span>{n.title}</span>
                            <span className="text-[9px] font-mono font-normal text-slate-600">{n.time}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-normal">{n.body}</p>
                          <button
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              if (n.type === "alert") {
                                handleTriggerEmergency();
                                setActiveTab("dashboard");
                              } else if (n.type === "streak") {
                                if (habits[0]) {
                                  const todayStr = new Date().toISOString().split("T")[0];
                                  handleToggleHabitDay(habits[0].id, todayStr);
                                }
                              } else if (n.type === "tip") {
                                setActiveTab("goals");
                              }
                            }}
                            className="text-[8px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <span>⚡ {n.suggestion}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav links */}
              <nav className="space-y-1 text-xs font-semibold text-slate-400">
                {[
                  { id: "dashboard", label: "Dashboard", icon: <Brain className="h-4.5 w-4.5" /> },
                  { id: "tasks", label: "Smart Tasks", icon: <ListTodo className="h-4.5 w-4.5" /> },
                  { id: "calendar", label: "Focus Calendar", icon: <Calendar className="h-4.5 w-4.5" /> },
                  { id: "habits", label: "Habit Streaks", icon: <Flame className="h-4.5 w-4.5" /> },
                  { id: "goals", label: "Focus Timer", icon: <Clock className="h-4.5 w-4.5" /> },
                  { id: "assistant", label: "AI Coach Chat", icon: <Sparkles className="h-4.5 w-4.5" /> },
                  { id: "settings", label: "Security & Cloud", icon: <SettingsIcon className="h-4.5 w-4.5" /> },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                        isActive
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "hover:text-white hover:bg-slate-900/30"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Row */}
            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-400 transition"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out Session
              </button>
            </div>
          </aside>

          {/* Main Content Workspace Container */}
          <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto w-full">
            {activeTab === "dashboard" && (
              <Dashboard
                userState={session}
                tasks={tasks}
                habits={habits}
                schedule={schedule}
                focusSessions={focusSessions}
                achievements={achievements}
                onAddTask={handleAddTask}
                onStartFocus={(taskId) => {
                  setActiveTab("goals");
                }}
                onNavigate={(tab) => setActiveTab(tab as any)}
                onTriggerEmergency={handleTriggerEmergency}
              />
            )}

            {activeTab === "tasks" && (
              <TaskManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAiBreakdown={handleAiBreakdown}
                aiLoadingTaskId={aiLoadingTaskId}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView
                tasks={tasks}
                schedule={schedule}
                onAddScheduleBlock={(b) => setSchedule(prev => [...prev, { ...b, id: crypto.randomUUID() }])}
                onAutoSchedule={handleAutoSchedule}
                onClearSchedule={handleClearSchedule}
              />
            )}

            {activeTab === "habits" && (
              <HabitsTracker
                habits={habits}
                achievements={achievements}
                onAddHabit={handleAddHabit}
                onToggleHabitDay={handleToggleHabitDay}
                userState={session}
              />
            )}

            {activeTab === "goals" && (
              <FocusMode
                onFocusSessionComplete={handleFocusSessionComplete}
                activeTaskTitle={tasks.filter((t) => !t.completed)[0]?.title}
                activeTaskId={tasks.filter((t) => !t.completed)[0]?.id}
              />
            )}

            {activeTab === "assistant" && (
              <AiAssistant
                tasks={tasks}
                schedule={schedule}
                focusScore={90}
                onExecuteAiActions={handleExecuteAiActions}
              />
            )}

            {activeTab === "settings" && (
              <Settings
                userState={session}
                onUpdateState={(updates) => setSession(prev => prev ? { ...prev, ...updates } : null)}
                onCloudBackup={handleCloudBackup}
                onCloudRestore={() => handleCloudRestore()}
              />
            )}
          </main>
        </div>
      )}

      {/* Confetti Celebrating Particle Canvas */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => {
            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 2.5}s`;
            const color = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-sky-500", "bg-pink-500"][Math.floor(Math.random() * 6)];
            const size = Math.random() > 0.5 ? "h-3 w-1.5" : "h-2 w-2";
            return (
              <div
                key={i}
                className={`absolute rounded-sm ${size} ${color} shadow-lg`}
                style={{
                  left,
                  top: "-20px",
                  animation: "confetti-fall 3.5s linear infinite",
                  animationDelay: delay,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Floating Glowing breathing AI Assistant Orb button */}
      {session && activeTab !== "landing" && activeTab !== "auth" && (
        <div className="fixed bottom-6 right-6 z-45 flex flex-col items-end gap-3 group">
          <div className="bg-slate-950/90 border border-slate-800 text-[10px] font-bold tracking-widest text-rose-400 px-3 py-1.5 rounded-lg shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition duration-300 pointer-events-none uppercase font-mono">
            Chat to AI Coach (Voice Enabled)
          </div>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="h-14 w-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-rose-500 to-amber-500 shadow-2xl cursor-pointer animate-orb-breathing active:scale-95 transition"
          >
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </button>
        </div>
      )}

      {/* Right sliding AI Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/98 border-l border-slate-900 shadow-2xl z-50 flex flex-col animate-slide-in-right backdrop-blur-2xl">
          <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/40">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-300 font-mono">AI Cognitive Coach</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-xs font-bold font-mono text-slate-500 hover:text-white hover:bg-slate-900 px-2.5 py-1 rounded transition"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AiAssistant
              tasks={tasks}
              schedule={schedule}
              focusScore={92}
              onExecuteAiActions={handleExecuteAiActions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
