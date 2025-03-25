FROM node:22.14.0

WORKDIR /data/app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "./bin/www"]