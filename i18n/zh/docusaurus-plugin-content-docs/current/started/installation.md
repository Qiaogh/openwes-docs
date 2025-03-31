---
id: installation
title: 安装
sidebar_position: 2
---

# OpenWes 安装指南

按照以下步骤在您的系统上安装并设置 **OpenWes**。OpenWes 设计为易于部署，无论您是在本地开发环境中运行，还是在云环境中用于生产。

## 前提条件

*   [Java](https://www.java.com/) (17+): 用于运行后端服务器应用程序。

*   [MySQL](https://www.mysql.com/) (8.0+): 用作关系型数据库，用于存储仓库数据。

*   [Nacos](https://nacos.io/) (2.0+): 服务注册和配置管理工具。

*   [Redis](https://redis.io/) (7.0+): 用于缓存和会话管理。

*   [Node.js](https://nodejs.org/)(18+): 用于运行客户端应用程序。

> MySQL、Nacos 和 Redis 应安装在同一台机器上。 您可以使用 [docker-compose 文件](../../static/docker/docker-compose.yml) 通过 docker-compose 安装所有中间件（如 MySQL、Nacos 和 Redis）。

## 步骤

### 1\. 克隆代码仓库：

```
git clone https://github.com/jingsewu/open-wes.git
```

### 2\. 设置后端服务器

**2.1 加载 Nacos 配置**
执行脚本将 Nacos 配置加载到 MySQL 数据库中：

```
mysql -u root -p nacos_config < server/script/nacos_config.sql
```

**2.2 配置主机名**

编辑系统的 **hosts** 文件，将 Nacos 主机名（`nacos.openwes.com`）映射到 `127.0.0.1`：

*   Linux: /etc/hosts

*   Windows: C:\Windows\System32\drivers\etc\hosts
    在文件中添加以下行：

```
172.0.0.1 nacos.openwes.com
```

**2.3 创建 OpenWes 数据库** 登录 MySQL 并创建 openwes 数据库：

```
  create database openwes;
```

**2.4 启动后端服务器** 进入 server/server 目录并启动后端服务器：

*   WesApplication

*   GatewayApplication

*   StationApplication  
您可以使用 IDE（如 IntelliJ 或 Eclipse）或以下命令：

```
java -jar WesApplication.jar
java -jar GatewayApplication.jar
java -jar StationApplication.jar
```

### 3\. 设置客户端

**3.1 更新 Webpack 配置** 重命名开发环境的 Webpack 配置文件：

```
mv client/build/webpack.config.example.dev.js client/build/webpack.config.dev.js
```

**3.2 安装客户端依赖** 进入客户端目录并安装所需依赖：

```
cd client
npm install
```

**3.3 启动客户端** 运行客户端应用程序：

```
npm start
```

客户端默认将在 [http://localhost:4001](http://localhost:4001/) 上运行。

### 故障排除

如果在安装过程中遇到任何问题，请检查以下内容：

*   缺少依赖项：确保所有必需的软件（Java、MySQL、Nacos、Redis、Node.js）已正确安装和配置。

*   主机文件问题：确保 nacos.openwes.com 指向正确的 IP 地址（127.0.0.1）。

*   数据库问题：确保在 MySQL 中成功创建了 openwes 数据库。
    
如需进一步帮助，请咨询 [OpenWes 社区](https://github.com/jingsewu/open-wes/issues) 或在 GitHub 仓库中创建问题。
