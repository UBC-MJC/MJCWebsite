# UBC Mahjong Club Website

### [Development Guide](https://docs.google.com/document/d/1FmSUD-EqHhf2XEkG1CkzElLQ91N8OO2Ojf6pMJxwn-s/edit?usp=sharing)

### Development Setup

#### Developing on Windows - Windows Subsystem for Linux

You’ll want Docker and a working Linux installation (Ubuntu in most cases) to access the database. 

First install Windows Subsystem for Linux [here](https://learn.microsoft.com/en-us/windows/wsl/install#windows-10-fall-creators-update-and-later-install-from-the-microsoft-store) (It’s recommended to use WSL2)

This is now easily done by entering into a terminal `wsl --install`. The latest version of Ubuntu will also be installed (currently version 22.04.1)

After installing wsl, follow [this guide](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl) to complete installation
of npm, Node.js and so on. 

#### Normal Steps

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [npm](https://www.npmjs.com/get-npm)
3. Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/). If Docker is not 
   working after installing, check the hardware compatibility and make sure Virtualization is enabled 
   in Firmware (may require dockerBIOS setting, be careful). The key services to check are Docker Engine and Docker Compose.
4. Clone the repository
5. Create a .env file in the backend directory and format it as follows:

```bash
NODE_ENV="development"

PORT=4000

DATABASE_DIALECT="mysql"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_NAME="mahjong"
DATABASE_USER="mahjonguser"
DATABASE_PASSWORD="{PASSWORD}"

DATABASE_URL="mysql://mahjonguser:{PASSWORD}@db:3306/mahjong?schema=public"

ACCESS_TOKEN_SECRET="{SECRET}"
```

Replace all instances of `{PASSWORD}` with any string and replace `{SECRET}` with some random 32 character long string. Don't forget the quotation marks.

6. Install some version of `cmake` (Should be bundled in with some basic stuff)
7. Run `make build` in the backend directory. This will create docker images for all the services being used. Run `make up` to start live development, with all changes being immediately updated. Run `make down` or stop Docker Desktop to close ths services.
The command `make build` is only needed once, unless the Dockerfiles are changed or `node_modules` is updated (meaning if anything is npm installed).
8. If it is the first time running the website, you need to create the database tables. To do so, run `npx prisma db push` in the backend directory. 
9. Open [http://localhost:4000](http://localhost:4000) to view the website. 
10. To get admin permissions, first register with any account. Then install a command line mysql client and run `mysql -u root -p -h 127.0.0.1`, entering the password you specified in the dotenv file. Then run `UPDATE Player SET Admin = 1 WHERE id = {YOUR ID};` where `{YOUR ID}` is the id of the user you want to give admin permissions to.

### Docker shenanigans

Due to Docker being slightly janky, there might be instances where accessing the database would be glitchy. 
The following steps may be tried in sequence to potentially fix the problem.

1. Restart every running service/database
2. Switch back to origin/main
3. Restart Docker Engine
4. Run `docker system prune` on Ubuntu
5. Restart the machine
6. Revert Docker to original setting
7. Reinstall Docker
8. Reclone the repository
9. Reinstall npm/Node.js
10. Cry for help
