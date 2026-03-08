import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, CheckCircle, Clock, XCircle } from 'lucide-react';
import { playTune } from '../utils/audio';

interface ReminderModalProps {
  task: Task | null;
  onComplete: () => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
  tuneUrl: string | null;
}

export function ReminderModal({ task, onComplete, onSnooze, onSkip, tuneUrl }: ReminderModalProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!task) return;
    const interval = setInterval(() => {
      setPulse(p => !p);
      // Play sound every 10 seconds if ignored
      playTune(tuneUrl);
    }, 10000);
    return () => clearInterval(interval);
  }, [task, tuneUrl]);

  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800"
        >
          <div className="p-6 text-center">
            <motion.div
              animate={pulse ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4"
            >
              <BellRing size={32} />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Task Reminder!
            </h2>
            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-1">
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                <CheckCircle size={20} />
                Mark as Completed
              </button>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSnooze(5)}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 px-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Clock size={16} />
                  5 min
                </button>
                <button
                  onClick={() => onSnooze(10)}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 px-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Clock size={16} />
                  10 min
                </button>
                <button
                  onClick={() => onSnooze(30)}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 px-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Clock size={16} />
                  30 min
                </button>
              </div>
              
              <button
                onClick={onSkip}
                className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-3 px-4 rounded-xl font-medium transition-colors mt-2"
              >
                <XCircle size={20} />
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
