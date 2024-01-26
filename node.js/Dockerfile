# node.js/Dockerfile

FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the application code
COPY . .

EXPOSE 8081

CMD ["node", "Alumni_Management_App/server/server.js"]
