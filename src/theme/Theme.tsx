import { createContext, useContext, type ReactNode } from 'react';
import { darkPalette, paletteFor, type Palette } from './colors';

const ColorContext = createContext<Palette>(darkPalette);

export function ColorProvider({ theme, children }: { theme: 'dark' | 'light'; children: ReactNode }) {
  return <ColorContext.Provider value={paletteFor(theme)}>{children}</ColorContext.Provider>;
}

export function useColors(): Palette {
  return useContext(ColorContext);
}
