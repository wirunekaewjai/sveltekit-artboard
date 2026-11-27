import type { StudioTheme } from '#src/registry.ts';

export type StudioDefaults = {
  studioTheme: StudioTheme;
  storageKey: string;
  appUrl: string;
  apiBase: string;
  defaultDebug: boolean;
};

let currentDefaults: StudioDefaults = {
  studioTheme: 'dark',
  storageKey: 'sveltekit-artboard-prefs-v1',
  appUrl: '/',
  apiBase: '/__artboard/api',
  defaultDebug: false,
};

export const setStudioDefaults = (patch: Partial<StudioDefaults>): void => {
  currentDefaults = { ...currentDefaults, ...patch };
};

export const getStudioDefaults = (): StudioDefaults => {
  return currentDefaults;
};
