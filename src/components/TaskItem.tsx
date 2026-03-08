import React from 'react';
import { Task } from '../types';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, XCircle } from 'lucide-react';
import { format, isBefore, parse, startOfDay } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TaskItemProps {
  key?: React.Key;
  task: Task;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onUpdateStatus, onDelete }: TaskItemProps) {
  const taskDate = parse(task.date, 'yyyy-MM-dd', new Date());
  const taskDateTime = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
  const now = new Date();
  
  const isOverdue = task.status === 'pending' && isBefore(taskDateTime, now);
  const isToday = task.date === format(now, 'yyyy-MM-dd');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={twMerge(
        clsx(
          "group relative flex items-start gap-4 p-5 rounded-2xl border transition-all",
          task.status === 'completed' ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-60" :
          task.status === 'missed' ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30" :
          isOverdue ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30" :
          "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50"
        )
      )}
    >
      <button
        onClick={() => onUpdateStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
        className="mt-1 flex-shrink-0 text-zinc-400 hover:text-emerald-500 transition-colors"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 size={24} className="text-emerald-500" />
        ) : (
          <Circle size={24} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={twMerge(
            clsx(
              "text-lg font-semibold truncate",
              task.status === 'completed' ? "text-zinc-500 line-through" : "text-zinc-900 dark:text-white"
            )
          )}>
            {task.title}
          </h3>
          {isOverdue && task.status === 'pending' && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium">
              Overdue
            </span>
          )}
        </div>
        
        {task.description && (
          <p className={twMerge(
            clsx(
              "text-sm mb-3 line-clamp-2",
              task.status === 'completed' ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-400"
            )
          )}>
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className={twMerge(
            clsx(
              "flex items-center gap-1.5",
              isToday && task.status === 'pending' ? "text-indigo-600 dark:text-indigo-400" : ""
            )
          )}>
            <Calendar size={14} />
            {isToday ? 'Today' : format(taskDate, 'MMM d, yyyy')}
          </div>
          <div className={twMerge(
            clsx(
              "flex items-center gap-1.5",
              isOverdue && task.status === 'pending' ? "text-orange-600 dark:text-orange-400" : ""
            )
          )}>
            <Clock size={14} />
            {task.time}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'missed')}
            title="Mark as missed"
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <XCircle size={18} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}
