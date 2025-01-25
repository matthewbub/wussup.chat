import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const updateDocumentTheme = (theme: "light" | "dark") => {
  if (typeof window !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

// Get initial theme from system preference if no stored theme exists
const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem("theme-storage");
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme);
      return parsed.state?.theme || "light";
    } catch {
      return "light";
    }
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light", // Default theme for SSR
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          updateDocumentTheme(newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        updateDocumentTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: true, // Important: Skip hydration during SSR
    }
  )
);

// Initialize theme on client-side only
if (typeof window !== "undefined") {
  const theme = getInitialTheme();
  useThemeStore.getState().setTheme(theme);
}
