# Use an official Redis image as the base image
FROM redis:latest

# Download and install the Redis modules and tools
RUN wget -O /tmp/redis-search.zip https://github.com/RediSearch/RediSearch/releases/download/v2.6.0/redisearch-module-linux-x86_64-2.6.0.zip && \
    unzip /tmp/redis-search.zip -d /usr/local/bin/ && \
    rm /tmp/redis-search.zip
RUN apt-get update && apt-get install -y net-tools && apt-get install -y telnet 

# Copy the custom Redis configuration file into the container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose the Redis server port
EXPOSE 6379

# Start the Redis server with the specified configuration file
CMD ["redis-server", "/usr/local/etc/redis/redis.conf", "--loadmodule", "/usr/local/bin/redisearch.so"]
