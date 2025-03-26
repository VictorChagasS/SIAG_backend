#!/bin/sh
set -e

# Gera o Prisma Client
npx prisma generate

# Executa as migrações do banco de dados
npx prisma migrate deploy

# Inicia a aplicação
exec "$@" 