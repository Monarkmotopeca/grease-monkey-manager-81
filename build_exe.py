
import PyInstaller.__main__
import os
import platform

# Configurações do executável
app_name = "sistema_oficina"
icon_file = None  # Adicione o caminho para um ícone .ico se desejar

# Adiciona extensão .exe no Windows
if platform.system() == "Windows":
    app_name += ".exe"

# Argumentos para o PyInstaller
args = [
    "start_sistema.py",  # Script principal
    "--onefile",  # Criar um único arquivo executável
    "--console",  # Mostra console (útil para ver erros)
    f"--name={app_name}",  # Nome do executável
]

# Adiciona ícone se fornecido
if icon_file and os.path.exists(icon_file):
    args.append(f"--icon={icon_file}")

# Executa o PyInstaller com os argumentos
PyInstaller.__main__.run(args)

print(f"\nExecutável '{app_name}' criado com sucesso!")
print("Você pode encontrá-lo na pasta 'dist'")
