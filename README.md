# UBC Mahjong Club Website

### Development Setup

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [npm](https://www.npmjs.com/get-npm)
3. Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/)
6. Clone the repository
7. Create a dotenv file in the backend directory and format it as follows:

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

8. Run `npm install` in both the frontend and backend directory
9. Run `npm start` in both the frontend and backend directory
10. Open [http://localhost:4000](http://localhost:4000) to view the website
