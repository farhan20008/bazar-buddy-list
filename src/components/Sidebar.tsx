
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, ChevronRight, LogOut, User, 
  LayoutDashboard, Flask, History, Star, Settings, Database, BookText, 
  CreditCard, Bell, PlusCircle, ListMusic, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "@/components/ui/use-toast";
import { getText } from "@/utils/translations";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(true);
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user's name from metadata or use email as fallback
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email || "example@bazarbuddy.com";

  const onLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };

  const sidebarLinks = [
    {
      name: getText("dashboard", language),
      href: "/dashboard",
      icon: <LayoutDashboard size={collapsed ? 20 : 18} />
    }, 
    {
      name: getText("createList", language),
      href: "/create-list",
      icon: <PlusCircle size={collapsed ? 20 : 18} />
    }, 
    {
      name: getText("history", language),
      href: "/list-history",
      icon: <ListMusic size={collapsed ? 20 : 18} />
    }
  ];

  const userMenuLinks = [
    {
      name: "Account",
      href: "#",
      icon: <User size={16} />
    },
    {
      name: "Billing",
      href: "#",
      icon: <CreditCard size={16} />
    },
    {
      name: "Notifications",
      href: "#", 
      icon: <Bell size={16} />
    }
  ];

  const SidebarContent = () => (
    <div className={cn(
      "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header/Logo section */}
      <div className={cn("flex items-center gap-2 p-3", collapsed ? "justify-center" : "px-4")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-primary-foreground">
          <User size={16} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">BazarBuddy</span>
            <span className="text-xs text-sidebar-foreground/60">Family Grocery</span>
          </div>
        )}
      </div>
      
      <Separator className="my-2" />

      {/* Sidebar collapse button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setCollapsed(!collapsed)} 
        className="mx-auto mb-2 h-6 w-6 rounded-full p-0"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </Button>

      {/* Main navigation */}
      <div className="flex-1 px-2 py-1">
        <div className="mb-3">
          {!collapsed && <p className="px-2 py-1 text-xs font-medium uppercase text-sidebar-foreground/50">Platform</p>}
          <Collapsible
            open={playgroundOpen}
            onOpenChange={setPlaygroundOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === "/playground" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}>
                {collapsed ? (
                  <Flask className="mx-auto" size={20} />
                ) : (
                  <>
                    <Flask size={18} />
                    <span className="flex-1 text-left">Playground</span>
                    {playgroundOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </>
                )}
              </button>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="pl-9">
                <ul className="space-y-1 pb-1">
                  {["History", "Starred", "Settings"].map((item) => (
                    <li key={item}>
                      <a 
                        href="#"
                        className="block rounded-md px-2 py-1 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            )}
          </Collapsible>
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarLinks.map(link => (
            <a 
              key={link.href} 
              href={link.href} 
              onClick={e => {
                e.preventDefault();
                navigate(link.href);
                setOpen(false);
              }} 
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              {link.icon}
              {!collapsed && <span>{link.name}</span>}
            </a>
          ))}

          {/* Extra menu items shown in collapsed state */}
          {collapsed ? (
            <>
              <a href="#" className="flex justify-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Database size={20} />
              </a>
              <a href="#" className="flex justify-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <BookText size={20} />
              </a>
              <a href="#" className="flex justify-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Settings size={20} />
              </a>
            </>
          ) : (
            <>
              <div className="my-1">
                <a href="#" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Database size={18} />
                  <span>Models</span>
                  <ChevronRight size={16} className="ml-auto" />
                </a>
              </div>
              <div className="my-1">
                <a href="#" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <BookText size={18} />
                  <span>Documentation</span>
                  <ChevronRight size={16} className="ml-auto" />
                </a>
              </div>
              <div className="my-1">
                <a href="#" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Settings size={18} />
                  <span>Settings</span>
                  <ChevronRight size={16} className="ml-auto" />
                </a>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* User profile section */}
      <div className="sticky bottom-0 border-t border-sidebar-border bg-sidebar p-2">
        <Popover>
          <PopoverTrigger asChild>
            <div className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "justify-center" : "justify-between"
            )}>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-sidebar-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sidebar-foreground">
                      {userName}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 truncate max-w-[120px]">
                      {userEmail}
                    </span>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronRight size={16} />}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" side="right" align="start">
            <div className="border-b border-sidebar-border p-2">
              <div className="flex items-center gap-2 pb-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userEmail}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-1">
                Upgrade to Pro
              </Button>
            </div>
            <div className="p-1">
              {userMenuLinks.map((item) => (
                <Button key={item.name} variant="ghost" size="sm" className="w-full justify-start text-sm mb-1">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut size={16} />
                <span className="ml-2">{getText("logout", language)}</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  // Mobile sidebar using Sheet component
  return (
    <>
      <div className={cn("hidden md:block", className)}>
        <SidebarContent />
      </div>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1.5 11C1.22386 11 1 11.2239 1 11.5C1 11.7761 1.22386 12 1.5 12H13.5C13.7761 12 14 11.7761 14 11.5C14 11.2239 13.7761 11 13.5 11H1.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center text-primary-foreground rounded-lg bg-blue-600">
                <User size={16} />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Bazar Buddy
              </span>
            </div>
          </div>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
