---
title: '基于Spring Cloud Gateway + RBAC的用户管理系统：权限认证与全局校验'
author: 'Kinser'
author_title: 'Software Engineer'
tags: [Authentication, RBAC, GlobalValidation, SpringCloudGateway ]
date: '2025-02-26'
permalink: '/blog/Permission-Authentication-and-Global-Validation'
---

### 引言

在现代微服务架构中，用户管理系统是核心组件之一，负责用户的身份认证和权限管理。随着系统规模的扩大，如何高效地管理用户权限、确保系统的安全性成为了一个重要挑战。基于Spring Cloud Gateway和RBAC（Role-Based Access Control，基于角色的访问控制）的用户管理系统，能够有效地解决这一问题。本文将介绍如何利用Spring Cloud Gateway实现权限认证与全局校验，并结合RBAC模型构建一个安全的用户管理系统。

### 1. Spring Cloud Gateway简介

Spring Cloud Gateway是Spring Cloud生态系统中的一个API网关，旨在为微服务架构提供简单、有效的方式来路由请求、进行权限认证、负载均衡等。它基于Spring 6、Spring Boot 3构建，支持异步非阻塞的请求处理，适合高并发的场景。

Spring Cloud Gateway的核心功能包括：
- **路由**：根据请求的路径、方法、头信息等将请求路由到不同的微服务。
- **过滤器**：在请求到达目标服务之前或之后执行一些逻辑，如权限校验、请求日志记录等。
- **负载均衡**：通过与Spring Cloud LoadBalancer集成，实现请求的负载均衡。
- **熔断器**：通过与Spring Cloud CircuitBreaker集成，提供服务的熔断和降级功能。

### 2. RBAC（基于角色的访问控制）模型

RBAC（Role-Based Access Control）是一种常见的权限管理模型，它将权限与角色关联，用户通过分配角色来获得相应的权限。RBAC模型的核心概念包括：
- **用户（User）**：系统的使用者，可以是个人或应用程序。
- **角色（Role）**：一组权限的集合，用户通过分配角色来获得权限。
- **权限（Permission）**：系统中对资源的操作权限，如“读取”、“写入”、“删除”等。

RBAC模型的优势在于：
- **灵活性**：通过角色的分配和回收，可以灵活地管理用户的权限。
- **可维护性**：权限的管理集中在角色上，减少了直接对用户进行权限管理的复杂性。
- **安全性**：通过角色的层级关系和权限的继承，可以更好地控制系统的安全性。

### 3. 基于Spring Cloud Gateway的权限认证与全局校验

在微服务架构中，API网关是系统的入口，所有的外部请求都会经过网关。因此，将权限认证和全局校验的逻辑放在网关层是非常合适的。Spring Cloud Gateway提供了强大的过滤器机制，可以在请求到达目标服务之前进行权限校验。

#### 3.1 权限认证流程

1. **用户登录**：用户通过登录接口提交用户名和密码，系统验证用户身份后生成JWT（JSON Web Token）并返回给客户端。
2. **请求携带Token**：客户端在后续请求中携带JWT，通常放在请求头的`Authorization`字段中。
3. **网关校验Token**：Spring Cloud Gateway在接收到请求后，首先通过自定义的全局过滤器校验JWT的有效性。如果Token无效或过期，网关直接返回401 Unauthorized错误。
4. **权限校验**：在Token校验通过后，网关根据用户的角色和请求的路径，判断用户是否有权限访问该资源。如果没有权限，返回403 Forbidden错误。
5. **路由到目标服务**：如果权限校验通过，网关将请求路由到目标微服务。

#### 3.2 全局校验的实现

Spring Cloud Gateway的全局校验可以通过自定义`GlobalFilter`来实现。以下是一个简单的全局校验过滤器示例：

```java
public class GlobalGatewayFilter implements GlobalFilter, Ordered {

    private final AuthProperties authProperties;
    private final JwtUtils jwtUtils;
    private final RedisUtils redisUtils;
...
    /**
     * Token过滤器
     *
     * @param exchange exchange
     * @param chain    chain
     * @return Mono
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
...
        String token = getToken(request);
...
        DecodedJWT jwt;
        try {
            jwt = jwtUtils.verifyJwt(token);
        } catch (TokenExpiredException e) {
            return unauthorized(requestUrl, exchange.getResponse(), "token is expired.");
        } catch (JWTVerificationException e) {
            return unauthorized(requestUrl, exchange.getResponse(), "token verification failed.");
        }
        if (jwt == null) {
            return unauthorized(requestUrl, exchange.getResponse(), "token is not illegal.");
        }
...
        if (!verifyAuthorization(jwt, requestUrl, request.getMethod())) {
            return unauthorized(requestUrl, exchange.getResponse(), "request access denied, may be unauthorized.");
        }
...
        //set username in request header
        ServerHttpRequest newRequest = request.mutate()
                .header("X-Forwarded-For", newHeader)
                .header(SystemConstant.HEADER_AUTHORIZATION, "")
                .header(AuthConstants.USERNAME, username)
                .header(AuthConstants.AUTH_WAREHOUSE, "").build();
        return chain.filter(exchange.mutate().request(newRequest).build());
   }
...
}
```

在这个示例中，`AuthFilter`首先从请求头中获取JWT，并校验其有效性。如果Token无效，直接返回401错误。如果Token有效，则从Token中提取用户角色，并根据请求的路径判断用户是否有权限访问该资源。如果没有权限，返回403错误。如果权限校验通过，请求将继续传递到后续的过滤器链。

**资源访问权限验证代码如下：**
```java
    public boolean verifyAuthorization(DecodedJWT jwt, String requestUrl, HttpMethod httpMethod) throws JWTVerificationException {
...
        Claim authorities = jwt.getClaim(AuthConstants.AUTH_MENUS);
        if (null == authorities) {
            return false;
        }
        List<String> authoritySet = authorities.asList(String.class);
        if (CollectionUtils.isEmpty(authoritySet)) {
            return false;
        }
        if (authoritySet.contains(AuthConstants.SUPPER_PERMISSION)) {
            return true;
        }
        String url = httpMethod.name().toLowerCase() + ":" + requestUrl;
        return authoritySet.stream().anyMatch(url::startsWith);
    }

```
> 这里  **Claim authorities = jwt.getClaim(AuthConstants.AUTH_MENUS)** 我们先把用户的权限保存在token中，然后从token中获取用户的权限，但是如果用户的权限太大，可能会造成token过大，影响性能，则需要通过其他的方式，比如去**用户管理服务**中查询角色的权限，然后缓存下来，这样token中只需要保存用户角色信息就可以。

#### 3.3 RBAC权限管理

在RBAC模型中，权限的管理通常通过数据库来实现。以下是一个简单的权限管理表结构：

- **用户表（User）**：存储用户的基本信息。
- **角色表（Role）**：存储角色的基本信息。
- **权限表（Permission）**：存储权限的基本信息。
- **用户角色表（UserRole）**：用户与角色的关联表。
- **角色权限表（RolePermission）**：角色与权限的关联表。

通过这些表，可以实现用户、角色和权限的灵活管理。在权限校验时，系统可以根据用户的角色查询其拥有的权限，并判断是否有权限访问当前资源。

#### 3.4 用户登录

**用户登录代码**
```java
    @PostMapping("/signin")
    public AuthModel authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
...
        TokenResponse tokenResponse = jwtUtils.generateJwtCookie(authorities, userDetails.getUsername(), authWarehouseCodes,
                userDetails.getUser().getTenantName());
        UserModel userModel = UserModel.builder().id(userDetails.getUser().getId())
                .username(userDetails.getUsername()).icon(userDetails.getUser().getAvatar()).build();
        return AuthModel.builder().token(tokenResponse.getToken()).user(userModel).expiresIn(tokenResponse.getExpiresIn()).build();
    }
```
**token生成代码**
```
    public String generateToken(List<String> authorityList, String userName, Set<String> authWarehouseCodes, String tenantName) {
        Algorithm algorithm = Algorithm.HMAC256(tokenSecret);
        return JWT.create()
                .withClaim(AuthConstants.USERNAME, userName)
                .withClaim(AUTH_MENUS, authorityList)
                .withExpiresAt(new Date(System.currentTimeMillis() + tokenExpiration * 1000L))
                .sign(algorithm);
    }
```

### 4. 总结

基于Spring Cloud Gateway和RBAC的用户管理系统，能够有效地实现权限认证与全局校验。通过将权限校验逻辑放在网关层，可以减少每个微服务的重复代码，提高系统的安全性和可维护性。RBAC模型的引入，使得权限管理更加灵活和可控。在实际项目中，可以根据业务需求进一步扩展和优化这一方案，以满足复杂的权限管理需求。

通过本文的介绍，希望读者能够理解如何利用Spring Cloud Gateway和RBAC构建一个安全的用户管理系统，并在实际项目中应用这些技术。

代码见Github: https://github.com/jingsewu/open-wes
Gitee: https://gitee.com/pigTear/open-wes
