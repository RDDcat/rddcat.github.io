---
layout: single
title: "Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured."
tags: Error
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---
# π Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured. 

### λ°μ μμΈ : 
#### λλΉ μ°κ²°μ μν datasourceλ₯Ό μ°Ύμ μ μμ΄ Database λλΌμ΄λ² ν΄λμ€κ° κ²°μ λμ§ μμ

λλ Gradle μ€μ μ h2 λ°μ΄ν°λ² μ΄μ€λ₯Ό μΆκ°νκ³  λμ μκ²Όλ€.

λλΌμ΄λ²κ° κ°κ°μ λλΉμ λ§μΆμ΄ μ»€λ₯μμ μ΄κΈ° μν JDBC μ€μ μ΄ νμΈλμ§ μλ λλμ΄λ€.
(μλ¬ λ©μμ§μμλ "url"μμ±μ΄ μλ€κ³  μ½ μ§μ΄μ λ§νκΈ΄νλ€.)

gradle, maven dependency μ€μ  μ΄νμ μκ²Όλ€λ©΄ λ€μκ³Ό κ°μ λ°©λ²μ΄ ν΄κ²°μ±μ΄ λ  μ μλ€.


```
***************************
APPLICATION FAILED TO START
***************************

Description:

Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.

Reason: Failed to determine a suitable driver class


Action:

Consider the following:
    If you want an embedded database (H2, HSQL or Derby), please put it on the classpath.
    If you have database settings to be loaded from a particular profile you may need to activate it (no profiles are currently active).
```

### ν΄κ²°λ°©μ 

#### 1. μ€μ μ΄ μλλΌλ λ¬΄μνκΈ°

spring boot νλ‘μ νΈλ₯Ό μ΄νΌλ€ λ³΄λ©΄ src ν΄λμ SpringApplication(νλ‘μ νΈλ§λ€ μ΄λ¦μ΄ λ€λ¦)μ μ°Ύμμ€λ€.  

@SpringBootApplication μ΄λΈνμ΄μμ΄ λ¬λ €μλ ν΄λμ€λ‘ μ°Ύμλ λμΌνλ€.

κ·Έλ¦¬κ³  λ€μκ³Ό κ°μ΄ μ΄λΈνμ΄μ@μ μμ ν΄μ€λ€.  

<br>  

```java
@SpringBootApplication(exclude ={DataSourceAutoConfiguration.class})
public class SpringApplication {
	public static void main(String[] args) {
		SpringApplication.run(SpringApplication.class, args);
	}
}

```  

<br>  

#### 2. μ€μ  ν΄μ£ΌκΈ°

λ΄κ° μ¬μ©νλ λλΉμ λ°λΌ μ€μ μ λ€λ₯΄λ€.   

ν΅μ¬μ datasourceλ₯Ό μ€μ ν΄μ£Όλ κ²

propertiesλ₯Ό μ¬μ©νλ©΄ propertiesλ‘ μ€μ  μνμ μΌλ―(yaml)λ‘ μ€μ νλ©΄ yml νμΌλ‘ μ€μ ν΄ μ£ΌμΈμ~

<br>  
2-1. application.properties  

h2
```properties
spring.datasource.url=jdbc:h2:mem:localhost
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```


mysql
```properties
spring.datasource.url=jdbc:mysql://localhost/[DBμ΄λ¦]
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```
[DBμ΄λ¦]μ κ°κ°μ νλ‘μ νΈμ λ§μΆ°μ..

<br>  

2-2 application.yml

h2
```yaml
spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:localhost
    username: admin
    password:
```
h2 λλΉλ λ©λͺ¨λ¦¬μ λμμ μΈλ λΉλ² μμ΄λλ©λλ€.




