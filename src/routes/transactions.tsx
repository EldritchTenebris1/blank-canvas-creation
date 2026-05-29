import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/transactions")({
  component: Transactions,
});

function Transactions() {
  const transactions = [
    { id: 1, user: "João", type: "Venda", product: "Óleo 5W30", qty: "2 un", date: "29/05/2026", time: "14:30", origin: "Pista", status: "success" },
    { id: 2, user: "Maria", type: "Entrada", product: "Gasolina Comum", qty: "5000L", date: "29/05/2026", time: "11:15", origin: "Estoque", status: "success" },
    { id: 3, user: "Carlos", type: "Transferência", product: "Óleo Mineral", qty: "10 un", date: "29/05/2026", time: "09:45", origin: "Estoque -> Pista", status: "success" },
    { id: 4, user: "João", type: "Ajuste Manual", product: "Aditivo", qty: "-1 un", date: "28/05/2026", time: "17:20", origin: "Pista", status: "warning" },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Venda": return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "Entrada": return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
      case "Transferência": return <RefreshCcw className="h-4 w-4 text-purple-500" />;
      default: return <Filter className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "Venda": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Entrada": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Transferência": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Ajuste Manual": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros Avançados
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar transações..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsável</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {t.user[0]}
                    </div>
                    <span className="font-medium text-sm">{t.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`gap-1 px-2 py-0.5 font-medium ${getStatusColor(t.type)}`}>
                    {getTypeIcon(t.type)}
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{t.product}</TableCell>
                <TableCell className="font-mono text-sm">{t.qty}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.origin}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {t.date} <span className="text-[10px] opacity-70">{t.time}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
