
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { exportarRelatorioDiarioMecanico } from "@/services/exportService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

// Mock de dados dos mecânicos para exemplo
const mockMecanicos = [
  { id: "1", nome: "Carlos Pereira" },
  { id: "2", nome: "Roberto Silva" },
  { id: "3", nome: "Antônio Santos" },
  { id: "4", nome: "José Oliveira" },
  { id: "5", nome: "Paulo Costa" },
];

// Mock de serviços e vales por mecânico
const getMecanicoData = (mecanicoId: string) => {
  const mecanico = mockMecanicos.find(m => m.id === mecanicoId);
  if (!mecanico) return null;
  
  // Dados simulados
  return {
    nome: mecanico.nome,
    servicos: Math.floor(Math.random() * 10) + 5,
    comissao: Math.floor(Math.random() * 2000) + 500,
    servicosDia: Array(Math.floor(Math.random() * 5) + 3).fill(0).map((_, i) => ({
      descricao: `Serviço #${i+1} - ${['Troca de óleo', 'Freios', 'Suspensão', 'Elétrica', 'Revisão'][i % 5]}`,
      valor: Math.floor(Math.random() * 300) + 100,
      comissao: Math.floor(Math.random() * 150) + 50,
    })),
    vales: Array(Math.floor(Math.random() * 3)).fill(0).map((_, i) => ({
      data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valor: Math.floor(Math.random() * 200) + 50,
      pago: Math.random() > 0.7,
    })),
    saldo: Math.floor(Math.random() * 1500) + 300,
    valorIssqn: Math.floor(Math.random() * 100) + 20,
  };
};

interface PagamentoDialogProps {
  mecanicoId: string;
  mecanicoNome: string;
  onPagamentoRealizado: () => void;
}

const PagamentoDialog = ({ mecanicoId, mecanicoNome, onPagamentoRealizado }: PagamentoDialogProps) => {
  const { user } = useAuth();
  const [adminPassword, setAdminPassword] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoQuitacao, setTipoQuitacao] = useState("external");
  
  const mecanicoData = getMecanicoData(mecanicoId);
  
  const handlePagamento = async () => {
    // Primeiro verificamos se a senha do admin está correta
    if (user?.perfil !== "admin" || user?.senha !== adminPassword) {
      toast.error("Senha de administrador incorreta!");
      return;
    }
    
    // Verificamos se o valor é válido
    const valor = parseFloat(valorPago);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Por favor, informe um valor válido!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificamos se há saldo suficiente para quitação interna
      if (tipoQuitacao === "internal" && (!mecanicoData || valor > mecanicoData.saldo)) {
        toast.error("Saldo insuficiente para quitação do valor informado!");
        return;
      }
      
      toast.success(`Pagamento de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`);
      setDialogOpen(false);
      setAdminPassword("");
      setValorPago("");
      onPagamentoRealizado();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Registrar Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Registre um pagamento para o mecânico {mecanicoNome}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="valor">Valor do Pagamento</Label>
            <Input
              id="valor"
              type="number"
              placeholder="Valor em R$"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tipo-quitacao">Tipo de Quitação</Label>
            <Select value={tipoQuitacao} onValueChange={setTipoQuitacao}>
              <SelectTrigger id="tipo-quitacao">
                <SelectValue placeholder="Selecione o tipo de quitação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">Pagamento Externo</SelectItem>
                <SelectItem value="internal">
                  Descontar do Saldo {mecanicoData ? `(Disponível: ${mecanicoData.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : ''}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Senha de Administrador</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Digite a senha de administrador"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePagamento} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Pagamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RelatorioMecanicoDiario = () => {
  const [mecanicoSelecionado, setMecanicoSelecionado] = useState<string>("");
  const [dataRelatorio, setDataRelatorio] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const mecanicoData = mecanicoSelecionado ? getMecanicoData(mecanicoSelecionado) : null;
  const mecanicoNome = mockMecanicos.find(m => m.id === mecanicoSelecionado)?.nome || "";
  
  const handleExportarPDF = () => {
    if (!mecanicoData) {
      toast.error("Selecione um mecânico para gerar o relatório!");
      return;
    }
    
    try {
      exportarRelatorioDiarioMecanico(mecanicoData, 'pdf');
      toast.success("Relatório exportado como PDF!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório. Tente novamente.");
    }
  };
  
  const handleExportarExcel = () => {
    if (!mecanicoData) {
      toast.error("Selecione um mecânico para gerar o relatório!");
      return;
    }
    
    try {
      exportarRelatorioDiarioMecanico(mecanicoData, 'excel');
      toast.success("Relatório exportado como Excel!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório. Tente novamente.");
    }
  };
  
  const handlePagamentoRealizado = () => {
    setIsLoading(true);
    
    // Simula um recarregamento dos dados
    setTimeout(() => {
      toast.success("Dados do mecânico atualizados com sucesso!");
      setIsLoading(false);
    }, 1000);
  };
  
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatório Diário de Mecânico</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="data-relatorio" className="sr-only">Data</Label>
          <Input
            id="data-relatorio"
            type="date"
            value={dataRelatorio}
            onChange={(e) => setDataRelatorio(e.target.value)}
            className="w-40"
          />
          
          <Select value={mecanicoSelecionado} onValueChange={setMecanicoSelecionado}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um mecânico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Mecânicos</SelectItem>
              {mockMecanicos.map((mecanico) => (
                <SelectItem key={mecanico.id} value={mecanico.id}>
                  {mecanico.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportarPDF} disabled={!mecanicoData || isLoading}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          <Button variant="outline" onClick={handleExportarExcel} disabled={!mecanicoData || isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>
      
      {mecanicoData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo - {mecanicoData.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Serviços</p>
                    <p className="text-2xl font-bold">{mecanicoData.servicos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatarValor(mecanicoData.comissao)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ISSQN (5%)</p>
                    <p className="text-lg font-semibold">{formatarValor(mecanicoData.valorIssqn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Vales {mecanicoData.vales.length > 0 ? "Pendentes" : ""}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatarValor(mecanicoData.vales.reduce((acc, vale) => acc + (!vale.pago ? vale.valor : 0), 0))}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatarValor(mecanicoData.saldo)}
                      </p>
                    </div>
                    
                    <PagamentoDialog 
                      mecanicoId={mecanicoSelecionado} 
                      mecanicoNome={mecanicoNome} 
                      onPagamentoRealizado={handlePagamentoRealizado} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Serviços do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mecanicoData.servicosDia.length > 0 ? (
                  mecanicoData.servicosDia.map((servico, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{servico.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          Valor: {formatarValor(servico.valor)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatarValor(servico.comissao)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Nenhum serviço registrado para este dia.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {mecanicoData.vales.filter(v => !v.pago).length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vales Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mecanicoData.vales.filter(v => !v.pago).map((vale, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">Vale de {formatarValor(vale.valor)}</p>
                        <p className="text-sm text-muted-foreground">
                          Data: {new Date(vale.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione um mecânico</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
              Escolha um mecânico no menu acima para visualizar seu relatório diário de serviços, vales e pagamentos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RelatorioMecanicoDiario;
