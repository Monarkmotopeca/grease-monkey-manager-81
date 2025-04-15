
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"

const Login = () => {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")

  const handleLogin = () => {
    if (!usuario || !senha) {
      toast.error("Por favor, preencha todos os campos")
      return
    }
    // Lógica de autenticação será implementada posteriormente
    toast.success("Login realizado com sucesso!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }} className="space-y-4">
            <div>
              <label htmlFor="usuario" className="block mb-2">Usuário</label>
              <Input 
                id="usuario"
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                required
              />
            </div>
            <div>
              <label htmlFor="senha" className="block mb-2">Senha</label>
              <Input 
                id="senha"
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
