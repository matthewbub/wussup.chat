import { User } from "@/types/user";
import { create } from "zustand";

type NavUserStore = {
  isBillingOpen: boolean;
  isAuthOpen: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  openBilling: () => void;
  closeBilling: () => void;
  openAuth: () => void;
  closeAuth: () => void;
};
const useNavUserStore = create<NavUserStore>((set) => ({
  isBillingOpen: false,
  isAuthOpen: false,
  user: null,
  setUser: (user: User | null) => set({ user }),
  openBilling: () => set({ isBillingOpen: true }),
  closeBilling: () => set({ isBillingOpen: false }),
  openAuth: () => set({ isAuthOpen: true }),
  closeAuth: () => set({ isAuthOpen: false }),
}));

export default useNavUserStore;
