
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Calendar, Download, FileText, Filter, Users, Wrench } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  exportarRelatorioCompleto,
  exportarRelatorioServicos,
  exportarRelatorioMecanicos,
  exportarRelatorioVales
} from "@/services/exportService";

// Mock de dados para os relatórios
const mockServicosData = [
  { mes: 'Jan', quantidade: 25, valor: 4200 },
  { mes: 'Fev', quantidade: 28, valor: 4800 },
  { mes: 'Mar', quantidade: 32, valor: 5500 },
  { mes: 'Abr', quantidade: 35, valor: 6200 },
  { mes: 'Mai', quantidade: 30, valor: 5100 },
  { mes: 'Jun', quantidade: 40, valor: 7000 },
];

const mockMecanicoData = [
  { nome: 'Carlos Pereira', servicos: 22, comissao: 1100 },
  { nome: 'Roberto Silva', servicos: 18, comissao: 900 },
  { nome: 'Antônio Santos', servicos: 15, comissao: 750 },
  { nome: 'José Oliveira', servicos: 25, comissao: 1250 },
  { nome: 'Paulo Costa', servicos: 20, comissao: 1000 },
];

const mockTipoServicosData = [
  { nome: 'Troca de Óleo', valor: 2800, quantidade: 35 },
  { nome: 'Revisão Completa', valor: 6400, quantidade: 16 },
  { nome: 'Freios', valor: 3200, quantidade: 20 },
  { nome: 'Suspensão', valor: 5100, quantidade: 15 },
  { nome: 'Elétrica', valor: 4500, quantidade: 18 },
  { nome: 'Outros', valor: 1800, quantidade: 12 },
];

const mockValesData = [
  { mes: 'Jan', quantidade: 18, valor: 2200 },
  { mes: 'Fev', quantidade: 22, valor: 2600 },
  { mes: 'Mar', quantidade: 24, valor: 3000 },
  { mes: 'Abr', quantidade: 20, valor: 2400 },
  { mes: 'Mai', quantidade: 25, valor: 3200 },
  { mes: 'Jun', quantidade: 30, valor: 3800 },
];

// Cores para os gráficos
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

const Relatorios = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("semestre");
  const [anoSelecionado, setAnoSelecionado] = useState("2025");

  const handleExportarRelatorioPDF = () => {
    try {
      exportarRelatorioCompleto(
        mockServicosData,
        mockMecanicoData,
        mockValesData,
        mockTipoServicosData,
        'pdf'
      );
      toast.success("Relatório exportado como PDF!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório. Tente novamente.");
    }
  };

  const handleExportarRelatorioExcel = () => {
    try {
      exportarRelatorioCompleto(
        mockServicosData,
        mockMecanicoData,
        mockValesData,
        mockTipoServicosData,
        'excel'
      );
      toast.success("Relatório exportado como Excel!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório. Tente novamente.");
    }
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const totalServicos = mockServicosData.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValorServicos = mockServicosData.reduce((acc, item) => acc + item.valor, 0);
  
  const totalVales = mockValesData.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValorVales = mockValesData.reduce((acc, item) => acc + item.valor, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Relatórios Gerenciais</h1>
          <div className="flex space-x-2">
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês Atual</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportarRelatorioPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            
            <Button variant="outline" onClick={handleExportarRelatorioExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <span className="text-3xl font-bold">{totalServicos}</span>
                  <p className="text-sm text-gray-500">No período</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Valor Total (Serviços)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <span className="text-3xl font-bold">{formatarValor(totalValorServicos)}</span>
                  <p className="text-sm text-gray-500">No período</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Vales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-amber-500 mr-3" />
                <div>
                  <span className="text-3xl font-bold">{totalVales}</span>
                  <p className="text-sm text-gray-500">No período</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Valor Total (Vales)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <span className="text-3xl font-bold">{formatarValor(totalValorVales)}</span>
                  <p className="text-sm text-gray-500">No período</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Serviços por Mês</CardTitle>
              <CardDescription>
                Quantidade e valor dos serviços realizados por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockServicosData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === "valor") return formatarValor(value as number);
                      return value;
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="quantidade" name="Quantidade" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="valor" name="Valor (R$)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Serviços por Tipo</CardTitle>
              <CardDescription>
                Participação de cada tipo de serviço no faturamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockTipoServicosData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="nome"
                      label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockTipoServicosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => {
                      if (props && props.payload && props.payload.nome) {
                        return [formatarValor(value as number), props.payload.nome];
                      }
                      return [value, name];
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vales Emitidos por Mês</CardTitle>
              <CardDescription>
                Evolução da quantidade e valor dos vales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mockValesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === "valor") return formatarValor(value as number);
                      return value;
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="quantidade" name="Quantidade" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="valor" name="Valor (R$)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Mecânico</CardTitle>
              <CardDescription>
                Serviços realizados e comissões por mecânico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mecânico</TableHead>
                      <TableHead>Serviços</TableHead>
                      <TableHead>Comissão (5%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMecanicoData.map((mecanico, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{mecanico.nome}</TableCell>
                        <TableCell>{mecanico.servicos}</TableCell>
                        <TableCell>{formatarValor(mecanico.comissao)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {mockMecanicoData.reduce((acc, item) => acc + item.servicos, 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatarValor(mockMecanicoData.reduce((acc, item) => acc + item.comissao, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
