import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, TrendingUp, AlertCircle, Fuel } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const meta = 5000;
  const vendido = 3250;
  const progresso = (vendido / meta) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {vendido.toLocaleString('pt-BR')}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso da Meta (R$ {meta.toLocaleString('pt-BR')})</span>
                <span>{progresso.toFixed(0)}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground text-destructive">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações Hoje</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Entradas e saídas registradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "João", action: "vendeu 2 unidades", item: "Óleo 5W30", time: "Há 10 min" },
                { name: "Maria", action: "adicionou 10 unidades", item: "Estoque Pista", time: "Há 25 min" },
                { name: "Carlos", action: "vendeu 15L", item: "Gasolina Comum", time: "Há 1 hora" },
              ].map((notif, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {notif.name[0]}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-bold">{notif.name}</span> {notif.action} de <span className="font-bold">{notif.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Estoque Baixo: Aditivo STP</p>
                  <p className="text-xs">Restam apenas 2 unidades na pista.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Reposição Necessária</p>
                  <p className="text-xs">Transferir Óleo Mineral do estoque central.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
