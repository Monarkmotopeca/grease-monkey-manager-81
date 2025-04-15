
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Users, Receipt, Clock, Calendar } from "lucide-react";

// Mock de dados para o dashboard
const mockData = {
  servicosEmAndamento: 8,
  servicosConcluidos: 42,
  totalMecanicos: 5,
  totalVales: 15,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(mockData);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Atualizar data e hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Olá, {user?.nome}!</h1>
          <p className="text-gray-500 flex items-center mt-1">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(currentDateTime)} 
            <Clock className="ml-4 mr-2 h-4 w-4" />
            {formatTime(currentDateTime)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Serviços em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-3xl font-bold">{data.servicosEmAndamento}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Serviços Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-3xl font-bold">{data.servicosConcluidos}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Mecânicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500 mr-3" />
                <span className="text-3xl font-bold">{data.totalMecanicos}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Vales Emitidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-amber-500 mr-3" />
                <span className="text-3xl font-bold">{data.totalVales}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Recentes</CardTitle>
              <CardDescription>Últimos serviços registrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Troca de Óleo - Ford Ka</p>
                        <p className="text-sm text-gray-500">Cliente: João Silva</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-1">
                          Em andamento
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Iniciado: {i+1}/6/2025</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mecânicos Disponíveis</CardTitle>
              <CardDescription>Status de disponibilidade dos mecânicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nome: "Carlos Pereira", status: "Disponível", servicos: 0 },
                  { nome: "Roberto Silva", status: "Ocupado", servicos: 2 },
                  { nome: "Antônio Santos", status: "Disponível", servicos: 0 },
                  { nome: "José Oliveira", status: "Ocupado", servicos: 3 },
                  { nome: "Paulo Costa", status: "Disponível", servicos: 0 },
                ].map((mecanico, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{mecanico.nome}</p>
                      <p className="text-sm text-gray-500">Serviços ativos: {mecanico.servicos}</p>
                    </div>
                    <span 
                      className={`text-xs rounded-full px-2 py-1 ${
                        mecanico.status === "Disponível" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {mecanico.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
