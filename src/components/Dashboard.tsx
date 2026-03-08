import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { format, isBefore, isAfter, parse, startOfDay, endOfDay } from 'date-fns';
import { CalendarDays, CheckCircle2, Clock, ListTodo, Search, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardProps {
  tasks: Task[];
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

type Filter = 'all' | 'today' | 'upcoming' | 'completed' | 'missed';

export function Dashboard({ tasks, onUpdateStatus, onDelete }: DashboardProps) {
  const [filter, setFilter] = useState<Filter>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    switch (filter) {
      case 'today':
        result = result.filter(t => {
          const d = parse(t.date, 'yyyy-MM-dd', new Date());
          return t.status === 'pending' && d >= todayStart && d <= todayEnd;
        });
        break;
      case 'upcoming':
        result = result.filter(t => {
          const d = parse(t.date, 'yyyy-MM-dd', new Date());
          return t.status === 'pending' && d > todayEnd;
        });
        break;
      case 'completed':
        result = result.filter(t => t.status === 'completed');
        break;
      case 'missed':
        result = result.filter(t => t.status === 'missed' || (t.status === 'pending' && isBefore(parse(`${t.date} ${t.time}`, 'yyyy-MM-dd HH:mm', new Date()), now)));
        break;
      case 'all':
      default:
        break;
    }

    return result;
  }, [tasks, filter, searchQuery, todayStart, todayEnd, now]);

  const stats = useMemo(() => {
    return {
      today: tasks.filter(t => t.status === 'pending' && parse(t.date, 'yyyy-MM-dd', new Date()) >= todayStart && parse(t.date, 'yyyy-MM-dd', new Date()) <= todayEnd).length,
      upcoming: tasks.filter(t => t.status === 'pending' && parse(t.date, 'yyyy-MM-dd', new Date()) > todayEnd).length,
      completed: tasks.filter(t => t.status === 'completed').length,
      missed: tasks.filter(t => t.status === 'missed' || (t.status === 'pending' && isBefore(parse(`${t.date} ${t.time}`, 'yyyy-MM-dd HH:mm', new Date()), now))).length,
    };
  }, [tasks, todayStart, todayEnd, now]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="text-indigo-500" />}
          title="Today"
          value={stats.today}
          active={filter === 'today'}
          onClick={() => setFilter('today')}
        />
        <StatCard
          icon={<CalendarDays className="text-blue-500" />}
          title="Upcoming"
          value={stats.upcoming}
          active={filter === 'upcoming'}
          onClick={() => setFilter('upcoming')}
        />
        <StatCard
          icon={<CheckCircle2 className="text-emerald-500" />}
          title="Completed"
          value={stats.completed}
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
        />
        <StatCard
          icon={<XCircle className="text-red-500" />}
          title="Missed"
          value={stats.missed}
          active={filter === 'missed'}
          onClick={() => setFilter('missed')}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-white shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <ListTodo size={24} className="text-indigo-500" />
          {filter === 'today' ? "Today's Tasks" :
           filter === 'upcoming' ? "Upcoming Tasks" :
           filter === 'completed' ? "Completed Tasks" :
           filter === 'missed' ? "Missed Tasks" : "All Tasks"}
        </h2>
        <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          {filteredTasks.length} tasks
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"
            >
              <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                <ListTodo size={32} />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery ? "No tasks match your search query." : "You're all caught up! Enjoy your free time or add a new task."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, active, onClick }: { icon: React.ReactNode, title: string, value: number, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        clsx(
          "flex flex-col items-start p-5 rounded-2xl border transition-all text-left",
          active ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800"
        )
      )}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          {icon}
        </div>
        <span className={twMerge(
          clsx(
            "text-2xl font-bold",
            active ? "text-indigo-900 dark:text-indigo-100" : "text-zinc-900 dark:text-white"
          )
        )}>
          {value}
        </span>
      </div>
      <span className={twMerge(
        clsx(
          "text-sm font-medium",
          active ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-500 dark:text-zinc-400"
        )
      )}>
        {title}
      </span>
    </button>
  );
}
