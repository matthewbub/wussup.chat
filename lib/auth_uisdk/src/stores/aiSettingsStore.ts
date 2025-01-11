import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AISettingsState {
  model: string;
  setModel: (model: string) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      model: "gpt-4",
      setModel: (model) => set({ model }),
    }),
    {
      name: "ai-settings",
    }
  )
);
