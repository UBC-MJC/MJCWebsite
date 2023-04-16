# UBC Mahjong Club Website

### Development Setup

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [npm](https://www.npmjs.com/get-npm)
3. Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/)
4. Clone the repository
5. Create a .env file in the backend directory and format it as follows:

```bash
PORT=4000

DATABASE_DIALECT="mysql"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_NAME="mahjong"
DATABASE_USER="mahjonguser"
DATABASE_PASSWORD={PASSWORD}

DATABASE_URL="mysql://mahjonguser:{PASSWORD}@localhost:3306/mahjong?schema=public"

ACCESS_TOKEN_SECRET={SECRET}
```

Replace all instances of `{PASSWORD}` with any string and `{SECRET}` with some random 32 character long string.

6. Run `docker-compose up` in the backend directory. This will create a MySQL database with the name `mahjong` 
and a user with the name `mahjonguser` and the password you specified in the dotenv file. Warning: Closing this terminal might not
stop the docker instance. Run `docker-compose down` or stop Docker Desktop to close the database.
7. Run `npx prisma db push` and `npx prisma generate` in the backend directory
8. Run `npm install` in both the frontend and backend directory
9. Run `npm start` in both the frontend and backend directory 
10. Open [http://localhost:4000](http://localhost:4000) to view the website
