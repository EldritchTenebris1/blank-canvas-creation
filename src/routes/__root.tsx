import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Warehouse, Receipt, Bell, User, Fuel, Settings, BarChart } from "lucide-react";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Posto Buriti | Gestão" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
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
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <Sidebar className="border-r border-yellow-500/10 bg-[#121212] backdrop-blur-xl">
          <SidebarHeader className="p-6 border-b border-yellow-500/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black">B</div>
              <span className="font-bold text-xl text-white">Posto Buriti</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4 gap-2">
            <SidebarMenu>
              {[
                { to: "/", icon: LayoutDashboard, label: "Dashboard" },
                { to: "/products", icon: Package, label: "Produtos" },
                { to: "/inventory", icon: Warehouse, label: "Estoque/Pista" },
                { to: "/transactions", icon: Receipt, label: "Movimentações" },
                { to: "/relatorios", icon: BarChart, label: "Relatórios" },
                { to: "/attendant", icon: User, label: "Área Frentista" },
              ].map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild className="hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors">
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" /> {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-yellow-500/10">
            <SidebarMenuButton className="hover:bg-yellow-500/10 hover:text-yellow-500">
                <Settings className="w-5 h-5" /> Configurações
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-yellow-500/10 bg-[#0a0a0a]/80 px-8 backdrop-blur-md">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase italic text-yellow-500">Gerenciamento Operacional</h1>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer hover:text-yellow-500 transition-colors" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#0a0a0a]"></span>
              </div>
              <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white">Admin</p>
                  <p className="text-xs text-white/50">Posto Buriti</p>
                </div>
              </div>
            </div>
          </header>
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
