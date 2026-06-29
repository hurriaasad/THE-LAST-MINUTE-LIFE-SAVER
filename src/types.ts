/**
 * Types and interfaces for The Last-Minute Life Saver
 */

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  duration?: number; // estimated duration in minutes
  priority?: "High" | "Medium" | "Low";
}

export interface Task {
  id: string;
  title: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  difficulty: "Hard" | "Medium" | "Easy";
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  deadline: string; // ISO date string or YYYY-MM-DD
  category: "Study" | "Work" | "Personal" | "Life Admin";
  notes?: string;
  completed: boolean;
  subtasks: SubTask[];
  dependencies?: string[]; // list of task IDs
  isEmergencyPlan?: boolean; // created by AI emergency crash plan
  recurring?: "Daily" | "Weekly" | "None";
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  completedDays: string[]; // YYYY-MM-DD
  streak: number;
  maxStreak: number;
  icon: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  duration: number; // in minutes
  timestamp: string; // ISO date string
  rating: number; // 1-5 focus quality
  soundUsed?: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  taskId?: string;
  isFocusBlock: boolean;
  isPostponed?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string
  xpReward: number;
  coinsReward: number;
}

export interface UserState {
  username: string;
  email: string;
  isAuthenticated: boolean;
  xp: number;
  coins: number;
  level: number;
  emergencyModeActive: boolean;
  e2eEncryptionEnabled: boolean;
  biometricLinked: boolean;
  tasks: Task[];
  habits: Habit[];
  schedule: ScheduleBlock[];
  focusSessions: FocusSession[];
  achievements: Achievement[];
}
