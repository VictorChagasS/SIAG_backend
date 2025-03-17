FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Instalando ts-node globalmente
RUN npm install -g ts-node typescript

# Instalando dependências de produção
RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/src/scripts ./src/scripts

# Gerando o Prisma Client
RUN npx prisma generate

# Executando as migrações
RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["node", "dist/main"] 