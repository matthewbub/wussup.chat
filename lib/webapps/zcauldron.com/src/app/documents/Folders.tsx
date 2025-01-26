import { ChevronRight, Plus, FilePlus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/button";
import { dummyFolders } from "./dummy-data";

interface Folder {
  name: string;
  emoji: string;
  pages: { name: string; emoji: string }[];
}

interface FoldersProps {
  folders?: Folder[];
  onCreateFile: () => void;
}

export function Folders({
  folders = dummyFolders,
  onCreateFile,
}: FoldersProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
        <div className="w-full">Documents</div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onCreateFile}>
                <FilePlus className="h-4 w-4" />
                <span className="sr-only">Create New File</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create New Document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {folders.map((folder) => (
            <Collapsible key={folder.name}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <span>{folder.emoji}</span>
                    <span>{folder.name}</span>
                  </a>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                    showOnHover
                  >
                    <ChevronRight />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <SidebarMenuAction showOnHover>
                  <Plus />
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {folder.pages.map((page) => (
                      <SidebarMenuSubItem key={page.name}>
                        <SidebarMenuSubButton asChild>
                          <a href="#">
                            <span>{page.emoji}</span>
                            <span>{page.name}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          {/* TODO implement this later */}
          {/*<SidebarMenuItem>*/}
          {/*  <SidebarMenuButton className="text-sidebar-foreground/70">*/}
          {/*    <MoreHorizontal />*/}
          {/*    <span>More</span>*/}
          {/*  </SidebarMenuButton>*/}
          {/*</SidebarMenuItem>*/}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
