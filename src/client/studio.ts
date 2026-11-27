import type { Component } from 'svelte';

import type { ArtboardSection, ArtboardTheme, StudioTheme } from '#src/registry.ts';

import ArtboardApp from '#src/client/ArtboardApp.svelte';

export type ArtboardProps = {
  sections: ArtboardSection[];
  /** Optional list of app themes (e.g. light, dark, brand-b). Omit to hide app theme controls. */
  themes?: ArtboardTheme[];
  /** Override default Studio UI chrome theme (`'dark' | 'light' | 'system'`). */
  studioTheme?: StudioTheme;
  storageKey?: string;
  appUrl?: string;
  defaultDebug?: boolean;
};

export const Artboard: Component<ArtboardProps> = ArtboardApp;

export type { StudioDefaults } from '#src/client/defaults.ts';
export { getStudioDefaults, setStudioDefaults } from '#src/client/defaults.ts';
export type {
  ArtboardComponent,
  ArtboardItem,
  ArtboardRenderContext,
  ArtboardSection,
  ArtboardTheme,
  ArtboardViewport,
  StudioTheme,
} from '#src/registry.ts';
export { defineArtboards } from '#src/registry.ts';
