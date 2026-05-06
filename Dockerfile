FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./

RUN npm install --production

COPY src ./src
COPY .env.example ./.env.example

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
