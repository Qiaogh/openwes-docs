---
id: installation
title: Installation
sidebar_position: 2
---

# OpenWes Installation Guide

Follow these steps to install and set up **OpenWes** on your system. OpenWes is designed to be easy to deploy, whether you're running it locally for development or in a cloud environment for production.

## Prerequisites

- [Java](https://www.java.com/) (17+): For running the backend server applications.
- [MySQL](https://www.mysql.com/) (8.0+): Used as the relational database for storing warehouse data.
- [Nacos](https://nacos.io/) (2.0+): A service registry and configuration management tool.
- [Redis](https://redis.io/) (7.0+): Used for caching and session management.
- [Node.js](https://nodejs.org/)(18+): For running the client application.

> Mysql, Nacos and Redis should be installed on the same machine.
> You can use [docker-compose file](/docker/docker-compose.yml) to install all the middlewares like mysql, nacos and redis with docker-compose.
## Steps

### 1. Clone the repository:
   ```bash
   git clone https://github.com/jingsewu/open-wes.git
   ```
### 2. Set Up the Backend Servers

**2.1 Add Nacos Configuration**  

You can find these scripts from the ```initdb.d``` directory in the root directory

Execute the script to load the Nacos configuration into the MySQL database:

```sql
mysql -u root -p nacos_config < nacos_config.sql
```
**2.2: Configure the Hostname**

Edit your system’s **hosts** file to map the Nacos hostname (```nacos.openwes.com```) to ```127.0.0.1```:

* Linux: /etc/hosts
* Windows: C:\Windows\System32\drivers\etc\hosts  
Add the following line to the file:

```127.0.0.1 nacos.openwes.com```

**2.3: Create the OpenWes Database**
Log into MySQL and create the openwes database:

  ```sql
    create database openwes;
  ```
**2.4: Start the Backend Servers**
Navigate to the server/server directory and start the backend servers:

* WesApplication
* GatewayApplication
* StationApplication
  You can use an IDE (like IntelliJ or Eclipse) or the following command:

```java
java -jar WesApplication.jar
java -jar GatewayApplication.jar
java -jar StationApplication.jar
```

### 3. Set Up the Client

**3.1: Update Webpack Configuration**
Rename the Webpack configuration file for development:
```bash
mv client/build/webpack.config.example.dev.js client/build/webpack.config.dev.js
```
**3.2: Install Dependencies for the Client**
Navigate to the client directory and install the required dependencies:
```npm
cd client
npm install
```
**3.3: Start the Client**
Run the client application:
```npm
npm start
```
The client will be available on http://localhost:4000 by default.

Troubleshooting
If you encounter any issues during the installation, check the following:

* Missing dependencies: Ensure that all required software (Java, MySQL, Nacos, Redis, Node.js) is installed and configured correctly.
* Host file issues: Make sure that nacos.openwes.com points to the correct IP address (127.0.0.1).
* Database issues: Ensure that the openwes database was created successfully in MySQL.  
For further assistance, consult the [OpenWes Community](https://github.com/jingsewu/open-wes/issues) or create an issue in the GitHub repository.
