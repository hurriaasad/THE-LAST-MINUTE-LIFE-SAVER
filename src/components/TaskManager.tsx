import React, { useState } from "react";
import { Plus, Check, Trash2, Calendar, Clock, AlertCircle, Sparkles, FolderPlus, ListTodo, ChevronDown, ChevronUp } from "lucide-react";
import { Task, SubTask } from "../types";

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "completed" | "actualTime" | "subtasks">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAiBreakdown: (taskId: string) => void;
  aiLoadingTaskId: string | null;
}

export default function TaskManager({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAiBreakdown,
  aiLoadingTaskId,
}: TaskManagerProps) {
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("Pending");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Task["category"]>("All");
  
  // Add task states
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>("Medium");
  const [estimatedTime, setEstimatedTime] = useState(45);
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<Task["category"]>("Study");
  const [notes, setNotes] = useState("");
  
  // Active details pane state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // New subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      priority,
      difficulty,
      estimatedTime,
      deadline: deadline || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      category,
      notes,
    });

    // Reset Form
    setTitle("");
    setNotes("");
    setEstimatedTime(45);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const handleAddSubtaskManual = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSub: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onUpdateTask(taskId, { subtasks: [...task.subtasks, newSub] });
    setNewSubtaskTitle("");
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = filter === "All" || (filter === "Completed" ? task.completed : !task.completed);
    const matchCategory = categoryFilter === "All" || task.category === categoryFilter;
    return matchStatus && matchCategory;
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column: Task Creator */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 h-fit space-y-5">
        <h3 className="font-extrabold text-white text-md flex items-center gap-2">
          <FolderPlus className="h-5 w-5 text-rose-500" />
          Create Smart Task
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write biology essay outline"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task["category"])}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-rose-500"
              >
                <option value="Study">Study / Course</option>
                <option value="Work">Work / Project</option>
                <option value="Personal">Personal</option>
                <option value="Life Admin">Life Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-2 py-2.5 text-[11px] text-slate-300 outline-none focus:border-rose-500"
              >
                <option value="Urgent">⚠️ Urgent</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Task["difficulty"])}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-2 py-2.5 text-[11px] text-slate-300 outline-none focus:border-rose-500"
              >
                <option value="Hard">🔥 Hard</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Easy">🌱 Easy</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Est. Time (m)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Notes / Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, link, or steps..."
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 font-semibold text-xs text-white transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-rose-500/10"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Task
          </button>
        </form>
      </div>

      {/* Right Column: Task List (2 cols wide) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="flex gap-2">
            {(["Pending", "Completed", "All"] as const).map(option => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition ${
                  filter === option
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {(["All", "Study", "Work", "Personal", "Life Admin"] as const).map(option => (
              <button
                key={option}
                onClick={() => setCategoryFilter(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                  categoryFilter === option
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Task Items Grid */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => {
              const isExpanded = expandedTaskId === task.id;
              const completedSubs = task.subtasks.filter(s => s.completed).length;
              const hasSubs = task.subtasks.length > 0;
              const progressPct = hasSubs ? Math.round((completedSubs / task.subtasks.length) * 100) : 0;

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border transition duration-200 overflow-hidden ${
                    task.completed 
                      ? "border-slate-900 bg-slate-950/20 opacity-60" 
                      : task.isEmergencyPlan 
                      ? "border-rose-500/30 bg-rose-500/[0.02] shadow-sm shadow-rose-500/5"
                      : "border-slate-800 bg-slate-900/10 hover:border-slate-700"
                  }`}
                >
                  {/* Task Summary Line */}
                  <div className="flex items-center justify-between p-4 md:p-5 gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition shrink-0 ${
                          task.completed
                            ? "bg-rose-500 border-rose-600 text-white"
                            : "border-slate-700 hover:border-rose-500 bg-slate-950/40"
                        }`}
                      >
                        {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold leading-tight ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                            {task.title}
                          </span>
                          {task.isEmergencyPlan && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-extrabold text-rose-400 uppercase animate-pulse">Crash Plan</span>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                          <span className={`font-semibold ${
                            task.priority === "Urgent" ? "text-rose-400" : task.priority === "High" ? "text-amber-400" : "text-slate-500"
                          }`}>
                            {task.priority}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTime}m
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="rounded-lg p-1.5 border border-slate-800/80 bg-slate-950/20 text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="rounded-lg p-1.5 border border-slate-800/80 bg-slate-950/20 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Checklist & Subtask generator */}
                  {isExpanded && (
                    <div className="border-t border-slate-900 bg-slate-950/40 p-5 space-y-4">
                      {task.notes && (
                        <div className="text-xs text-slate-400 bg-slate-900/25 border border-slate-800/40 rounded-xl p-3.5">
                          <b>Notes</b>: {task.notes}
                        </div>
                      )}

                      {/* Subtasks header */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-slate-300">Subtask Milestones Checklist</div>
                        <button
                          type="button"
                          disabled={aiLoadingTaskId === task.id}
                          onClick={() => onAiBreakdown(task.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition px-2.5 py-1 text-[10px] font-bold tracking-wide text-rose-400 disabled:opacity-50"
                        >
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          {aiLoadingTaskId === task.id ? "Analyzing..." : "AI Breakdown Sprints"}
                        </button>
                      </div>

                      {/* Progress bar */}
                      {hasSubs && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                            <span>Sprints Completed</span>
                            <span>{completedSubs}/{task.subtasks.length} ({progressPct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Subtask list */}
                      <div className="space-y-2">
                        {task.subtasks.map(sub => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-900 bg-slate-950/30"
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleToggleSubtask(task.id, sub.id)}
                                className={`flex h-4 w-4 items-center justify-center rounded border transition shrink-0 ${
                                  sub.completed
                                    ? "bg-indigo-500 border-indigo-600 text-white"
                                    : "border-slate-800 hover:border-indigo-500 bg-slate-950/40"
                                }`}
                              >
                                {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </button>
                              <span className={`text-xs ${sub.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                                {sub.title}
                              </span>
                            </div>
                            {sub.duration && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded">{sub.duration}m</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Manual subtask adder */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add custom subtask milestone"
                          className="flex-1 rounded-lg border border-slate-900 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubtaskManual(task.id)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 p-2 text-white border border-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl p-8">
              <ListTodo className="mx-auto h-12 w-12 text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-400">No matching tasks found</h4>
              <p className="text-xs text-slate-500 mt-1">Get started by creating a smart task or asking the AI companion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
