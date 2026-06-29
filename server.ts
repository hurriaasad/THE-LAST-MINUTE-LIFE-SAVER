import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to read database
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    return { users: {} };
  }
}

// Helper to write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Simple password hashing
function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// --- API ROUTES ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Authentication: Register
app.post("/api/auth/register", (req: any, res: any) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();

  // Check if user exists
  if (db.users[normUsername]) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = crypto.randomUUID();
  db.users[normUsername] = {
    userId,
    username: normUsername,
    email: email || `${normUsername}@example.com`,
    passwordHash: hashPassword(password),
    biometricKey: null,
    data: null,
    createdAt: new Date().toISOString(),
  };

  writeDb(db);
  res.json({ success: true, userId, username: normUsername });
});

// Authentication: Login
app.post("/api/auth/login", (req: any, res: any) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();
  const user = db.users[normUsername];

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({
    success: true,
    userId: user.userId,
    username: user.username,
    email: user.email,
    hasBiometrics: !!user.biometricKey,
  });
});

// Authentication: Biometric Registration
app.post("/api/auth/biometric/register", (req: any, res: any) => {
  const { username, challenge, publicKey } = req.body;
  if (!username || !publicKey) {
    return res.status(400).json({ error: "Username and public key are required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();
  const user = db.users[normUsername];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.biometricKey = publicKey;
  writeDb(db);

  res.json({ success: true, message: "Biometric security credential linked successfully" });
});

// Authentication: Biometric Verification / Login
app.post("/api/auth/biometric/login", (req: any, res: any) => {
  const { username, signature, challenge } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();
  const user = db.users[normUsername];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.biometricKey) {
    return res.status(400).json({ error: "Biometric login is not configured for this user" });
  }

  // Verify biometric login (we accept the simulated biometric validation pass from client)
  res.json({
    success: true,
    userId: user.userId,
    username: user.username,
    email: user.email,
  });
});

// Workspace State: Save (Backup)
app.post("/api/workspace/save", (req: any, res: any) => {
  const { username, data } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();
  const user = db.users[normUsername];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.data = data; // Could be E2E encrypted string or JSON object
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ success: true, message: "Workspace state backed up securely to the cloud" });
});

// Workspace State: Load
app.post("/api/workspace/load", (req: any, res: any) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const db = readDb();
  const normUsername = username.toLowerCase().trim();
  const user = db.users[normUsername];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ success: true, data: user.data });
});

// AI Assistant Chat: Process task planning and advice
app.post("/api/gemini/chat", async (req: any, res: any) => {
  const { message, chatHistory, taskList, schedule, focusScore } = req.body;

  try {
    const isMock = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY === "MOCK_KEY";

    if (isMock) {
      // Return highly structured high-fidelity mock response that mimics Gemini
      const lowered = message.toLowerCase();
      let reply = "";
      let actions: any[] = [];

      if (lowered.includes("assignment") || lowered.includes("due") || lowered.includes("exam") || lowered.includes("study")) {
        reply = `### 🚨 Crash Plan Activated: Assignment Breakdown & Scheduling

I noticed you have an important deadline approaching! Don't panic—as your **Last-Minute Life Saver**, I've analyzed your upcoming due date and created an optimized action plan. 

I've divided the remaining preparation into four hyper-focused, manageable sprints, scheduled breaks to prevent cognitive fatigue, and blocked out distracting hours.

Here is the breakdown:
1. **Sprint 1: Core Research & Outline** (Est. completion: 45m) - *Starts immediately*
2. **Sprint 2: Drafting Core Arguments / Main Implementation** (Est. completion: 90m)
3. **Sprint 3: Proofreading & Code Cleanup** (Est. completion: 30m)
4. **Sprint 4: Submission Dry-Run & Polish** (Est. completion: 20m)

I have automatically rescheduled your secondary tasks (like grocery shopping) to tomorrow and blocked out 6:00 PM to 9:30 PM for deep focus. Let's start now!`;

        actions = [
          {
            type: "ADD_SUBTASKS",
            taskName: message || "Urgent Assignment",
            subtasks: [
              { title: "Research & Outline key topics", duration: 45, priority: "High" },
              { title: "Draft core contents / Write main code", duration: 90, priority: "High" },
              { title: "Review, proofread, and verify requirements", duration: 30, priority: "Medium" },
              { title: "Final polish, exports, and submission", duration: 20, priority: "Low" }
            ]
          },
          {
            type: "REARRANGE_SCHEDULE",
            blockFocusStart: "18:00",
            blockFocusEnd: "21:30",
            postponedTasks: ["Grocery Shopping", "Clean room"]
          }
        ];
      } else if (lowered.includes("procrastinat") || lowered.includes("distract") || lowered.includes("stuck") || lowered.includes("lazy")) {
        reply = `### 🛡️ Anti-Procrastination Shield Activated!

It's completely normal to feel stuck or unmotivated. The key is to **lower the activation energy** needed to start. 

Let's do a **micro-commitment**: we will work for just **10 minutes** on your most urgent task right now. If you want to stop after 10 minutes, you can—but 85% of the time, once you start, momentum takes over!

I've also:
- Triggered **Deep Focus Mode**
- Activated **Ambient Binaural Beats** to lock in focus.
- Started a **25-minute Pomodoro Timer**.

Take a deep breath. Let's do this together. Click the 'Start Focus Session' button below!`;

        actions = [
          { type: "TRIGGER_POMODORO", duration: 25 },
          { type: "PLAY_AMBIENT", sound: "binaural" }
        ];
      } else if (lowered.includes("emergency") || lowered.includes("panic") || lowered.includes("stress")) {
        reply = `### ⚠️ EMERGENCY CRASH PLAN INITIALIZED!

I see that stress levels are high and a major deadline is looming. I am putting your workspace into **Emergency Mode**.

Here is our **Immediate Survival Plan**:
1. **Low Priority Postponement**: I have temporarily hidden all secondary non-urgent tasks so you only see what matters.
2. **Crash Schedule**: I have rearranged your next 4 hours into 50-minute blocks with 5-minute rapid resets.
3. **Smart Focus Lockdown**: Distractions are shielded. Focus music is loaded.
4. **Frequent Coach Pings**: I will prompt you every 15 minutes to verify your subtask progress and keep you moving.

Your goal for the next 50 minutes is: *Research & Outline core requirements*. Nothing else exists right now!`;

        actions = [
          { type: "ACTIVATE_EMERGENCY_MODE" },
          { type: "REARRANGE_SCHEDULE", blockFocusStart: "now", blockFocusEnd: "4 hours" }
        ];
      } else {
        reply = `Hello! I am your AI Productivity Coach. I specialize in helping you complete last-minute assignments, managing critical deadlines, blocking out distractions, and keeping your energy high.

Tell me what you need to crush right now, and I'll break it down, block time, and stay with you until it's done!

*Suggestions:*
- "I have an essay due tomorrow at 9 AM and haven't started."
- "I'm procrastinating and need to write a report."
- "I'm feeling super stressed and overwhelmed."`;
      }

      return res.json({ text: reply, actions });
    }

    // Prepare system instruction guiding Gemini's persona and structured JSON actions.
    const systemInstruction = `You are "The Last-Minute Life Saver," a brilliant, hyper-supportive, and highly action-oriented AI Productivity Coach and Planner.
Your job is to help users crush critical deadlines, beat procrastination, and complete high-pressure assignments instead of just showing reminders.

Whenever a user is facing a crunch:
1. ALWAYS break down the large task into clear actionable subtasks with estimated completion times.
2. Formulate an optimized study/work plan, rearranging secondary tasks to make room.
3. Suggest anti-distraction measures (e.g. entering Focus Mode, playing White Noise).
4. Provide high-octane motivation and helpful tips to lower their anxiety.

CRITICAL: Return your response in JSON format conforming to the following structure so the frontend can execute actions dynamically:
{
  "text": "Your markdown-formatted message and structured response to display to the user",
  "actions": [
    {
      "type": "ADD_SUBTASKS" | "REARRANGE_SCHEDULE" | "TRIGGER_POMODORO" | "PLAY_AMBIENT" | "ACTIVATE_EMERGENCY_MODE",
      "taskName": "Name of primary task",
      "subtasks": [ { "title": "Subtask title", "duration": number_minutes, "priority": "High" | "Medium" | "Low" } ],
      "blockFocusStart": "HH:MM",
      "blockFocusEnd": "HH:MM",
      "postponedTasks": ["Task name 1", "Task name 2"],
      "duration": number_minutes,
      "sound": "binaural" | "rain" | "waves" | "white"
    }
  ]
}

Ensure the 'text' field is beautifully formatted markdown with bold highlights, numbered steps, and a clear voice.
Always respond strictly in JSON format. Do not include markdown code block characters unless specified.`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `User Message: "${message}"\n\nCurrent workspace state:\n- Active Tasks: ${JSON.stringify(
              taskList || []
            )}\n- Schedule: ${JSON.stringify(schedule || [])}\n- Focus Score: ${focusScore || 85}%`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to communicate with AI Assistant.",
      details: error.message,
    });
  }
});

// Setup Vite Dev Server / Static files
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Last-Minute Life Saver full-stack server running on port ${PORT}`);
  });
}

start();
