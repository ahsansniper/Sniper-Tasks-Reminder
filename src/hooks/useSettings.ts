import { useState, useEffect } from 'react';

export interface Settings {
  tuneUrl: string | null;
  tuneName: string;
}

const DEFAULT_SETTINGS: Settings = {
  tuneUrl: null,
  tuneName: 'Default Beep',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
}
