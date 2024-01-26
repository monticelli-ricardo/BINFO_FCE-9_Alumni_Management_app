# Docker-based Application NGINX - Node.js - Redis

This Docker based application provides an easy example where a NGINX server is used as a proxy to three working nodes of the same Node.js backend, that connects to a single shared Redis DB. The example code is rather trivial, since it only stores a counter value in Redis and presents the current counter value on the welcome webpage <http://localhost:8080/>.

**Note:** The number of nodes is currently defined as 3 in the `docker-compose.yml` and the `nginx.conf` file.
