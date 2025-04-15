
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Search, X, Filter, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos para serviços
type StatusServico = "em_andamento" | "concluido" | "cancelado";

type Servico = {
  id: string;
  data: string;
  cliente: string;
  telefone: string; // Novo campo de telefone
  veiculo: string;
  descricao: string;
  mecanicoId: string;
  mecanicoNome: string;
  valor: number;
  comissao: number; // Novo campo de comissão (em percentual)
  status: StatusServico;
};

// Mock de mecânicos para o select
const mockMecanicos = [
  { id: "1", nome: "Carlos Pereira" },
  { id: "2", nome: "Roberto Silva" },
  { id: "3", nome: "Antônio Santos" },
  { id: "4", nome: "José Oliveira" },
  { id: "5", nome: "Paulo Costa" },
];

// Opções de comissão
const opcoesComissao = [
  { valor: 100, label: "100%" },
  { valor: 80, label: "80%" },
  { valor: 50, label: "50%" },
  { valor: 30, label: "30%" },
  { valor: 0, label: "0%" },
];

// Mock de serviços
const mockServicos: Servico[] = [
  {
    id: "1",
    data: "2025-06-01",
    cliente: "João Silva",
    telefone: "69993059302", // Adicionado telefone
    veiculo: "Ford Ka 2018",
    descricao: "Troca de óleo e filtros",
    mecanicoId: "1",
    mecanicoNome: "Carlos Pereira",
    valor: 250.0,
    comissao: 50, // Adicionado comissão
    status: "em_andamento",
  },
  {
    id: "2",
    data: "2025-05-29",
    cliente: "Maria Santos",
    telefone: "69993059302",
    veiculo: "Honda Fit 2020",
    descricao: "Revisão completa",
    mecanicoId: "2",
    mecanicoNome: "Roberto Silva",
    valor: 450.0,
    comissao: 80,
    status: "em_andamento",
  },
  {
    id: "3",
    data: "2025-05-28",
    cliente: "Pedro Oliveira",
    telefone: "69993059302",
    veiculo: "Fiat Uno 2015",
    descricao: "Troca de pastilhas de freio",
    mecanicoId: "3",
    mecanicoNome: "Antônio Santos",
    valor: 180.0,
    comissao: 100,
    status: "concluido",
  },
  {
    id: "4",
    data: "2025-05-27",
    cliente: "Ana Rodrigues",
    telefone: "69993059302",
    veiculo: "Toyota Corolla 2021",
    descricao: "Alinhamento e balanceamento",
    mecanicoId: "4",
    mecanicoNome: "José Oliveira",
    valor: 200.0,
    comissao: 80,
    status: "concluido",
  },
  {
    id: "5",
    data: "2025-05-26",
    cliente: "Carlos Mendes",
    telefone: "69993059302",
    veiculo: "Volkswagen Gol 2019",
    descricao: "Reparo no sistema elétrico",
    mecanicoId: "5",
    mecanicoNome: "Paulo Costa",
    valor: 320.0,
    comissao: 50,
    status: "cancelado",
  },
];

const Servicos = () => {
  const [servicos, setServicos] = useState<Servico[]>(mockServicos);
  const [filteredServicos, setFilteredServicos] = useState<Servico[]>(mockServicos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<string>("todos");
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);
  const [formData, setFormData] = useState<Omit<Servico, "id" | "mecanicoNome">>({
    data: new Date().toISOString().split("T")[0],
    cliente: "",
    telefone: "", // Adicionado telefone
    veiculo: "",
    descricao: "",
    mecanicoId: "",
    valor: 0,
    comissao: 100, // Valor default = 100%
    status: "em_andamento",
  });

  const { user } = useAuth();
  const isAdmin = user?.perfil === "admin";
  const isUsuario = user?.perfil === "usuario";
  
  // Filtrar por status e termo de busca
  const filterServicos = (status: string, term: string) => {
    let filtered = [...servicos];
    
    // Filtrar por status
    if (status !== "todos") {
      filtered = filtered.filter(servico => servico.status === status);
    }
    
    // Filtrar por termo de busca
    if (term.trim()) {
      filtered = filtered.filter(
        servico =>
          servico.cliente.toLowerCase().includes(term.toLowerCase()) ||
          servico.telefone.toLowerCase().includes(term.toLowerCase()) ||
          servico.veiculo.toLowerCase().includes(term.toLowerCase()) ||
          servico.descricao.toLowerCase().includes(term.toLowerCase()) ||
          servico.mecanicoNome.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredServicos(filtered);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    filterServicos(value, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterServicos(currentTab, term);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "valor") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleComissaoChange = (value: string) => {
    setFormData(prev => ({ ...prev, comissao: parseInt(value) }));
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      cliente: "",
      telefone: "",
      veiculo: "",
      descricao: "",
      mecanicoId: "",
      valor: 0,
      comissao: 100,
      status: "em_andamento",
    });
    setServicoEmEdicao(null);
  };

  const handleOpenDialog = (servico?: Servico) => {
    if (servico) {
      setServicoEmEdicao(servico);
      setFormData({
        data: servico.data,
        cliente: servico.cliente,
        telefone: servico.telefone,
        veiculo: servico.veiculo,
        descricao: servico.descricao,
        mecanicoId: servico.mecanicoId,
        valor: servico.valor,
        comissao: servico.comissao,
        status: servico.status,
      });
    } else {
      resetForm();
      setServicoEmEdicao(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.cliente || !formData.veiculo || !formData.descricao || !formData.mecanicoId) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const mecanicoSelecionado = mockMecanicos.find(mec => mec.id === formData.mecanicoId);
    if (!mecanicoSelecionado) {
      toast.error("Selecione um mecânico válido.");
      return;
    }
    
    if (servicoEmEdicao) {
      // Editar serviço existente
      const updatedServicos = servicos.map(serv =>
        serv.id === servicoEmEdicao.id
          ? {
              ...formData,
              id: serv.id,
              mecanicoNome: mecanicoSelecionado.nome,
            }
          : serv
      );
      setServicos(updatedServicos);
      filterServicos(currentTab, searchTerm);
      toast.success("Serviço atualizado com sucesso!");
    } else {
      // Adicionar novo serviço
      const newServico: Servico = {
        id: (servicos.length + 1).toString(),
        ...formData,
        mecanicoNome: mecanicoSelecionado.nome,
      };
      const updatedServicos = [...servicos, newServico];
      setServicos(updatedServicos);
      filterServicos(currentTab, searchTerm);
      toast.success("Serviço adicionado com sucesso!");
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleChangeStatus = (id: string, newStatus: StatusServico) => {
    const updatedServicos = servicos.map(serv =>
      serv.id === id ? { ...serv, status: newStatus } : serv
    );
    setServicos(updatedServicos);
    filterServicos(currentTab, searchTerm);
    
    const statusMessages = {
      em_andamento: "Serviço marcado como em andamento",
      concluido: "Serviço marcado como concluído",
      cancelado: "Serviço marcado como cancelado",
    };
    
    toast.success(statusMessages[newStatus]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const updatedServicos = servicos.filter(serv => serv.id !== id);
      setServicos(updatedServicos);
      filterServicos(currentTab, searchTerm);
      toast.success("Serviço excluído com sucesso!");
    }
  };

  const handleThankCustomer = (telefone: string) => {
    // Mensagem personalizada para o WhatsApp
    const mensagem = "Olá!%20A%20Monark%20Motos%20e%20Bicicletaria%20agradece%20sua%20preferência.%20Seu%20serviço%20foi%20realizado%20com%20dedicação%20e%20qualidade.%20Em%20caso%20de%20problemas%20com%20o%20serviço%20ou%20peça,%20guarde%20o%20comprovante%20e%20entre%20em%20contato%20com%20o%20mecânico%20responsável.%20Estamos%20à%20disposição%20para%20garantir%20sua%20satisfação.";
    
    // Formatar o telefone para usar no WhatsApp
    const numeroFormatado = telefone.replace(/\D/g, ""); // Remove caracteres não numéricos
    const whatsappLink = `https://wa.me/55${numeroFormatado}?text=${mensagem}`;
    
    // Abrir o link do WhatsApp em uma nova aba
    window.open(whatsappLink, "_blank");
    toast.success("WhatsApp aberto para agradecimento");
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Serviços</h1>
          {(isAdmin || isUsuario) && (
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          )}
        </div>

        <Tabs defaultValue="todos" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center border-b pb-3">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
              <TabsTrigger value="concluido">Concluídos</TabsTrigger>
              <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
            </TabsList>

            <div className="relative flex items-center ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar serviços..."
                className="pl-10 min-w-[300px]"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    setSearchTerm("");
                    filterServicos(currentTab, "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="todos" className="mt-6">
            <ServicosTable
              servicos={filteredServicos}
              isAdmin={isAdmin || isUsuario}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
              onThankCustomer={handleThankCustomer}
              formatarData={formatarData}
              formatarValor={formatarValor}
            />
          </TabsContent>
          
          <TabsContent value="em_andamento" className="mt-6">
            <ServicosTable
              servicos={filteredServicos}
              isAdmin={isAdmin || isUsuario}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
              onThankCustomer={handleThankCustomer}
              formatarData={formatarData}
              formatarValor={formatarValor}
            />
          </TabsContent>
          
          <TabsContent value="concluido" className="mt-6">
            <ServicosTable
              servicos={filteredServicos}
              isAdmin={isAdmin || isUsuario}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
              onThankCustomer={handleThankCustomer}
              formatarData={formatarData}
              formatarValor={formatarValor}
            />
          </TabsContent>
          
          <TabsContent value="cancelado" className="mt-6">
            <ServicosTable
              servicos={filteredServicos}
              isAdmin={isAdmin || isUsuario}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
              onThankCustomer={handleThankCustomer}
              formatarData={formatarData}
              formatarValor={formatarValor}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {servicoEmEdicao ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do serviço abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mecanicoId">Mecânico</Label>
                  <select
                    id="mecanicoId"
                    name="mecanicoId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.mecanicoId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um mecânico</option>
                    {mockMecanicos.map(mecanico => (
                      <option key={mecanico.id} value={mecanico.id}>
                        {mecanico.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="Ex: 69993059302"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input
                  id="veiculo"
                  name="veiculo"
                  value={formData.veiculo}
                  onChange={handleInputChange}
                  placeholder="Marca, Modelo, Ano"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição do Serviço</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comissao">Comissão</Label>
                  <Select 
                    value={formData.comissao.toString()} 
                    onValueChange={handleComissaoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesComissao.map((opcao) => (
                        <SelectItem key={opcao.valor} value={opcao.valor.toString()}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Componente de tabela de serviços para reutilização
interface ServicosTableProps {
  servicos: Servico[];
  isAdmin: boolean;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: StatusServico) => void;
  onThankCustomer: (telefone: string) => void;
  formatarData: (data: string) => string;
  formatarValor: (valor: number) => string;
}

const ServicosTable = ({
  servicos,
  isAdmin,
  onEdit,
  onDelete,
  onChangeStatus,
  onThankCustomer,
  formatarData,
  formatarValor,
}: ServicosTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Mecânico</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.length > 0 ? (
              servicos.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell>{formatarData(servico.data)}</TableCell>
                  <TableCell className="font-medium">
                    <div>
                      {servico.cliente}
                      {servico.telefone && (
                        <div className="text-xs text-muted-foreground">
                          Tel: {servico.telefone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{servico.veiculo}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={servico.descricao}>
                      {servico.descricao}
                    </div>
                  </TableCell>
                  <TableCell>{servico.mecanicoNome}</TableCell>
                  <TableCell>{formatarValor(servico.valor)}</TableCell>
                  <TableCell>{servico.comissao}%</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        servico.status === "em_andamento"
                          ? "bg-blue-100 text-blue-700"
                          : servico.status === "concluido"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {servico.status === "em_andamento"
                        ? "Em andamento"
                        : servico.status === "concluido"
                        ? "Concluído"
                        : "Cancelado"}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {servico.status !== "concluido" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-green-600"
                            onClick={() => onChangeStatus(servico.id, "concluido")}
                          >
                            Concluir
                          </Button>
                        )}
                        {servico.status === "concluido" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-blue-600"
                            onClick={() => onThankCustomer(servico.telefone)}
                            title="Agradecer ao cliente"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(servico)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onDelete(servico.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 9 : 8} className="text-center py-6">
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Servicos;
