import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus, Minus, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/inventory")({
  component: Inventory,
});

function Inventory() {
  const pistaProducts = [
    { id: 1, name: "Gasolina Comum", qty: "450L", min: "500L", status: "low" },
    { id: 2, name: "Óleo 5W30", qty: "12 un", min: "10 un", status: "ok" },
    { id: 3, name: "Aditivo STP", qty: "2 un", min: "5 un", status: "critical" },
  ];

  const estoqueProducts = [
    { id: 1, name: "Gasolina Comum", qty: "8500L", min: "2000L", status: "ok" },
    { id: 2, name: "Óleo 5W30", qty: "48 un", min: "20 un", status: "ok" },
    { id: 3, name: "Filtro de Óleo", qty: "15 un", min: "10 un", status: "ok" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "critical") return <Badge variant="destructive">Crítico</Badge>;
    if (status === "low") return <Badge className="bg-orange-500 hover:bg-orange-600">Baixo</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Ok</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Controle de Estoque</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><History className="h-4 w-4" /> Histórico</Button>
          <Button className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Transferir</Button>
        </div>
      </div>

      <Tabs defaultValue="pista" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pista">Pista</TabsTrigger>
          <TabsTrigger value="estoque">Estoque Central</TabsTrigger>
        </TabsList>
        <TabsContent value="pista" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos na Pista</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pistaProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-bold">{p.qty}</TableCell>
                      <TableCell className="text-muted-foreground">{p.min}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="estoque" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estoque Central</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estoqueProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-bold">{p.qty}</TableCell>
                      <TableCell className="text-muted-foreground">{p.min}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
