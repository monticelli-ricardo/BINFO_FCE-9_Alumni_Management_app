# node.js/Dockerfile

FROM node:14

WORKDIR /app

COPY package*.json ./app/

RUN npm install | \
    npm install express && npm install redis && npm install body-parser | \
    npm update

ADD . /app

EXPOSE 8080

CMD ["node", "--trace-warnings", "/app/server.js"]
