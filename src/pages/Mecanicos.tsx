
import { useState } from "react";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CloudOff, CheckCircle, Plus, RefreshCw, Edit, Trash2, Search, CloudUpload } from "lucide-react";

interface Mecanico {
  id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  email: string;
  observacoes: string;
  createdAt: number;
}

const Mecanicos = () => {
  const { data: mecanicos, loading, isOnline, pendingCount, saveItem, deleteItem, syncData } = useOfflineData<Mecanico>('mecanico');
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | null>(null);
  const [formData, setFormData] = useState<Omit<Mecanico, 'id' | 'createdAt'>>({
    nome: "",
    especialidade: "",
    telefone: "",
    email: "",
    observacoes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredMecanicos = mecanicos.filter(
    m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
         m.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
         m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewMecanico = () => {
    setEditingMecanico(null);
    setFormData({
      nome: "",
      especialidade: "",
      telefone: "",
      email: "",
      observacoes: ""
    });
    setOpen(true);
  };

  const openEditMecanico = (mecanico: Mecanico) => {
    setEditingMecanico(mecanico);
    setFormData({
      nome: mecanico.nome,
      especialidade: mecanico.especialidade,
      telefone: mecanico.telefone,
      email: mecanico.email,
      observacoes: mecanico.observacoes
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const mecanicoData: Mecanico = {
        id: editingMecanico?.id || "",
        ...formData,
        createdAt: editingMecanico?.createdAt || Date.now()
      };
      
      await saveItem(mecanicoData);
      toast.success(
        editingMecanico ? "Mecânico atualizado com sucesso!" : "Mecânico cadastrado com sucesso!"
      );
      
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar mecânico:", error);
      toast.error("Ocorreu um erro ao salvar o mecânico");
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    const confirmMessage = "Escolha como deseja excluir o mecânico:\n\n" +
      "• Clique em OK para excluir permanentemente (será removido do banco de dados)\n" +
      "• Clique em Cancelar para excluir temporariamente (será marcado como excluído mas poderá ser recuperado)";
    
    const permanent = window.confirm(confirmMessage);
    
    if (window.confirm(`Tem certeza que deseja ${permanent ? 'EXCLUIR PERMANENTEMENTE' : 'excluir'} o mecânico ${nome}?`)) {
      try {
        await deleteItem(id, permanent);
        toast.success(`Mecânico ${permanent ? 'excluído permanentemente' : 'excluído'} com sucesso!`);
      } catch (error) {
        console.error("Erro ao excluir mecânico:", error);
        toast.error("Ocorreu um erro ao excluir o mecânico");
      }
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Você está offline. Não é possível sincronizar agora.");
      return;
    }
    
    const result = await syncData();
    if (result.success && result.processed !== undefined) {
      toast.success(`Sincronização concluída! ${result.processed} alterações enviadas.`);
    } else if (result.processed !== undefined && result.processed > 0 && result.failed !== undefined) {
      toast.warning(`Sincronização parcial: ${result.failed} alterações não sincronizadas.`);
    } else {
      toast.error("Falha na sincronização. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Gerenciamento de Mecânicos</h1>
          {!isOnline && (
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-1 text-yellow-800 dark:text-yellow-200">
              <CloudOff className="h-5 w-5" />
            </div>
          )}
          {isOnline && pendingCount > 0 && (
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-1 text-blue-800 dark:text-blue-200">
              <CloudUpload className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar mecânicos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openNewMecanico}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Mecânico
          </Button>
          {pendingCount > 0 && (
            <Button variant="outline" onClick={handleSync} disabled={!isOnline}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto text-primary" />
            <p className="mt-2">Carregando mecânicos...</p>
          </div>
        </div>
      ) : filteredMecanicos.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum mecânico encontrado com esse termo." : "Nenhum mecânico cadastrado. Clique em 'Novo Mecânico' para começar."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMecanicos.map((mecanico) => (
            <Card key={mecanico.id} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{mecanico.nome}</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditMecanico(mecanico)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(mecanico.id, mecanico.nome)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Especialidade: {mecanico.especialidade}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1 text-sm">
                  <div><strong>E-mail:</strong> {mecanico.email}</div>
                  <div><strong>Telefone:</strong> {mecanico.telefone}</div>
                  {mecanico.observacoes && (
                    <div className="mt-2">
                      <strong>Observações:</strong>
                      <p className="text-muted-foreground mt-1">{mecanico.observacoes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 text-xs text-muted-foreground">
                Cadastrado em: {new Date(mecanico.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingMecanico ? "Editar Mecânico" : "Novo Mecânico"}
            </DialogTitle>
            <DialogDescription>
              {editingMecanico 
                ? "Atualize as informações do mecânico abaixo." 
                : "Preencha os dados para cadastrar um novo mecânico."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMecanico ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mecanicos;
