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
  name: "Wussup Chat",
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
};
