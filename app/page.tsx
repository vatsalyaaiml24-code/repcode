"use client";

import { DashboardCards } from "@/components/DashboardCards";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />

      <section className="relative z-10 pt-20 pb-12 sm:pt-28">
        <header className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              REPCODE Dashboard
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300 max-w-2xl mx-auto"
          >
            Upload a project for an AI summary, ask questions from memory or from the uploaded
            summary, and log decisions with reasoning so your team can learn faster.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-16 max-w-5xl mx-auto px-4"
        >
          <DashboardCards />
        </motion.div>
      </section>
    </div>
  );
}
