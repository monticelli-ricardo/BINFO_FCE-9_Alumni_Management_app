FROM nginx:latest

# Troubleshooting tools
RUN apt-get update && apt-get install -y net-tools && apt-get install -y telnet 

COPY ./nginx.conf /etc/nginx/nginx.conf
