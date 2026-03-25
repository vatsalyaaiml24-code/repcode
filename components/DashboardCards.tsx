"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FolderUp, MessageSquare, BrainCircuit, ArrowRight } from "lucide-react";

type DashboardCard = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

const cards: DashboardCard[] = [
  {
    href: "/upload",
    icon: <FolderUp className="w-6 h-6 text-indigo-400" />,
    title: "Upload Project",
    description: "Upload a folder and get an AI summary of the codebase."
  },
  {
    href: "/ask",
    icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
    title: "Ask Questions",
    description: "Ask from memory or from your uploaded project summary."
  },
  {
    href: "/log",
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    title: "Log Decisions",
    description: "Store decisions with summaries so your team can query later."
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardCards() {
  return (
    <motion.div 
      className="grid gap-6 md:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {cards.map((card) => (
        <motion.div key={card.href} variants={itemVariants}>
          <Link
            href={card.href}
            className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_40px_-15px_rgba(99,102,241,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative flex flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-100 group-hover:text-white transition-colors">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                  {card.description}
                </p>
              </div>
            </div>
            
            <div className="relative mt-6 flex items-center text-sm font-medium text-indigo-400 opacity-0 translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <span className="mr-2">Get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
