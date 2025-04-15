
#!/usr/bin/env python3
import os
import sys
import webbrowser
import socket
import subprocess
import time
import threading
import platform
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request

# Configurações
PORTA = 8080
TITULO = "Sistema de Gestão de Oficina"
MENSAGEM_CARREGANDO = "\n\nIniciando o Sistema de Gestão de Oficina...\n"
MENSAGEM_OFFLINE = "\n[AVISO] Você está offline! O sistema funcionará em modo local.\n"
MENSAGEM_ONLINE = "\n[INFO] Conexão com a internet detectada. O sistema funcionará normalmente.\n"

# Cores para terminal
class Cores:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Limpa a tela do terminal
def limpar_tela():
    os.system('cls' if platform.system() == 'Windows' else 'clear')

# Verifica se o sistema está online
def verificar_conexao():
    try:
        # Tenta se conectar ao Google DNS
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

# Mostra a mensagem de status inicial
def mostrar_status():
    limpar_tela()
    print(f"{Cores.HEADER}{Cores.BOLD}{TITULO}{Cores.ENDC}")
    print(f"{Cores.CYAN}{MENSAGEM_CARREGANDO}{Cores.ENDC}")
    
    if verificar_conexao():
        print(f"{Cores.GREEN}{MENSAGEM_ONLINE}{Cores.ENDC}")
    else:
        print(f"{Cores.WARNING}{MENSAGEM_OFFLINE}{Cores.ENDC}")
        print(f"{Cores.WARNING}As alterações serão salvas localmente e sincronizadas quando a internet for restabelecida.{Cores.ENDC}")

# Classe personalizada para o servidor HTTP
class OficinaPROHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Silencia os logs HTTP para não poluir o console
        pass

# Função para iniciar o servidor Vite em desenvolvimento
def iniciar_vite():
    if verificar_conexao():
        # Tenta instalar as dependências se estiver online
        if platform.system() == 'Windows':
            subprocess.run('npm install --no-audit --no-fund', shell=True)
        else:
            subprocess.run('npm install --no-audit --no-fund', shell=True)
    
    # Inicia o servidor Vite
    vite_cmd = 'npx vite'
    
    if platform.system() == 'Windows':
        process = subprocess.Popen(vite_cmd, shell=True)
    else:
        process = subprocess.Popen(vite_cmd, shell=True)
    
    return process

# Função para iniciar o servidor HTTP estático (produção ou fallback)
def iniciar_servidor_http():
    try:
        # Tenta usar a pasta dist se existir (versão de produção)
        if os.path.exists('dist'):
            os.chdir('dist')
        
        servidor = HTTPServer(('localhost', PORTA), OficinaPROHandler)
        servidor_thread = threading.Thread(target=servidor.serve_forever)
        servidor_thread.daemon = True
        servidor_thread.start()
        
        print(f"{Cores.GREEN}Servidor iniciado em http://localhost:{PORTA}{Cores.ENDC}")
        return servidor
    except Exception as e:
        print(f"{Cores.FAIL}Erro ao iniciar servidor HTTP: {e}{Cores.ENDC}")
        return None

# Função para abrir o navegador
def abrir_navegador():
    # Dá um tempo para o servidor iniciar
    time.sleep(2)
    webbrowser.open(f'http://localhost:{PORTA}')

# Função para monitorar mudanças no status de conexão
def monitorar_conexao():
    status_anterior = verificar_conexao()
    
    while True:
        status_atual = verificar_conexao()
        
        if status_atual != status_anterior:
            if status_atual:
                print(f"{Cores.GREEN}\n[INFO] Conexão com a internet restabelecida! Sincronizando dados...{Cores.ENDC}")
            else:
                print(f"{Cores.WARNING}\n[AVISO] Conexão com a internet perdida! Mudando para modo offline...{Cores.ENDC}")
            
            status_anterior = status_atual
        
        time.sleep(10)  # Verifica a cada 10 segundos

# Função principal
def main():
    mostrar_status()
    
    # Inicia thread para monitorar a conexão
    conexao_thread = threading.Thread(target=monitorar_conexao)
    conexao_thread.daemon = True
    conexao_thread.start()
    
    # Inicia o servidor Vite em desenvolvimento
    processo_vite = iniciar_vite()
    
    # Abre o navegador após um breve intervalo
    threading.Thread(target=abrir_navegador).start()
    
    try:
        # Mantém o script em execução
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"{Cores.CYAN}\nEncerrando o Sistema de Gestão de Oficina...{Cores.ENDC}")
        if processo_vite:
            if platform.system() == 'Windows':
                subprocess.run(f'taskkill /F /PID {processo_vite.pid}', shell=True)
            else:
                processo_vite.terminate()

if __name__ == "__main__":
    main()
