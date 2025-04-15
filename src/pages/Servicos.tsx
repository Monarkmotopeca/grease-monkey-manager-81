
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Search, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Tipos para serviços
type StatusServico = "em_andamento" | "concluido" | "cancelado";

type Servico = {
  id: string;
  data: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  mecanicoId: string;
  mecanicoNome: string;
  valor: number;
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

// Mock de serviços
const mockServicos: Servico[] = [
  {
    id: "1",
    data: "2025-06-01",
    cliente: "João Silva",
    veiculo: "Ford Ka 2018",
    descricao: "Troca de óleo e filtros",
    mecanicoId: "1",
    mecanicoNome: "Carlos Pereira",
    valor: 250.0,
    status: "em_andamento",
  },
  {
    id: "2",
    data: "2025-05-29",
    cliente: "Maria Santos",
    veiculo: "Honda Fit 2020",
    descricao: "Revisão completa",
    mecanicoId: "2",
    mecanicoNome: "Roberto Silva",
    valor: 450.0,
    status: "em_andamento",
  },
  {
    id: "3",
    data: "2025-05-28",
    cliente: "Pedro Oliveira",
    veiculo: "Fiat Uno 2015",
    descricao: "Troca de pastilhas de freio",
    mecanicoId: "3",
    mecanicoNome: "Antônio Santos",
    valor: 180.0,
    status: "concluido",
  },
  {
    id: "4",
    data: "2025-05-27",
    cliente: "Ana Rodrigues",
    veiculo: "Toyota Corolla 2021",
    descricao: "Alinhamento e balanceamento",
    mecanicoId: "4",
    mecanicoNome: "José Oliveira",
    valor: 200.0,
    status: "concluido",
  },
  {
    id: "5",
    data: "2025-05-26",
    cliente: "Carlos Mendes",
    veiculo: "Volkswagen Gol 2019",
    descricao: "Reparo no sistema elétrico",
    mecanicoId: "5",
    mecanicoNome: "Paulo Costa",
    valor: 320.0,
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
    veiculo: "",
    descricao: "",
    mecanicoId: "",
    valor: 0,
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

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split("T")[0],
      cliente: "",
      veiculo: "",
      descricao: "",
      mecanicoId: "",
      valor: 0,
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
        veiculo: servico.veiculo,
        descricao: servico.descricao,
        mecanicoId: servico.mecanicoId,
        valor: servico.valor,
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
              <div className="grid grid-cols-2 gap-4">
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
  formatarData: (data: string) => string;
  formatarValor: (valor: number) => string;
}

const ServicosTable = ({
  servicos,
  isAdmin,
  onEdit,
  onDelete,
  onChangeStatus,
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
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.length > 0 ? (
              servicos.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell>{formatarData(servico.data)}</TableCell>
                  <TableCell className="font-medium">{servico.cliente}</TableCell>
                  <TableCell>{servico.veiculo}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={servico.descricao}>
                      {servico.descricao}
                    </div>
                  </TableCell>
                  <TableCell>{servico.mecanicoNome}</TableCell>
                  <TableCell>{formatarValor(servico.valor)}</TableCell>
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
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-6">
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
