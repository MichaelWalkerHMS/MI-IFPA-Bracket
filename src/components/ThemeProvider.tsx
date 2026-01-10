"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  Theme,
  ResolvedTheme,
} from "@/lib/theme/constants";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

// Dark mode is enforced - theme switching disabled
// Original implementation kept in git history for future use
const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Dark mode enforced - no state management needed
  // Theme is always "dark", resolvedTheme is always "dark"
  return (
    <ThemeContext.Provider value={{ theme: "dark", setTheme: () => {}, resolvedTheme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
