import type { Snippet } from 'svelte';

import type {
  ArtboardComponent,
  ArtboardRenderContext,
  ArtboardSection,
  ArtboardViewport,
} from '#src/registry.ts';

export type PositionedSection = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  x: number;
  y: number;
};

export type PositionedBoard = {
  id: string;
  title: string;
  section: string;
  category: string;
  viewport: ArtboardViewport;
  viewportLabel: string;
  width: number;
  height: number;
  x: number;
  y: number;
  defaultTheme?: string;
  render?: Snippet<[ArtboardRenderContext]>;
  component?: ArtboardComponent;
  props?: Record<string, unknown>;
};

const BOARD_GAP_X = 72;
const SECTION_GAP_Y = 160;
const HEADER_OFFSET_Y = 76;
const START_X = 120;
const START_Y = 100;

export const computeCanvasLayout = (
  inputSections: ArtboardSection[],
  stressMultiplier = 1,
): { sections: PositionedSection[]; boards: PositionedBoard[] } => {
  const sections: PositionedSection[] = [];
  const boards: PositionedBoard[] = [];

  let cursorY = START_Y;

  for (let pass = 0; pass < stressMultiplier; pass++) {
    const suffix = pass === 0 ? '' : `-stress-${pass}`;
    const titlePrefix = pass === 0 ? '' : `[Stress Copy #${pass}] `;

    for (const row of inputSections) {
      sections.push({
        id: `${row.id}${suffix}`,
        title: `${titlePrefix}${row.title}`,
        subtitle: row.subtitle,
        category: row.category,
        x: START_X,
        y: cursorY,
      });

      let cursorX = START_X;
      let maxRowHeight = 0;

      for (const board of row.boards) {
        const { width, height, label } = board.viewport;
        boards.push({
          id: `${board.id}${suffix}`,
          title: pass === 0 ? board.title : `${board.title} (#${pass})`,
          section: `${titlePrefix}${row.title}`,
          category: row.category,
          viewport: board.viewport,
          viewportLabel: label ? `${label} (${width} × ${height})` : `${width} × ${height}`,
          width,
          height,
          x: cursorX,
          y: cursorY + HEADER_OFFSET_Y,
          defaultTheme: board.defaultTheme,
          render: board.render,
          component: board.component,
          props: board.props,
        });

        cursorX += width + BOARD_GAP_X;
        if (height > maxRowHeight) {
          maxRowHeight = height;
        }
      }

      cursorY += HEADER_OFFSET_Y + maxRowHeight + SECTION_GAP_Y;
    }
  }

  return { sections, boards };
};
