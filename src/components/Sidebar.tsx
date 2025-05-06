
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, ListMusic, LogOut, Menu, PlusCircle, User, X } from "lucide-react";
import { getText } from "@/utils/translations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Sidebar as ShadcnSidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user's name from metadata or use email as fallback
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

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
      icon: <LayoutDashboard size={18} />
    }, 
    {
      name: getText("createList", language),
      href: "/create-list",
      icon: <PlusCircle size={18} />
    }, 
    {
      name: getText("history", language),
      href: "/list-history",
      icon: <ListMusic size={18} />
    }
  ];

  // Create the sidebar content component
  const SidebarContents = () => {
    const { state } = useSidebar();
    
    return (
      <ShadcnSidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground bg-orange-600">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                BazarBuddy
              </span>
              {state !== "collapsed" && (
                <span className="text-xs text-sidebar-foreground/60">
                  Family Grocery management
                </span>
              )}
            </div>
          </div>
          <Separator className="mb-2" />
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {sidebarLinks.map(link => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={link.name}
                  isActive={location.pathname === link.href}
                >
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.href);
                      setOpen(false);
                    }}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-sidebar-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {userName}
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout} 
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label={getText("logout", language)}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
    );
  };

  // Mobile sidebar using Sheet component
  return (
    <SidebarProvider>
      <div className="hidden md:block h-screen">
        <SidebarContents />
      </div>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center text-primary-foreground rounded-2xl bg-orange-600">
                <User size={16} />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                BazarBuddy
              </span>
            </div>
          </div>
          <SheetContent side="left" className="p-0">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 md:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
            <SidebarContents />
          </SheetContent>
        </Sheet>
      </div>
    </SidebarProvider>
  );
}
