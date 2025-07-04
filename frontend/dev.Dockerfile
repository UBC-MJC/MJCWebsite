FROM node:22-alpine

WORKDIR /home/node/frontend
COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
