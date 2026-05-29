import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Fuel, ShoppingBag, History, Target, Package, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/attendant")({
  component: AttendantDashboard,
});

function AttendantDashboard() {
  const meta = 5000;
  const vendido = 3250;
  const progresso = (vendido / meta) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Área do Frentista</h2>
          <p className="text-muted-foreground italic">Bem-vindo, João.</p>
        </div>
        <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
          <Fuel className="h-5 w-5" /> Nova Venda
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Minha Meta Mensal</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">R$ {vendido.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-muted-foreground mt-1">de R$ {meta.toLocaleString('pt-BR')}</p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Progresso</span>
                <span>{progresso.toFixed(0)}%</span>
              </div>
              <Progress value={progresso} className="h-3 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-2">
          <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
            <ShoppingBag className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="font-bold text-sm text-foreground">Vender Produto</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
            <Package className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="font-bold text-sm text-foreground">Solicitar Reposição</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
            <History className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="font-bold text-sm text-foreground">Minhas Vendas</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer border-dashed border-destructive/50">
            <AlertTriangle className="h-8 w-8 mb-2 text-destructive" />
            <span className="font-bold text-sm text-destructive">Comunicar Erro</span>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alertas do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Gasolina Aditivada está com estoque baixo na bomba 4.</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg">
              <Fuel className="h-5 w-5" />
              <span className="text-sm font-medium">Reposição de Óleo 5W30 disponível no estoque central.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
