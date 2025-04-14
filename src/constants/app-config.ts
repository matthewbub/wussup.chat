import { Home, Settings, HelpCircle } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [{ name: "Home", href: "/", icon: Home }];
const navItemsSecondary: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export const appConfig = {
  name: "ZCauldron",
  version: "6",
  plans: {
    free: {
      name: "Free",
      dailyMaxCount: 20,
      monthlyMaxCount: 100,
    },
    pro: {
      name: "Pro",
      dailyMaxCount: 1500,
      monthlyMaxCount: 1500,
    },
  },
  navigation: {
    topNav: navItems,
    bottomNav: navItemsSecondary,
  },
  urls: {
    support: "/support",
    settings: "/settings",
    home: "/",
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
};

export const features = [
  "1,500 chat messages per month",
  "Bring your own API key for unlimited chat messages",
  "Early access to experimental features",
];

export const plan = {
  name: "Pro (Alpha, 1 Month)",
  price: "$5.00",
  originalPrice: "$9.00",
  period: "recurring",
  description: "Get 1,500 chat messages per month",
  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING,
};
