
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Sistema de Gestão de Oficina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Bem-vindo ao seu sistema de gerenciamento
          </p>
          <div className="flex justify-center">
            <Button>Iniciar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Index
