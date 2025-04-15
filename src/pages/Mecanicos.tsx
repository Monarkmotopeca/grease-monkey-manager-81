
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Tipo para mecânicos
type Mecanico = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  especialidade: string;
  dataContratacao: string;
  status: "ativo" | "inativo";
};

// Mock de dados iniciais
const mockMecanicos: Mecanico[] = [
  {
    id: "1",
    nome: "Carlos Pereira",
    cpf: "123.456.789-00",
    telefone: "(11) 91234-5678",
    especialidade: "Motores",
    dataContratacao: "2023-01-15",
    status: "ativo",
  },
  {
    id: "2",
    nome: "Roberto Silva",
    cpf: "987.654.321-00",
    telefone: "(11) 98765-4321",
    especialidade: "Elétrica",
    dataContratacao: "2022-05-20",
    status: "ativo",
  },
  {
    id: "3",
    nome: "Antônio Santos",
    cpf: "456.789.123-00",
    telefone: "(11) 95555-5555",
    especialidade: "Suspensão",
    dataContratacao: "2023-08-10",
    status: "ativo",
  },
  {
    id: "4",
    nome: "José Oliveira",
    cpf: "789.123.456-00",
    telefone: "(11) 96666-6666",
    especialidade: "Freios",
    dataContratacao: "2021-03-05",
    status: "ativo",
  },
  {
    id: "5",
    nome: "Paulo Costa",
    cpf: "321.654.987-00",
    telefone: "(11) 97777-7777",
    especialidade: "Transmissão",
    dataContratacao: "2022-11-30",
    status: "ativo",
  },
];

const Mecanicos = () => {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>(mockMecanicos);
  const [filteredMecanicos, setFilteredMecanicos] = useState<Mecanico[]>(mockMecanicos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mecanicoEmEdicao, setMecanicoEmEdicao] = useState<Mecanico | null>(null);
  const [formData, setFormData] = useState<Omit<Mecanico, "id">>({
    nome: "",
    cpf: "",
    telefone: "",
    especialidade: "",
    dataContratacao: new Date().toISOString().split("T")[0],
    status: "ativo",
  });

  const { user } = useAuth();
  const isAdmin = user?.perfil === "admin";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredMecanicos(mecanicos);
      return;
    }
    
    const filtered = mecanicos.filter(
      mecanico =>
        mecanico.nome.toLowerCase().includes(term.toLowerCase()) ||
        mecanico.cpf.includes(term) ||
        mecanico.especialidade.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredMecanicos(filtered);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      telefone: "",
      especialidade: "",
      dataContratacao: new Date().toISOString().split("T")[0],
      status: "ativo",
    });
    setMecanicoEmEdicao(null);
  };

  const handleOpenDialog = (mecanico?: Mecanico) => {
    if (mecanico) {
      setMecanicoEmEdicao(mecanico);
      setFormData({
        nome: mecanico.nome,
        cpf: mecanico.cpf,
        telefone: mecanico.telefone,
        especialidade: mecanico.especialidade,
        dataContratacao: mecanico.dataContratacao,
        status: mecanico.status,
      });
    } else {
      resetForm();
      setMecanicoEmEdicao(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.cpf || !formData.telefone || !formData.especialidade) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    if (mecanicoEmEdicao) {
      // Editar mecânico existente
      const updatedMecanicos = mecanicos.map(mec =>
        mec.id === mecanicoEmEdicao.id ? { ...formData, id: mec.id } : mec
      );
      setMecanicos(updatedMecanicos);
      setFilteredMecanicos(updatedMecanicos);
      toast.success("Mecânico atualizado com sucesso!");
    } else {
      // Adicionar novo mecânico
      const newMecanico: Mecanico = {
        id: (mecanicos.length + 1).toString(),
        ...formData,
      };
      const updatedMecanicos = [...mecanicos, newMecanico];
      setMecanicos(updatedMecanicos);
      setFilteredMecanicos(updatedMecanicos);
      toast.success("Mecânico adicionado com sucesso!");
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este mecânico?")) {
      const updatedMecanicos = mecanicos.filter(mec => mec.id !== id);
      setMecanicos(updatedMecanicos);
      setFilteredMecanicos(updatedMecanicos);
      toast.success("Mecânico excluído com sucesso!");
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mecânicos</h1>
          {isAdmin && (
            <Button onClick={() => handleOpenDialog()}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Mecânico
            </Button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF ou especialidade..."
                className="pl-10"
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
                    setFilteredMecanicos(mecanicos);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Data Contratação</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMecanicos.length > 0 ? (
                  filteredMecanicos.map((mecanico) => (
                    <TableRow key={mecanico.id}>
                      <TableCell className="font-medium">{mecanico.nome}</TableCell>
                      <TableCell>{mecanico.cpf}</TableCell>
                      <TableCell>{mecanico.telefone}</TableCell>
                      <TableCell>{mecanico.especialidade}</TableCell>
                      <TableCell>{formatarData(mecanico.dataContratacao)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            mecanico.status === "ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mecanico.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(mecanico)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(mecanico.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-6">
                      Nenhum mecânico encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mecanicoEmEdicao ? "Editar Mecânico" : "Adicionar Mecânico"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do mecânico abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
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
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dataContratacao">Data de Contratação</Label>
                  <Input
                    id="dataContratacao"
                    name="dataContratacao"
                    type="date"
                    value={formData.dataContratacao}
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
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        status: e.target.value as "ativo" | "inativo" 
                      }))
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
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

export default Mecanicos;
