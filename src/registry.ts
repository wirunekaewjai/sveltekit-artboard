import type { Component, Snippet } from 'svelte';

export type StudioTheme = 'dark' | 'light' | 'system';

export type ArtboardViewport = {
  width: number;
  height: number;
  label?: string;
};

export type ArtboardTheme = {
  id: string;
  label: string;
  /** Optional CSS class(es) applied to the artboard viewport container (e.g. 'dark'). */
  class?: string;
  /** Optional HTML attributes applied to the artboard viewport container (e.g. { 'data-theme': 'ocean' }). */
  attrs?: Record<string, string>;
};

export type ArtboardRenderContext = {
  theme: ArtboardTheme | null;
  viewport: ArtboardViewport;
};

export type ArtboardComponent = Component<Record<string, unknown>>;

export type ArtboardItem<Props extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  title: string;
  viewport: ArtboardViewport;
  /** Optional theme id from `themes` to use as the default for this specific board. */
  defaultTheme?: string;
  /** Render via a Svelte 5 `{#snippet}` defined right in `Artboard.svelte`. */
  render?: Snippet<[ArtboardRenderContext]>;
  /** Or render a Svelte 5 component directly with optional props. */
  component?: Component<Props>;
  props?: Props;
};

export type ArtboardSection = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  boards: ArtboardItem[];
};

export const defineArtboards = (sections: ArtboardSection[]): ArtboardSection[] => {
  return sections;
};
