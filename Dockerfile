FROM node:18 AS ui-build
WORKDIR /usr/src/frontend
COPY frontend/package*.json .
COPY frontend/tsconfig.json .
RUN npm install
COPY frontend .
RUN npm run build

FROM node:18 AS server-build
WORKDIR /root
COPY backend/package*.json .
COPY backend/tsconfig.json .
COPY backend/prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY --from=ui-build /usr/src/frontend/build ./build
COPY backend .

EXPOSE 80
EXPOSE 443

CMD ["npm", "run", "start"]
