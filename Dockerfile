FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Compilar a aplicação
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Instalar apenas as dependências de produção
RUN npm ci --only=production

# Copiar o código compilado, o Prisma schema e os scripts
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY src/scripts ./src/scripts
# Copiar arquivos estáticos necessários
COPY src/shared ./src/shared
COPY entrypoint.sh ./entrypoint.sh

# Gerar o Prisma Client novamente no ambiente de produção
RUN npx prisma generate

# Tornar o script de entrypoint executável
RUN chmod +x ./entrypoint.sh

# Expor a porta que a aplicação usa
EXPOSE 3000

# Definir o entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Iniciar a aplicação
CMD ["node", "dist/main"] 