import React, { useEffect, useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useReminders } from './hooks/useReminders';
import { useSettings } from './hooks/useSettings';
import { TaskForm } from './components/TaskForm';
import { Dashboard } from './components/Dashboard';
import { ReminderModal } from './components/ReminderModal';
import { SettingsModal } from './components/SettingsModal';
import { Bell, Moon, Sun, Settings as SettingsIcon, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { tasks, loading, error, addTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { settings, updateSettings } = useSettings();
  const { activeReminder, handleComplete, handleSnooze, handleSkip } = useReminders(tasks, updateTaskStatus, settings);
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isInIframe) {
      const appUrl = process.env.APP_URL || window.location.origin;
      window.open(appUrl, '_blank');
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Bell size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Ahsan's Reminder</h1>
          </div>
          <div className="flex items-center gap-2">
            {(deferredPrompt || isInIframe) && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">
                  {isInIframe ? 'Open to Install' : 'Install App'}
                </span>
              </button>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <SettingsIcon size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30 text-sm font-medium">
            {error}
          </div>
        )}

        <TaskForm onAdd={addTask} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Dashboard
            tasks={tasks}
            onUpdateStatus={updateTaskStatus}
            onDelete={deleteTask}
          />
        )}
      </main>

      <ReminderModal
        task={activeReminder}
        onComplete={handleComplete}
        onSnooze={handleSnooze}
        onSkip={handleSkip}
        tuneUrl={settings.tuneUrl}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
}
