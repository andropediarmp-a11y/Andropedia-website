"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Trophy, Sparkles, Check, ArrowRight, ExternalLink } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  attendees: string;
  prize?: string;
  description: string;
  badge: string;
  badgeColor: string;
}

export function EventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcomingEvents: EventItem[] = [
    {
      id: "ev_1",
      title: "AndroHacks 2026: The Cyber-Physical Frontier",
      type: "FLAGSHIP HACKATHON",
      date: "October 12 - 14, 2026",
      location: "Auditorium Main Hall & Hybrid Discord",
      attendees: "400+ Hackers",
      prize: "$5,000+ Prize Pool",
      description: "Our premier 36-hour hackathon focused on Distributed Web Systems, Generative AI Agent swarms, and Edge hardware computing. Mentored by industry leaders.",
      badge: "Registrations Open",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
    },
    {
      id: "ev_2",
      title: "Masterclass: Real-Time Edge Architecture with Next.js 16",
      type: "HANDS-ON WORKSHOP",
      date: "October 24, 2026",
      location: "Tech Lab 4 & YouTube Live",
      attendees: "120 Seats",
      prize: "Certificate & Cloud Credits",
      description: "Deep dive into streaming SSR, sub-millisecond edge KV caches, and WebSockets synchronization presented by our Web Domain leads.",
      badge: "Filling Fast",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
    },
    {
      id: "ev_3",
      title: "AlgoClash: Collegiate Competitive Programming Arena",
      type: "ALGORITHMIC SPRINT",
      date: "November 5, 2026",
      location: "Online (AndroOJ Arena)",
      attendees: "200+ Contenders",
      prize: "ICPC Training Sponsorship",
      description: "Speed coding contest featuring 6 algorithmic problems ranging from dynamic programming on trees to segment tree queries.",
      badge: "Announced",
      badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/40"
    }
  ];

  const pastEvents: EventItem[] = [
    {
      id: "ev_past_1",
      title: "Summer Tech Bootcamp 2026",
      type: "INTENSIVE BOOTCAMP",
      date: "August 10 - 20, 2026",
      location: "Campus Labs",
      attendees: "85 Graduates",
      description: "10-day intensive foundational track training 1st and 2nd year students in React, Python data pipelines, and Git workflows.",
      badge: "Completed",
      badgeColor: "bg-slate-700 text-slate-300 border-slate-600"
    },
    {
      id: "ev_past_2",
      title: "AndroGenesis Hackathon 2025",
      type: "HACKATHON",
      date: "November 18 - 19, 2025",
      location: "Engineering Atrium",
      attendees: "320 Hackers",
      description: "32 teams built innovative healthcare and campus utility prototypes, judged by prominent alumni.",
      badge: "Completed",
      badgeColor: "bg-slate-700 text-slate-300 border-slate-600"
    }
  ];

  const toggleRegister = (id: string) => {
    if (registeredEvents.includes(id)) {
      setRegisteredEvents(registeredEvents.filter((e) => e !== id));
    } else {
      setRegisteredEvents([...registeredEvents, id]);
    }
  };

  const currentList = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5" />
            HACKATHONS & WORKSHOPS
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Events & <span className="text-gradient-emerald">Hackathons</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Participate in flagship hackathons, intense algorithmic battles, and technical workshops organized by Andropedia.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                : "glass-panel text-slate-300 hover:text-white"
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "past"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                : "glass-panel text-slate-300 hover:text-white"
            }`}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {currentList.map((ev) => {
            const isRegistered = registeredEvents.includes(ev.id);
            return (
              <div
                key={ev.id}
                className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                data-cursor-text="Event"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                      {ev.type}
                    </span>
                    <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border ${ev.badgeColor}`}>
                      {ev.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white hover:text-emerald-300 transition-colors">
                    {ev.title}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed">{ev.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <span>{ev.attendees}</span>
                    </div>
                    {ev.prize && (
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{ev.prize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === "upcoming" && (
                  <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => toggleRegister(ev.id)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isRegistered
                          ? "bg-slate-800 text-emerald-400 border border-emerald-500/40"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>RSVP Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Reserve Seat</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  return <EventsPage />;
}
