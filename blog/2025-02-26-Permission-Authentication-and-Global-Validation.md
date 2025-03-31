---
title: 'User Management System Based on Spring Cloud Gateway + RBAC: Permission Authentication and Global Validation'
author: 'Kinser'
author_title: 'Software Engineer'
tags: [Authentication, RBAC, GlobalValidation, SpringCloudGateway ]
date: '2025-02-26'
permalink: '/blog/Permission-Authentication-and-Global-Validation'
---


### Introduction

In modern microservice architectures, the user management system is one of the core components, responsible for user authentication and permission management. As the scale of the system grows, efficiently managing user permissions and ensuring system security has become a significant challenge. A user management system based on Spring Cloud Gateway and RBAC (Role-Based Access Control) can effectively address this issue. This article will introduce how to implement permission authentication and global validation using Spring Cloud Gateway, and how to build a secure user management system by integrating the RBAC model.

---

### 1. Introduction to Spring Cloud Gateway

Spring Cloud Gateway is an API gateway within the Spring Cloud ecosystem, designed to provide a simple and effective way to route requests, perform authentication, and implement load balancing for microservice architectures. Built on top of Spring 6 and Spring Boot 3, it supports asynchronous non-blocking request handling, making it suitable for high-concurrency scenarios.

The core features of Spring Cloud Gateway include:
- **Routing**: Requests are routed to different microservices based on path, method, headers, and other criteria.
- **Filters**: Logic can be executed before or after requests reach the target service, such as permission validation and request logging.
- **Load Balancing**: Integrated with Spring Cloud LoadBalancer to distribute requests across services.
- **Circuit Breaker**: Combined with Spring Cloud CircuitBreaker to provide service resilience and fallback mechanisms.

---

### 2. RBAC (Role-Based Access Control) Model

RBAC is a widely-used permission management model that associates permissions with roles, and users gain permissions through role assignments. The core concepts of RBAC include:
- **User**: The system's end-user, which can be an individual or an application.
- **Role**: A collection of permissions that users inherit when assigned to them.
- **Permission**: The ability to perform specific actions on system resources, such as "read," "write," or "delete."

The advantages of RBAC include:
- **Flexibility**: Permissions can be easily managed by assigning or revoking roles.
- **Maintainability**: Centralizing permission management at the role level reduces the complexity of directly managing user permissions.
- **Security**: Hierarchical roles and permission inheritance enhance system security.

---

### 3. Permission Authentication and Global Validation with Spring Cloud Gateway

In microservice architectures, the API gateway serves as the entry point for all external requests. Therefore, it is appropriate to place permission authentication and global validation logic at the gateway level. Spring Cloud Gateway's powerful filter mechanism allows for permission validation before requests reach the target service.

#### 3.1 Permission Authentication Process

1. **User Login**: Users submit their username and password through a login interface. After verifying the user's identity, the system generates a JWT (JSON Web Token) and returns it to the client.
2. **Token in Requests**: The client includes the JWT in subsequent requests, typically in the `Authorization` header.
3. **Gateway Token Validation**: Upon receiving a request, Spring Cloud Gateway first validates the JWT through a custom global filter. If the token is invalid or expired, the gateway returns a 401 Unauthorized error.
4. **Permission Validation**: After the token is validated, the gateway checks whether the user has the necessary permissions based on their role and the requested path. If not, a 403 Forbidden error is returned.
5. **Routing to Target Service**: If permission validation passes, the request is routed to the target microservice.

#### 3.2 Implementation of Global Validation

Global validation in Spring Cloud Gateway can be implemented through a custom `GlobalFilter`. Here is a simple example of a global validation filter:

```java
public class GlobalGatewayFilter implements GlobalFilter, Ordered {

    private final AuthProperties authProperties;
    private final JwtUtils jwtUtils;
    private final RedisUtils redisUtils;

    /**
     * Token Filter
     *
     * @param exchange exchange
     * @param chain    chain
     * @return Mono
     */
    @Override
    public Mono\u003cVoid\u003e filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        String token = getToken(request);

        DecodedJWT jwt;
        try {
            jwt = jwtUtils.verifyJwt(token);
        } catch (TokenExpiredException e) {
            return unauthorized(requestUrl, exchange.getResponse(), "token is expired.");
        } catch (JWTVerificationException e) {
            return unauthorized(requestUrl, exchange.getResponse(), "token verification failed.");
        }
        if (jwt == null) {
            return unauthorized(requestUrl, exchange.getResponse(), "token is not legal.");
        }

        if (!verifyAuthorization(jwt, requestUrl, request.getMethod())) {
            return unauthorized(requestUrl, exchange.getResponse(), "request access denied, may be unauthorized.");
        }

        // Set username in request header
        ServerHttpRequest newRequest = request.mutate()
                .header("X-Forwarded-For", newHeader)
                .header(SystemConstant.HEADER_AUTHORIZATION, "")
                .header(AuthConstants.USERNAME, username)
                .header(AuthConstants.AUTH_WAREHOUSE, "").build();
        return chain.filter(exchange.mutate().request(newRequest).build());
    }
    }
```

In this example, the `AuthFilter` first retrieves the JWT from the request header and validates its authenticity. If the token is invalid, a 401 error is returned. If valid, the filter extracts the user's role from the token and checks whether the user has permission to access the requested resource based on the request path. If permission is denied, a 403 error is returned. If validation passes, the request continues down the filter chain.

**Resource Access Permission Validation Code:**
```java
public boolean verifyAuthorization(DecodedJWT jwt, String requestUrl, HttpMethod httpMethod) throws JWTVerificationException {
    Claim authorities = jwt.getClaim(AuthConstants.AUTH_MENUS);
    if (null == authorities) {
        return false;
    }
    List\u003cString\u003e authoritySet = authorities.asList(String.class);
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

\u003e Here, **Claim authorities = jwt.getClaim(AuthConstants.AUTH_MENUS)**, we store user permissions in the token and then retrieve them from the token. However, if the user's permissions are extensive, the token may become too large and impact performance. In such cases, alternative methods should be considered, such as querying user permissions from the **User Management Service** and caching them. This way, the token only needs to store user role information.

#### 3.3 RBAC Permission Management

In the RBAC model, permission management is typically implemented through a database. Here is a simple database schema for permission management:

- **User Table**: Stores basic user information.
- **Role Table**: Stores basic role information.
- **Permission Table**: Stores basic permission information.
- **UserRole Table**: Associates users with roles.
- **RolePermission Table**: Associates roles with permissions.

With these tables, flexible management of users, roles, and permissions can be achieved. During permission validation, the system queries the permissions associated with the user's role and determines whether access to the requested resource is allowed.

#### 3.4 User Login

**User Login Code:**
```java
@PostMapping("/signin")
public AuthModel authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    Authentication authentication = authenticationManager
            .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    TokenResponse tokenResponse = jwtUtils.generateJwtCookie(authorities, userDetails.getUsername(), authWarehouseCodes,
            userDetails.getUser().getTenantName());
    UserModel userModel = UserModel.builder().id(userDetails.getUser().getId())
            .username(userDetails.getUsername()).icon(userDetails.getUser().getAvatar()).build();
    return AuthModel.builder().token(tokenResponse.getToken()).user(userModel).expiresIn(tokenResponse.getExpiresIn()).build();
    }
```

**Token Generation Code:**
```java
public String generateToken(List<String> authorityList, String userName, Set<String> authWarehouseCodes, String tenantName) {
    Algorithm algorithm = Algorithm.HMAC256(tokenSecret);
    return JWT.create()
            .withClaim(AuthConstants.USERNAME, userName)
            .withClaim(AUTH_MENUS, authorityList)
            .withExpiresAt(new Date(System.currentTimeMillis() + tokenExpiration * 1000L))
            .sign(algorithm);
            }
```

---

### 4. Conclusion

A user management system based on Spring Cloud Gateway and RBAC can effectively implement permission authentication and global validation. By placing permission validation logic at the gateway level, repetitive code in each microservice can be reduced, enhancing system security and maintainability. The integration of the RBAC model makes permission management more flexible and controllable. In practical projects, this solution can be further expanded and optimized to meet complex permission management requirements.

Through this article, we hope readers can understand how to build a secure user management system using Spring Cloud Gateway and RBAC, and apply these technologies in their projects.

The code is available on GitHub: [GitHub - jingsewu/open-wes](https://github.com/jingsewu/open-wes)
