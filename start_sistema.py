
import subprocess
import webbrowser
import os
import time
import sys
import platform

def clear_screen():
    """Limpa a tela do console baseado no sistema operacional."""
    if platform.system() == "Windows":
        os.system('cls')
    else:
        os.system('clear')

def print_header():
    """Exibe o cabeçalho do sistema."""
    clear_screen()
    print("="*60)
    print("      SISTEMA DE GESTÃO DE OFICINA - INICIANDO SERVIDOR      ")
    print("="*60)
    print("\nPor favor, aguarde enquanto o sistema está sendo carregado...\n")

def check_requirements():
    """Verifica se Node.js está instalado."""
    try:
        subprocess.run(["node", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False

def main():
    """Função principal que inicia o servidor web."""
    print_header()
    
    # Verifica se Node.js está instalado
    if not check_requirements():
        print("ERRO: Node.js não foi encontrado no sistema.")
        print("Por favor, instale o Node.js antes de continuar.")
        print("Download: https://nodejs.org/")
        input("\nPressione Enter para sair...")
        sys.exit(1)
    
    # Diretório do script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Verifica se as dependências estão instaladas
    if not os.path.isdir("node_modules"):
        print("Instalando dependências do projeto...")
        subprocess.run(["npm", "install"], check=True)
        print("Dependências instaladas com sucesso!")
    
    # Inicia o servidor de desenvolvimento
    print("Iniciando o servidor web...")
    server_process = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Espera o servidor iniciar (procurando por uma mensagem específica na saída)
    url = None
    for line in iter(server_process.stdout.readline, ''):
        print(line.strip())
        if "Local:" in line:
            url = line.split("Local:")[1].strip()
            break
    
    if not url:
        # URL padrão caso não seja encontrada na saída
        url = "http://localhost:8080"
    
    print(f"\nServidor iniciado com sucesso!")
    print(f"Abrindo o sistema no navegador: {url}")
    
    # Espera um pouco antes de abrir o navegador
    time.sleep(2)
    webbrowser.open(url)
    
    print("\nO sistema está rodando. Para encerrar, feche esta janela ou pressione Ctrl+C")
    
    try:
        # Mantém o script em execução
        server_process.wait()
    except KeyboardInterrupt:
        print("\nEncerrando o servidor...")
        server_process.terminate()
        print("Servidor encerrado com sucesso!")

if __name__ == "__main__":
    main()
