import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Warehouse, Receipt, Bell, User } from "lucide-react";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PostoPro" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl">
          <SidebarHeader className="p-4 font-bold text-xl text-primary">PostoPro</SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/products"><Package className="w-4 h-4" /> Produtos</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/inventory"><Warehouse className="w-4 h-4" /> Estoque/Pista</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/transactions"><Receipt className="w-4 h-4" /> Transações</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/attendant" className="text-orange-600 font-bold"><User className="w-4 h-4" /> Frentista</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 bg-background/50">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
            <h1 className="text-lg font-semibold">PostoPro</h1>
            <div className="ml-auto flex items-center gap-4">
              <Bell className="w-5 h-5 cursor-pointer hover:text-primary" />
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
                <User className="w-4 h-4" />
              </div>
            </div>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
