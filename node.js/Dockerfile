# node.js/Dockerfile

FROM node:latest

WORKDIR /app

COPY package*.json ./app/

RUN npm install | \
    ## Modules and depencencies 
    npm install express && npm install redis && npm install body-parser && npm install uuid | \ 
    ## Install network tools in case of troubleshooting
    apt-get update && apt-get install -y net-tools && apt-get install -y telnet  | \
    npm update

ADD . /app

EXPOSE 8080

CMD ["node", "--trace-warnings", "/app/server.js"]
