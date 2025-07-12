FROM node:22-alpine AS ui-build
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
COPY backend/certificate ./certificate
RUN npm install
RUN npx prisma generate
COPY --from=ui-build /usr/src/frontend/dist ./dist
COPY backend .

EXPOSE 80
EXPOSE 443

CMD ["npm", "run", "start"]
