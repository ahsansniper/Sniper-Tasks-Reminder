import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types';
import { isBefore, parse, format, addMinutes, isAfter, isEqual } from 'date-fns';
import useSound from 'use-sound';
import { Settings } from './useSettings';
import { playTune } from '../utils/audio';

export function useReminders(tasks: Task[], updateTaskStatus: (id: string, status: Task['status']) => Promise<void>, settings: Settings) {
  const [activeReminder, setActiveReminder] = useState<Task | null>(null);
  const [snoozedTasks, setSnoozedTasks] = useState<Record<string, Date>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const triggerReminder = useCallback((task: Task) => {
    setActiveReminder(task);
    playTune(settings.tuneUrl);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Task Reminder', {
        body: `${task.title} is due now!`,
        icon: '/favicon.ico' // Assuming there's a favicon
      });
    }
  }, []);

  const checkReminders = useCallback(() => {
    if (activeReminder) return; // Don't trigger another if one is already active

    const now = new Date();
    const currentDateStr = format(now, 'yyyy-MM-dd');
    const currentTimeStr = format(now, 'HH:mm');

    for (const task of tasks) {
      if (task.status !== 'pending') continue;

      const taskDateTime = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
      
      // Check if snoozed
      if (snoozedTasks[task.id]) {
        if (isAfter(now, snoozedTasks[task.id]) || isEqual(now, snoozedTasks[task.id])) {
          // Snooze expired, trigger again
          triggerReminder(task);
          
          // Remove from snoozed
          setSnoozedTasks(prev => {
            const next = { ...prev };
            delete next[task.id];
            return next;
          });
          return; // Only trigger one at a time
        }
        continue;
      }

      // Check if it's time or overdue (and not snoozed)
      // We want to trigger if it's exactly the time, or if it's overdue and we haven't reminded yet.
      // For persistence, if it's past the time and still pending, we keep reminding.
      if (isAfter(now, taskDateTime) || isEqual(now, taskDateTime)) {
        triggerReminder(task);
        return; // Only trigger one at a time
      }
    }
  }, [tasks, activeReminder, snoozedTasks, triggerReminder]);

  useEffect(() => {
    // Check immediately
    checkReminders();
    
    // Then check every 30 seconds
    intervalRef.current = setInterval(checkReminders, 30000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkReminders]);

  const handleComplete = async () => {
    if (!activeReminder) return;
    await updateTaskStatus(activeReminder.id, 'completed');
    setActiveReminder(null);
  };

  const handleSnooze = (minutes: number) => {
    if (!activeReminder) return;
    const snoozeUntil = addMinutes(new Date(), minutes);
    setSnoozedTasks(prev => ({ ...prev, [activeReminder.id]: snoozeUntil }));
    setActiveReminder(null);
  };

  const handleSkip = async () => {
    if (!activeReminder) return;
    await updateTaskStatus(activeReminder.id, 'missed');
    setActiveReminder(null);
  };

  return {
    activeReminder,
    handleComplete,
    handleSnooze,
    handleSkip,
  };
}
