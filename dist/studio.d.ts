import { Component, Snippet } from "svelte";
type StudioTheme = 'dark' | 'light' | 'system';
type ArtboardViewport = {
  width: number;
  height: number;
  label?: string;
};
type ArtboardTheme = {
  id: string;
  label: string;
  /** Optional CSS class(es) applied to the artboard viewport container (e.g. 'dark'). */
  class?: string;
  /** Optional HTML attributes applied to the artboard viewport container (e.g. { 'data-theme': 'ocean' }). */
  attrs?: Record<string, string>;
};
type ArtboardRenderContext = {
  theme: ArtboardTheme | null;
  viewport: ArtboardViewport;
};
type ArtboardComponent = Component<Record<string, unknown>>;
type ArtboardItem<Props extends Record<string, unknown> = Record<string, unknown>> = {
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
type ArtboardSection = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  boards: ArtboardItem[];
};
export declare const defineArtboards: (sections: ArtboardSection[]) => ArtboardSection[];
type StudioDefaults = {
  studioTheme: StudioTheme;
  storageKey: string;
  appUrl: string;
  apiBase: string;
  defaultDebug: boolean;
};
export declare const setStudioDefaults: (patch: Partial<StudioDefaults>) => void;
export declare const getStudioDefaults: () => StudioDefaults;
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
export declare const Artboard: Component<ArtboardProps>;
export type { ArtboardComponent, ArtboardItem, ArtboardRenderContext, ArtboardSection, ArtboardTheme, ArtboardViewport, StudioDefaults, StudioTheme };