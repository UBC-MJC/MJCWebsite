FROM node:18

WORKDIR /home/node/frontend
COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
