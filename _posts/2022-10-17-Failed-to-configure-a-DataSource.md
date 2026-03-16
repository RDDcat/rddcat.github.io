---
layout: single
title: "Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured."
tags: [기술정리, 백엔드]
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
post_type: "article"
summary: "Spring Boot DataSource 설정 오류 해결 방법을 안내합니다."
---
# 📘 Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured. 

### 발생 원인 : 
#### 디비 연결을 위한 datasource를 찾을 수 없어 Database 드라이버 클래스가 결정되지 않음

나는 Gradle 설정에 h2 데이터베이스를 추가하고 나서 생겼다.

드라이버가 각각의 디비에 맞추어 커넥션을 열기 위한 JDBC 설정이 확인되지 않는 느낌이다.
(에러 메시지에서는 "url"속성이 없다고 콕 집어서 말하긴한다.)

gradle, maven dependency 설정 이후에 생겼다면 다음과 같은 방법이 해결책이 될 수 있다.


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

### 해결방안 

#### 1. 설정이 없더라도 무시하기

spring boot 프로젝트를 살피다 보면 src 폴더에 SpringApplication(프로젝트마다 이름이 다름)을 찾아준다.  

@SpringBootApplication 어노테이션이 달려있는 클래스로 찾아도 동일하다.

그리고 다음과 같이 어노테이션@을 수정해준다.  

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

#### 2. 설정 해주기

내가 사용하는 디비에 따라 설정은 다르다.   

핵심은 datasource를 설정해주는 것

properties를 사용하면 properties로 설정 셋팅을 야믈(yaml)로 설정하면 yml 파일로 설정해 주세요~

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
spring.datasource.url=jdbc:mysql://localhost/[DB이름]
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```
[DB이름]은 각각의 프로젝트에 맞춰서..

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
h2 디비는 메모리에 띄워서 쓸때 비번 없어도됩니다.




