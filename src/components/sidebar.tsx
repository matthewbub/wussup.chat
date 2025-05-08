import {
  Calendar,
  Home,
  Image as ImageIcon,
  Inbox,
  Search,
  Settings,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// Menu items.
const items = [
  {
    title: "Some really long title that should wrap",
    url: "#",
    icon: Home,
  },
  {
    title: "When to use JavaScript for a button",
    url: "#",
    icon: Inbox,
  },
  {
    title: "When to use JavaScript for a button",
    url: "#",
    icon: Calendar,
  },
  {
    title: "When to use JavaScript for a button",
    url: "#",
    icon: Search,
  },
  {
    title: "When to use JavaScript for a button",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-stone-300 font-black">
            Wussup
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <span className="text-stone-300/80">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mt-4" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/images">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-stone-300/80">Images</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/account">
                    <User className="w-4 h-4" />
                    <span className="text-stone-300/80">Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
