import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User as UserIcon, Fuel, AlertCircle, ShoppingCart, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/attendant")({
  component: AttendantArea,
});

function AttendantArea() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo logic
    if (password.length >= 2) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#121212] border-yellow-500/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-blue-600 to-yellow-500" />
            <CardHeader className="text-center pt-10 pb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Fuel className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl font-black text-white uppercase italic tracking-widest">
                Acesso <span className="text-yellow-500">Frentista</span>
              </CardTitle>
              <p className="text-white/40 text-sm font-medium mt-2">Posto Buriti - Área Operacional</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Código de Acesso</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
                    <Input 
                      placeholder="Ex: 01" 
                      className="bg-white/5 border-white/10 h-14 pl-12 text-lg font-bold focus-visible:ring-yellow-500/50 transition-all"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Senha Numérica</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="● ● ● ●" 
                      maxLength={4}
                      className="bg-white/5 border-white/10 h-14 pl-12 pr-12 text-2xl tracking-[0.5em] font-bold focus-visible:ring-yellow-500/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 text-center mt-2">Mínimo de 2 e máximo de 4 números</p>
                </div>
                <Button 
                  type="submit"
                  disabled={password.length < 2}
                  className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase italic tracking-widest text-lg shadow-lg shadow-yellow-500/20 disabled:opacity-50 transition-all"
                >
                  Entrar na Pista
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Controle de <span className="text-yellow-500">Pista</span>
          </h2>
          <p className="text-white/50 font-medium">Frentista: João Silva | Operação Ativa</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                    placeholder="Pesquisar produto..." 
                    className="bg-[#121212] border-yellow-500/20 pl-10 h-11 focus-visible:ring-yellow-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="destructive" onClick={() => setIsAuthenticated(false)} className="h-11 font-bold uppercase italic text-xs tracking-widest px-6">Sair</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Óleo 5W30 Sintético", brand: "Ipiranga", price: "R$ 45,90", stock: 12, min: 5, category: "Lubrificantes" },
          { name: "Aditivo Radiador", brand: "STP", price: "R$ 28,00", stock: 3, min: 10, category: "Aditivos" },
          { name: "Água Desmineralizada", brand: "Radnaq", price: "R$ 8,50", stock: 25, min: 15, category: "Fluidos" },
          { name: "Fluido de Freio DOT 4", brand: "Bosch", price: "R$ 32,00", stock: 8, min: 5, category: "Fluidos" },
          { name: "Palheta Dianteira", brand: "Dyna", price: "R$ 65,00", stock: 4, min: 6, category: "Acessórios" },
          { name: "Filtro de Óleo PSL55", brand: "Tecfil", price: "R$ 22,00", stock: 15, min: 8, category: "Filtros" },
        ].filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product, i) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-[#121212] border-white/5 hover:border-yellow-500/30 transition-all overflow-hidden ${product.stock < product.min ? 'ring-1 ring-red-500/50' : ''}`}>
              <CardContent className="p-0">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-yellow-500/10 text-yellow-500">{product.category}</span>
                        {product.stock < product.min && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-red-500/20 text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Estoque Baixo
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{product.name}</h3>
                    <p className="text-xs font-bold text-white/40 mb-4">{product.brand}</p>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Preço Unit.</p>
                            <p className="text-2xl font-black text-yellow-500">{product.price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Estoque Pista</p>
                            <p className={`text-xl font-black ${product.stock < product.min ? 'text-red-500' : 'text-white'}`}>{product.stock} un</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold h-12">
                            Ver Detalhes
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-widest h-12 flex gap-2">
                            <ShoppingCart className="w-4 h-4" /> Vender
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
