# Use an official Redis image as the base image
FROM redis:latest

# Troubleshooting tools
RUN apt-get update && apt-get install -y net-tools && apt-get install -y telnet 

# Copy your custom Redis configuration file into the container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose the Redis server port
EXPOSE 6379

# Start the Redis server with the specified configuration file
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
