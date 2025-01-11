import { create } from "zustand";
import { authService } from "@/services/auth";

interface UserSettingsStore {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  updateUser: (data: { email?: string; username?: string }) => Promise<void>;
  deleteUser: () => Promise<void>;
  reset: () => void;
}

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
  isLoading: false,
  error: null,
  success: false,

  // all-lowercase comment: update user details
  updateUser: async (data: { email?: string; username?: string }) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await authService.updateUser(data);
      set({ success: true });
      return response;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // all-lowercase comment: delete user account
  deleteUser: async () => {
    set({ isLoading: true, error: null, success: false });
    try {
      await authService.deleteUser();
      set({ success: true });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // all-lowercase comment: reset store state
  reset: () => {
    set({ isLoading: false, error: null, success: false });
  },
}));
