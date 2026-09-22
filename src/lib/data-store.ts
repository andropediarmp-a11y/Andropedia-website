import { User, Week, Task, Evaluation, LeaderboardEntry, DomainType } from "./types";

// Seeded Users
export const initialUsers: User[] = [
  {
    id: "usr_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@andropedia.club",
    role: "member",
    domain: "Web",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Full-stack enthusiast exploring Next.js 15, WebSockets, and distributed systems.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    points: 382,
    tasksCompleted: 4,
    streakWeeks: 4,
  },
  {
    id: "usr_2",
    name: "Diya Patel",
    email: "diya.patel@andropedia.club",
    role: "member",
    domain: "R&D",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "AI/ML researcher specializing in Computer Vision and Transformer attention optimization.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    points: 374,
    tasksCompleted: 4,
    streakWeeks: 4,
  },
  {
    id: "usr_3",
    name: "Rohan Varma",
    email: "rohan.varma@andropedia.club",
    role: "member",
    domain: "Technical",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Competitive programmer (Codeforces Candidate Master) and Rust lover.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    points: 365,
    tasksCompleted: 4,
    streakWeeks: 3,
  },
  {
    id: "usr_4",
    name: "Sneha Mukherjee",
    email: "sneha.m@andropedia.club",
    role: "member",
    domain: "Design",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Product & UI/UX Designer crafting futuristic dark-mode design systems.",
    portfolio: "https://behance.net",
    linkedin: "https://linkedin.com",
    points: 358,
    tasksCompleted: 4,
    streakWeeks: 4,
  },
  {
    id: "usr_5",
    name: "Karan Singhania",
    email: "karan.s@andropedia.club",
    role: "member",
    domain: "Media",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Visual storyteller, cinematographer, and 3D motion graphics artist.",
    linkedin: "https://linkedin.com",
    points: 342,
    tasksCompleted: 4,
    streakWeeks: 2,
  },
  {
    id: "usr_6",
    name: "Ananya Iyer",
    email: "ananya.iyer@andropedia.club",
    role: "member",
    domain: "PR",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    bio: "Outreach strategist driving corporate sponsorships and tech-community tie-ups.",
    linkedin: "https://linkedin.com",
    points: 335,
    tasksCompleted: 3,
    streakWeeks: 3,
  },
  {
    id: "usr_lead_web",
    name: "Vikramaditya Rao",
    email: "lead.web@andropedia.club",
    role: "domain_admin",
    domain: "Web",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    bio: "Domain Lead (Web) | Cloud Architect & Open Source Contributor.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    points: 420,
    tasksCompleted: 4,
    streakWeeks: 4,
  },
  {
    id: "usr_lead_tech",
    name: "Pooja Reddy",
    email: "lead.tech@andropedia.club",
    role: "domain_admin",
    domain: "Technical",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    bio: "Domain Lead (Technical) | System Programming & ICPC Regionalist.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    points: 410,
    tasksCompleted: 4,
    streakWeeks: 4,
  },
  {
    id: "usr_admin",
    name: "Dr. Siddharth Sen",
    email: "admin@andropedia.club",
    role: "super_admin",
    domain: "Technical",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Faculty Advisor & Super Admin | Department of Computer Science.",
    linkedin: "https://linkedin.com",
    points: 500,
    tasksCompleted: 4,
    streakWeeks: 4,
  }
];

// Seeded Weeks
export const initialWeeks: Week[] = [
  {
    id: "week_1",
    weekNumber: 1,
    title: "Foundational Architecture & Systems Setup",
    theme: "Core Principles & Project Genesis",
    startDate: "2026-08-25",
    endDate: "2026-09-01",
    isActive: false,
    promptDescription: "Set up project repos, design systems, and initial architecture prototypes."
  },
  {
    id: "week_2",
    weekNumber: 2,
    title: "API Integration & Algorithmic Engines",
    theme: "Connectivity & Computational Logic",
    startDate: "2026-09-02",
    endDate: "2026-09-08",
    isActive: false,
    promptDescription: "Implement REST/GraphQL endpoints, core sorting algorithms, and UI wireframes."
  },
  {
    id: "week_3",
    weekNumber: 3,
    title: "Performance Optimization & State Synchronization",
    theme: "Speed, Resiliency & Aesthetics",
    startDate: "2026-09-09",
    endDate: "2026-09-15",
    isActive: false,
    promptDescription: "Benchmark render trees, optimize database queries, polish motion and video assets."
  },
  {
    id: "week_4",
    weekNumber: 4,
    title: "Production Deployment & High-Impact Polish",
    theme: "End-to-End Excellence",
    startDate: "2026-09-16",
    endDate: "2026-09-23",
    isActive: true,
    promptDescription: "Finalize deployment pipelines, stress test, review accessibility, and write rich documentation."
  }
];

// Seeded Tasks
export const initialTasks: Task[] = [
  {
    id: "task_1",
    userId: "usr_1",
    userName: "Aarav Sharma",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    domain: "Web",
    weekId: "week_3",
    weekNumber: 3,
    title: "Distributed Rate Limiter with Redis & Next.js Middleware",
    description: "Built a token bucket rate limiter running on edge middleware with Redis cluster failover and sub-millisecond response latency.",
    githubUrl: "https://github.com/andropedia/edge-rate-limiter",
    liveUrl: "https://edge-rate-limiter-demo.vercel.app",
    status: "evaluated",
    submittedAt: "2026-09-14T18:30:00Z",
    evaluation: {
      id: "eval_1",
      taskId: "task_1",
      adminId: "usr_lead_web",
      adminName: "Vikramaditya Rao",
      score: 96,
      criteriaScores: {
        technicalDepth: 25,
        innovation: 24,
        completion: 24,
        documentation: 23
      },
      feedback: "Phenomenal edge optimization. The token bucket algorithm handles concurrent bursts cleanly and benchmark tests are comprehensive.",
      evaluatedAt: "2026-09-15T11:00:00Z"
    }
  },
  {
    id: "task_2",
    userId: "usr_2",
    userName: "Diya Patel",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    domain: "R&D",
    weekId: "week_3",
    weekNumber: 3,
    title: "Lightweight Vision Transformer for Real-Time Gesture Parsing",
    description: "Trained a distilled ViT model achieving 98.2% accuracy at 45 FPS on edge devices using WebGL and ONNX Runtime.",
    githubUrl: "https://github.com/andropedia/edge-vision-transformer",
    liveUrl: "https://gesture-vit-demo.vercel.app",
    status: "evaluated",
    submittedAt: "2026-09-14T21:15:00Z",
    evaluation: {
      id: "eval_2",
      taskId: "task_2",
      adminId: "usr_admin",
      adminName: "Dr. Siddharth Sen",
      score: 95,
      criteriaScores: {
        technicalDepth: 25,
        innovation: 25,
        completion: 23,
        documentation: 22
      },
      feedback: "Exceptional research rigor. The model quantization down to FP16 enables seamless real-time browser inference.",
      evaluatedAt: "2026-09-15T14:20:00Z"
    }
  },
  {
    id: "task_3",
    userId: "usr_3",
    userName: "Rohan Varma",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    domain: "Technical",
    weekId: "week_3",
    weekNumber: 3,
    title: "Persistent Lock-Free B-Tree in Rust",
    description: "Implemented an atomic memory-mapped cache-friendly B-Tree with epoch-based garbage collection for high-throughput write workloads.",
    githubUrl: "https://github.com/andropedia/lockfree-btree",
    status: "evaluated",
    submittedAt: "2026-09-13T19:40:00Z",
    evaluation: {
      id: "eval_3",
      taskId: "task_3",
      adminId: "usr_lead_tech",
      adminName: "Pooja Reddy",
      score: 93,
      criteriaScores: {
        technicalDepth: 25,
        innovation: 23,
        completion: 23,
        documentation: 22
      },
      feedback: "Brilliant use of atomic primitives and epoch hazard pointers. Stress test cases in Cargo were thorough.",
      evaluatedAt: "2026-09-15T09:30:00Z"
    }
  },
  {
    id: "task_4",
    userId: "usr_4",
    userName: "Sneha Mukherjee",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    domain: "Design",
    weekId: "week_3",
    weekNumber: 3,
    title: "Holographic Cyber Design System & Component Library",
    description: "Designed a 40+ component design system in Figma with auto-layout v5, tokens, accessible contrast modes, and micro-interactions.",
    figmaUrl: "https://figma.com/@andropedia/cyber-system",
    liveUrl: "https://cyber-design-andropedia.vercel.app",
    status: "evaluated",
    submittedAt: "2026-09-14T16:10:00Z",
    evaluation: {
      id: "eval_4",
      taskId: "task_4",
      adminId: "usr_lead_web",
      adminName: "Vikramaditya Rao",
      score: 92,
      criteriaScores: {
        technicalDepth: 22,
        innovation: 24,
        completion: 24,
        documentation: 22
      },
      feedback: "Vibrant visual hierarchy, flawless typography tokens, and high-fidelity interaction prototypes.",
      evaluatedAt: "2026-09-15T12:45:00Z"
    }
  },
  {
    id: "task_5",
    userId: "usr_1",
    userName: "Aarav Sharma",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    domain: "Web",
    weekId: "week_4",
    weekNumber: 4,
    title: "Real-time Leaderboard Synchronization with Server-Sent Events",
    description: "Built resilient streaming leaderboard state with zero reconnect latency, delta compaction, and optimistic client updates.",
    githubUrl: "https://github.com/andropedia/realtime-sse-board",
    liveUrl: "https://sse-leaderboard.vercel.app",
    status: "submitted", // Pending evaluation so reviewer/lead can test evaluating it!
    submittedAt: "2026-09-19T14:22:00Z"
  },
  {
    id: "task_6",
    userId: "usr_2",
    userName: "Diya Patel",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    domain: "R&D",
    weekId: "week_4",
    weekNumber: 4,
    title: "Decentralized Federated Learning Node for Edge Devices",
    description: "Implemented privacy-preserving local gradient aggregation with differential privacy noise injection and smart-contract verification.",
    githubUrl: "https://github.com/andropedia/federated-edge-node",
    status: "submitted", // Also pending evaluation!
    submittedAt: "2026-09-19T18:05:00Z"
  }
];

// Global in-memory storage singleton for serverless runtime
declare global {
  var __andropedia_users: User[] | undefined;
  var __andropedia_weeks: Week[] | undefined;
  var __andropedia_tasks: Task[] | undefined;
}

export function getUsers(): User[] {
  if (!global.__andropedia_users) {
    global.__andropedia_users = [...initialUsers];
  }
  return global.__andropedia_users;
}

export function getWeeks(): Week[] {
  if (!global.__andropedia_weeks) {
    global.__andropedia_weeks = [...initialWeeks];
  }
  return global.__andropedia_weeks;
}

export function getTasks(): Task[] {
  if (!global.__andropedia_tasks) {
    global.__andropedia_tasks = [...initialTasks];
  }
  return global.__andropedia_tasks;
}

export function addTask(taskData: Omit<Task, "id" | "submittedAt" | "status">): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...taskData,
    id: `task_${Date.now()}`,
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  return newTask;
}

export function evaluateTask(
  taskId: string,
  adminId: string,
  adminName: string,
  score: number,
  feedback: string,
  criteriaScores?: Evaluation["criteriaScores"]
): Task | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return null;

  const evaluation: Evaluation = {
    id: `eval_${Date.now()}`,
    taskId,
    adminId,
    adminName,
    score,
    feedback,
    criteriaScores,
    evaluatedAt: new Date().toISOString(),
  };

  tasks[taskIndex].status = "evaluated";
  tasks[taskIndex].evaluation = evaluation;

  // Update user's aggregate points and tasksCompleted
  const users = getUsers();
  const user = users.find((u) => u.id === tasks[taskIndex].userId);
  if (user) {
    user.points = (user.points || 0) + score;
    user.tasksCompleted = (user.tasksCompleted || 0) + 1;
  }

  return tasks[taskIndex];
}

export function getLeaderboard(domain?: string, period?: string): LeaderboardEntry[] {
  const users = getUsers();
  const tasks = getTasks();

  // Filter tasks based on domain
  let filteredUsers = users.filter((u) => u.role === "member");
  if (domain && domain !== "All") {
    filteredUsers = filteredUsers.filter((u) => u.domain.toLowerCase() === domain.toLowerCase());
  }

  // Compute entry for each user
  const entries: LeaderboardEntry[] = filteredUsers.map((user) => {
    const userEvaluatedTasks = tasks.filter(
      (t) => t.userId === user.id && t.status === "evaluated" && t.evaluation
    );

    const totalScore = userEvaluatedTasks.reduce((sum, t) => sum + (t.evaluation?.score || 0), 0) + (user.points ? Math.floor(user.points * 0.7) : 0);
    const count = userEvaluatedTasks.length || (user.tasksCompleted || 1);
    const avgScore = Math.round(totalScore / count);

    const badges: string[] = [];
    if (totalScore >= 350) badges.push("Grandmaster");
    if (user.streakWeeks && user.streakWeeks >= 4) badges.push("Streak Fire");
    if (user.domain === "Web") badges.push("Fullstack Pioneer");
    if (user.domain === "Technical") badges.push("Algo Titan");
    if (user.domain === "R&D") badges.push("Deep Innovator");
    if (user.domain === "Design") badges.push("Visual Architect");

    return {
      rank: 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      domain: user.domain,
      totalScore,
      avgScore,
      tasksCompleted: count,
      streakWeeks: user.streakWeeks || 1,
      rankChange: Math.floor(Math.random() * 3) - 1, // +1, 0, or -1 for visual polish
      badges,
    };
  });

  // Sort descending by totalScore
  entries.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
