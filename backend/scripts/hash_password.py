r"""
Gera o hash bcrypt de uma senha, para colar em backend/.env.

Resolve o problema de "ovo e galinha" do login de Master: é preciso ter um
hash em MASTER_PASSWORD_HASH antes de existir qualquer tela para gerá-lo.

Uso:
  cd backend
  ..\.venv\Scripts\python.exe scripts\hash_password.py
"""
import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import bcrypt


def main():
    senha = getpass.getpass("Digite a senha a ser transformada em hash: ")
    if not senha:
        raise SystemExit("Senha vazia. Cancelado.")
    confirmacao = getpass.getpass("Confirme a senha: ")
    if senha != confirmacao:
        raise SystemExit("As senhas não coincidem. Cancelado.")

    hash_bytes = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt())
    print("\nHash gerado (cole em backend/.env, ex: MASTER_PASSWORD_HASH=<hash>):\n")
    print(hash_bytes.decode("utf-8"))


if __name__ == "__main__":
    main()
