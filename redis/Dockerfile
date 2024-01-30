# Use an official Redis image as the base image
FROM redis/redis-stack:latest

# Copy the custom Redis configuration file into the container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Download and install the Redis modules and tools
RUN apt-get update && apt-get install -y net-tools && apt-get install -y telnet

# Expose the Redis server port
EXPOSE 6379

# Start the Redis server with the specified configuration file
CMD ["redis-server", " /usr/local/etc/redis/redis.conf" , "--loadmodule", "/opt/redis-stack/lib/redisearch.so"]
