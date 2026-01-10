export type Theme = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
// Default to dark mode - light mode code kept for potential future use
export const DEFAULT_THEME: Theme = "dark";
