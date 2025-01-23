import { create } from "zustand";

interface Subscription {
  isSubscribed: boolean;
  active: boolean;
  expiresAt: Date | null;
  status: string | null;
}

interface SubscriptionState {
  subscription: Subscription;
  isLoading: boolean;
  error: string | null;
  setSubscription: (subscription: Partial<Subscription>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  subscription: {
    isSubscribed: false,
    active: false,
    expiresAt: null,
    status: null,
  },
  isLoading: false,
  error: null,
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  ...initialState,

  setSubscription: (subscription) =>
    set((state) => ({
      subscription: { ...state.subscription, ...subscription },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
