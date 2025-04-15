
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2, Search, X, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

// Tipos para vales
type Vale = {
  id: string;
  data: string;
  cliente: string;
  mecanico: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  observacao: string;
};

// Tipos para estoque
type ItemEstoque = {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  estoqueMinimo: number;
};

// Mock de produtos em estoque
const mockEstoque: ItemEstoque[] = [
  { id: "1", nome: "Óleo de Motor 5W30", quantidade: 15, valorUnitario: 35.9, estoqueMinimo: 5 },
  { id: "2", nome: "Filtro de Óleo", quantidade: 12, valorUnitario: 25.5, estoqueMinimo: 4 },
  { id: "3", nome: "Filtro de Ar", quantidade: 8, valorUnitario: 40.0, estoqueMinimo: 3 },
  { id: "4", nome: "Pastilha de Freio", quantidade: 6, valorUnitario: 120.0, estoqueMinimo: 2 },
  { id: "5", nome: "Fluido de Freio DOT4", quantidade: 10, valorUnitario: 28.5, estoqueMinimo: 3 },
  { id: "6", nome: "Vela de Ignição", quantidade: 20, valorUnitario: 18.9, estoqueMinimo: 4 },
];

// Mock de vales
const mockVales: Vale[] = [
  {
    id: "1",
    data: "2025-06-01",
    cliente: "João Silva",
    mecanico: "Carlos Pereira",
    produto: "Óleo de Motor 5W30",
    quantidade: 1,
    valorUnitario: 35.9,
    total: 35.9,
    observacao: "Troca de óleo completa",
  },
  {
    id: "2",
    data: "2025-05-30",
    cliente: "Maria Santos",
    mecanico: "Roberto Silva",
    produto: "Filtro de Óleo",
    quantidade: 1,
    valorUnitario: 25.5,
    total: 25.5,
    observacao: "Para revisão",
  },
  {
    id: "3",
    data: "2025-05-29",
    cliente: "Pedro Oliveira",
    mecanico: "Antônio Santos",
    produto: "Pastilha de Freio",
    quantidade: 2,
    valorUnitario: 120.0,
    total: 240.0,
    observacao: "Dianteira e traseira",
  },
];

const Vales = () => {
  const [vales, setVales] = useState<Vale[]>(mockVales);
  const [estoque, setEstoque] = useState<ItemEstoque[]>(mockEstoque);
  const [filteredVales, setFilteredVales] = useState<Vale[]>(mockVales);
  const [isValeDialogOpen, setIsValeDialogOpen] = useState(false);
  const [isEstoqueDialogOpen, setIsEstoqueDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [valeEmEdicao, setValeEmEdicao] = useState<Vale | null>(null);
  const [itemEstoqueEmEdicao, setItemEstoqueEmEdicao] = useState<ItemEstoque | null>(null);
  const [valeFormData, setValeFormData] = useState<Omit<Vale, "id" | "total">>({
    data: new Date().toISOString().split("T")[0],
    cliente: "",
    mecanico: "",
    produto: "",
    quantidade: 1,
    valorUnitario: 0,
    observacao: "",
  });
  const [estoqueFormData, setEstoqueFormData] = useState<Omit<ItemEstoque, "id">>({
    nome: "",
    quantidade: 0,
    valorUnitario: 0,
    estoqueMinimo: 0,
  });

  const { user } = useAuth();
  const isAdmin = user?.perfil === "admin";
  const isUsuario = user?.perfil === "usuario";
  
  // Calcular o valor total com base na quantidade e valor unitário
  const calcularTotal = (quantidade: number, valorUnitario: number) => {
    return quantidade * valorUnitario;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredVales(vales);
      return;
    }
    
    const filtered = vales.filter(
      vale =>
        vale.cliente.toLowerCase().includes(term.toLowerCase()) ||
        vale.mecanico.toLowerCase().includes(term.toLowerCase()) ||
        vale.produto.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredVales(filtered);
  };

  const handleValeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "produto") {
      const produtoSelecionado = estoque.find(item => item.nome === value);
      if (produtoSelecionado) {
        setValeFormData(prev => ({
          ...prev,
          [name]: value,
          valorUnitario: produtoSelecionado.valorUnitario,
        }));
      } else {
        setValeFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "quantidade" || name === "valorUnitario") {
      setValeFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setValeFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEstoqueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "quantidade" || name === "valorUnitario" || name === "estoqueMinimo") {
      setEstoqueFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setEstoqueFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetValeForm = () => {
    setValeFormData({
      data: new Date().toISOString().split("T")[0],
      cliente: "",
      mecanico: "",
      produto: "",
      quantidade: 1,
      valorUnitario: 0,
      observacao: "",
    });
    setValeEmEdicao(null);
  };

  const resetEstoqueForm = () => {
    setEstoqueFormData({
      nome: "",
      quantidade: 0,
      valorUnitario: 0,
      estoqueMinimo: 0,
    });
    setItemEstoqueEmEdicao(null);
  };

  const handleOpenValeDialog = (vale?: Vale) => {
    if (vale) {
      setValeEmEdicao(vale);
      setValeFormData({
        data: vale.data,
        cliente: vale.cliente,
        mecanico: vale.mecanico,
        produto: vale.produto,
        quantidade: vale.quantidade,
        valorUnitario: vale.valorUnitario,
        observacao: vale.observacao,
      });
    } else {
      resetValeForm();
      setValeEmEdicao(null);
    }
    setIsValeDialogOpen(true);
  };

  const handleOpenEstoqueDialog = (item?: ItemEstoque) => {
    if (item) {
      setItemEstoqueEmEdicao(item);
      setEstoqueFormData({
        nome: item.nome,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        estoqueMinimo: item.estoqueMinimo,
      });
    } else {
      resetEstoqueForm();
      setItemEstoqueEmEdicao(null);
    }
    setIsEstoqueDialogOpen(true);
  };

  const handleSubmitVale = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!valeFormData.cliente || !valeFormData.mecanico || !valeFormData.produto || valeFormData.quantidade <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    // Verificar se o produto existe no estoque
    const produtoEstoque = estoque.find(item => item.nome === valeFormData.produto);
    if (!produtoEstoque) {
      toast.error("Produto não encontrado no estoque.");
      return;
    }
    
    // Verificar quantidade disponível
    if (valeEmEdicao) {
      // Em caso de edição, verificamos a diferença
      const valeAntigo = vales.find(v => v.id === valeEmEdicao.id);
      if (valeAntigo && valeAntigo.produto === valeFormData.produto) {
        const diferenca = valeFormData.quantidade - valeAntigo.quantidade;
        if (diferenca > 0 && diferenca > produtoEstoque.quantidade) {
          toast.error(`Quantidade insuficiente em estoque. Disponível: ${produtoEstoque.quantidade}`);
          return;
        }
      } else if (valeFormData.quantidade > produtoEstoque.quantidade) {
        toast.error(`Quantidade insuficiente em estoque. Disponível: ${produtoEstoque.quantidade}`);
        return;
      }
    } else if (valeFormData.quantidade > produtoEstoque.quantidade) {
      toast.error(`Quantidade insuficiente em estoque. Disponível: ${produtoEstoque.quantidade}`);
      return;
    }
    
    const totalCalculado = calcularTotal(valeFormData.quantidade, valeFormData.valorUnitario);
    
    if (valeEmEdicao) {
      // Editar vale existente
      const updatedVales = vales.map(v => {
        if (v.id === valeEmEdicao.id) {
          return {
            ...valeFormData,
            id: v.id,
            total: totalCalculado,
          };
        }
        return v;
      });
      
      // Atualizar o estoque
      const valeAntigo = vales.find(v => v.id === valeEmEdicao.id);
      if (valeAntigo) {
        let updatedEstoque = [...estoque];
        
        // Se o produto for o mesmo, ajustamos a diferença
        if (valeAntigo.produto === valeFormData.produto) {
          const diferenca = valeFormData.quantidade - valeAntigo.quantidade;
          updatedEstoque = updatedEstoque.map(item => {
            if (item.nome === valeFormData.produto) {
              return {
                ...item,
                quantidade: item.quantidade - diferenca,
              };
            }
            return item;
          });
        } else {
          // Se o produto for diferente, devolvemos o antigo e retiramos o novo
          updatedEstoque = updatedEstoque.map(item => {
            if (item.nome === valeAntigo.produto) {
              return {
                ...item,
                quantidade: item.quantidade + valeAntigo.quantidade,
              };
            }
            if (item.nome === valeFormData.produto) {
              return {
                ...item,
                quantidade: item.quantidade - valeFormData.quantidade,
              };
            }
            return item;
          });
        }
        
        setEstoque(updatedEstoque);
      }
      
      setVales(updatedVales);
      setFilteredVales(
        searchTerm ? updatedVales.filter(v => 
          v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.mecanico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.produto.toLowerCase().includes(searchTerm.toLowerCase())
        ) : updatedVales
      );
      
      toast.success("Vale atualizado com sucesso!");
    } else {
      // Adicionar novo vale
      const newVale: Vale = {
        id: (vales.length + 1).toString(),
        ...valeFormData,
        total: totalCalculado,
      };
      
      const updatedVales = [...vales, newVale];
      
      // Atualizar o estoque
      const updatedEstoque = estoque.map(item => {
        if (item.nome === valeFormData.produto) {
          return {
            ...item,
            quantidade: item.quantidade - valeFormData.quantidade,
          };
        }
        return item;
      });
      
      setEstoque(updatedEstoque);
      setVales(updatedVales);
      setFilteredVales(
        searchTerm ? updatedVales.filter(v => 
          v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.mecanico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.produto.toLowerCase().includes(searchTerm.toLowerCase())
        ) : updatedVales
      );
      
      toast.success("Vale criado com sucesso!");
    }
    
    setIsValeDialogOpen(false);
    resetValeForm();
  };

  const handleSubmitEstoque = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!estoqueFormData.nome || estoqueFormData.valorUnitario <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    if (itemEstoqueEmEdicao) {
      // Editar item existente
      const updatedEstoque = estoque.map(item =>
        item.id === itemEstoqueEmEdicao.id
          ? { ...estoqueFormData, id: item.id }
          : item
      );
      setEstoque(updatedEstoque);
      toast.success("Item de estoque atualizado com sucesso!");
    } else {
      // Adicionar novo item
      const newItem: ItemEstoque = {
        id: (estoque.length + 1).toString(),
        ...estoqueFormData,
      };
      const updatedEstoque = [...estoque, newItem];
      setEstoque(updatedEstoque);
      toast.success("Item de estoque adicionado com sucesso!");
    }
    
    setIsEstoqueDialogOpen(false);
    resetEstoqueForm();
  };

  const handleDeleteVale = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este vale?")) {
      const valeParaExcluir = vales.find(v => v.id === id);
      
      if (valeParaExcluir) {
        // Devolver a quantidade ao estoque
        const updatedEstoque = estoque.map(item => {
          if (item.nome === valeParaExcluir.produto) {
            return {
              ...item,
              quantidade: item.quantidade + valeParaExcluir.quantidade,
            };
          }
          return item;
        });
        
        setEstoque(updatedEstoque);
        
        const updatedVales = vales.filter(v => v.id !== id);
        setVales(updatedVales);
        setFilteredVales(
          searchTerm ? updatedVales.filter(v => 
            v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.mecanico.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.produto.toLowerCase().includes(searchTerm.toLowerCase())
          ) : updatedVales
        );
        
        toast.success("Vale excluído com sucesso!");
      }
    }
  };

  const handleDeleteEstoque = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item do estoque?")) {
      const itemParaExcluir = estoque.find(item => item.id === id);
      
      // Verificar se o item está sendo usado em algum vale
      if (itemParaExcluir && vales.some(v => v.produto === itemParaExcluir.nome)) {
        toast.error("Este item não pode ser excluído pois está sendo usado em vales.");
        return;
      }
      
      const updatedEstoque = estoque.filter(item => item.id !== id);
      setEstoque(updatedEstoque);
      toast.success("Item de estoque excluído com sucesso!");
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

  // Filtra itens com estoque baixo
  const itensComEstoqueBaixo = estoque.filter(
    item => item.quantidade <= item.estoqueMinimo
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestão de Vales e Estoque</h1>
          <div className="space-x-2">
            {(isAdmin || isUsuario) && (
              <>
                <Button onClick={() => handleOpenEstoqueDialog()}>
                  Adicionar Item ao Estoque
                </Button>
                <Button onClick={() => handleOpenValeDialog()}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Vale
                </Button>
              </>
            )}
          </div>
        </div>

        {itensComEstoqueBaixo.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alerta de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {itensComEstoqueBaixo.map(item => (
                  <div key={item.id} className="flex justify-between bg-white p-2 rounded border border-amber-200">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-red-600">
                      Restam apenas {item.quantidade} unidades
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vales */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Vales Emitidos</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar vales..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        setSearchTerm("");
                        setFilteredVales(vales);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Total</TableHead>
                      {(isAdmin || isUsuario) && <TableHead className="w-[100px]">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVales.length > 0 ? (
                      filteredVales.map((vale) => (
                        <TableRow key={vale.id}>
                          <TableCell>{formatarData(vale.data)}</TableCell>
                          <TableCell>{vale.cliente}</TableCell>
                          <TableCell>{vale.produto}</TableCell>
                          <TableCell>{vale.quantidade}</TableCell>
                          <TableCell>{formatarValor(vale.total)}</TableCell>
                          {(isAdmin || isUsuario) && (
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenValeDialog(vale)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteVale(vale.id)}
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
                        <TableCell colSpan={(isAdmin || isUsuario) ? 6 : 5} className="text-center py-6">
                          Nenhum vale encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Estoque */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Estoque de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      {(isAdmin || isUsuario) && <TableHead className="w-[100px]">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoque.length > 0 ? (
                      estoque.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell>
                            <span
                              className={`${
                                item.quantidade <= item.estoqueMinimo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }`}
                            >
                              {item.quantidade} un
                            </span>
                          </TableCell>
                          <TableCell>{formatarValor(item.valorUnitario)}</TableCell>
                          {(isAdmin || isUsuario) && (
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEstoqueDialog(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteEstoque(item.id)}
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
                        <TableCell colSpan={(isAdmin || isUsuario) ? 4 : 3} className="text-center py-6">
                          Nenhum item em estoque.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para Novo Vale */}
      <Dialog open={isValeDialogOpen} onOpenChange={setIsValeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {valeEmEdicao ? "Editar Vale" : "Emitir Novo Vale"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do vale abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitVale}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={valeFormData.data}
                    onChange={handleValeInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mecanico">Mecânico</Label>
                  <Input
                    id="mecanico"
                    name="mecanico"
                    value={valeFormData.mecanico}
                    onChange={handleValeInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  name="cliente"
                  value={valeFormData.cliente}
                  onChange={handleValeInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="produto">Produto</Label>
                <select
                  id="produto"
                  name="produto"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={valeFormData.produto}
                  onChange={handleValeInputChange}
                  required
                >
                  <option value="">Selecione um produto</option>
                  {estoque.map(item => (
                    <option key={item.id} value={item.nome}>
                      {item.nome} - {item.quantidade} un disponíveis
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="1"
                    value={valeFormData.quantidade}
                    onChange={handleValeInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                  <Input
                    id="valorUnitario"
                    name="valorUnitario"
                    type="number"
                    min="0"
                    step="0.01"
                    value={valeFormData.valorUnitario}
                    onChange={handleValeInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total">Valor Total (R$)</Label>
                <Input
                  id="total"
                  value={formatarValor(calcularTotal(valeFormData.quantidade, valeFormData.valorUnitario))}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  name="observacao"
                  rows={2}
                  value={valeFormData.observacao}
                  onChange={handleValeInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsValeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Estoque */}
      <Dialog open={isEstoqueDialogOpen} onOpenChange={setIsEstoqueDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {itemEstoqueEmEdicao ? "Editar Item de Estoque" : "Adicionar Item ao Estoque"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do produto abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEstoque}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={estoqueFormData.nome}
                  onChange={handleEstoqueInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantidade">Quantidade em Estoque</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="0"
                    value={estoqueFormData.quantidade}
                    onChange={handleEstoqueInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    name="estoqueMinimo"
                    type="number"
                    min="0"
                    value={estoqueFormData.estoqueMinimo}
                    onChange={handleEstoqueInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                <Input
                  id="valorUnitario"
                  name="valorUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={estoqueFormData.valorUnitario}
                  onChange={handleEstoqueInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEstoqueDialogOpen(false)}>
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

export default Vales;
