import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Play, Music, RotateCcw } from 'lucide-react';
import { Settings } from '../hooks/useSettings';
import { playTune } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateSettings({
        tuneUrl: base64,
        tuneName: file.name
      });
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectDefault = () => {
    onUpdateSettings({
      tuneUrl: null,
      tuneName: 'Default Beep'
    });
  };

  const handlePlayTest = () => {
    playTune(settings.tuneUrl);
  };

  if (!isOpen) return null;

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
          <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Music size={20} className="text-indigo-500" />
              Reminder Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Current Reminder Tune
              </h3>
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Music size={18} />
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-white truncate">
                    {settings.tuneName}
                  </span>
                </div>
                <button
                  onClick={handlePlayTest}
                  className="p-2 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors flex-shrink-0 ml-2"
                  title="Test Tune"
                >
                  <Play size={16} className="ml-0.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Change Tune
              </h3>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium transition-colors"
              >
                <Upload size={18} />
                Upload Custom Audio (Max 2MB)
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />

              {settings.tuneUrl !== null && (
                <button
                  onClick={handleSelectDefault}
                  className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  <RotateCcw size={18} />
                  Reset to Default Beep
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
