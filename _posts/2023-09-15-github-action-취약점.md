---
layout: single
title: "깃헙 액션 씨크릿키 관리.. 이건아니지.."
tags: Github Action,Docker, Spring, Spring boot
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---
## Github Action, docker를 이용한 spring boot 배포중에

시크릿키를 ec2에 배포될때 넘겨준다고 touch를 이용해서 넘겨주는 방식이 몇개 보였다.

![img_12.png](img_12.png)

구글에서 뒤적이다가 docker -e 나 docker --env 등으로 데이터를 넘겨주는 방식이 작동하지 않아 찾게된 방식인데..

이번에 곰곰히 생각하다가 이거 시크릿키가 공개되어있는 구조 아닌가?

싶어서 확인해봤다...

다시 구글링을 했고

https://velog.io/@rmswjdtn/Spring-Docker-Github-Action-Spring-Boot-%EC%9E%90%EB%8F%99%EB%B0%B0%ED%8F%AC%ED%99%98%EA%B2%BD-%EB%A7%8C%EB%93%A4%EA%B8%B0

![img_10.png](img_10.png)

![img_11.png](img_11.png)

비슷한 방식을 발견

아니나 다를까 ㅋㅋ

![img_13.png](img_13.png)

모두에게 공개되어있는 password ??!

다행히 rdb에 접근했을땐 현재 디비가 켜져있질 않았다. (아니면 보안설정을 잘해서 접근이 안되나?)

그래도 나보단 나은게 나는 s3 accesskey, secretkey까지 모두에게 공개해버렸다

누군가 봤다면 당장이고 과금이 될 상황...

일단 내 프로젝트 부터 다시 -e로 secret을 주입받는 방식으로 바꾸고

이전 버전의 이미지들을 전부 확인...

그리고 약간의 반성...


## 내 프로젝트 수정 다하고 갑자기 흑화

더 찾아보자.. 억울해...

# 2

![img_14.png](img_14.png)

https://zzang9ha.tistory.com/404

```properties
spring.config.activate.on-profile=dev

## docker-compose MongoDB Configuration
spring.data.mongodb.host=mongodb
spring.data.mongodb.port=27017
spring.data.mongodb.username=yapp
spring.data.mongodb.password=yapp
spring.data.mongodb.database=yapp

## docker-compose PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://postgresdb:5432/yapp
spring.datasource.username=yapp
spring.datasource.password=yapp
spring.datasource.driver-class-name=org.postgresql.Driver

## docker-compose Configuration
spring.redis.host=redisdb
spring.redis.port=6379

## jpa & logging
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.highlight_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
logging.level.org.hibernate.SQL=debug
logging.level.org.hibernate.type.descriptor.sql=trace
spring.jpa.hibernate.ddl-auto=none
logging.level.org.springframework.data.mongodb.core.MongoTemplate=DEBUG

## JWT
jwt.secret=thisIsTest
## 24*60*60*1000 1day
##jwt.accessTokenExpiration=86400000
jwt.accessTokenExpiration=2592000000
## 30*24*60*60*1000 30days
jwt.refreshTokenExpiration=2592000000
## redis expire Time (day)
jwt.redis.expiration=30

## AWS
cloud.aws.credentials.accessKey = AKIA6P5TWZY2MFODX3EU
cloud.aws.credentials.secretKey = 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
cloud.aws.s3.bucket = yapp-bucket-test
cloud.aws.region.static = ap-northeast-2
cloud.aws.stack.auto = false

# batch
spring.batch.jdbc.initialize-schema=always

## Firebase
firebase.project.id=dotoriham-dfee3
firebase.project.key=firebase-service-key.json

## Actuator
#management.endpoints.web.exposure.include=*
#spring.boot.admin.client.url=http://localhost:18080
#spring.boot.admin.client.instance.service-url=http://localhost:18080

spring.jpa.open-in-view=true

## Slack
slack.monitor.channel.id=C03CQC6JDJT
slack.verbose.channel.id=C0437U3550D
slack.bot.token=xoxb-3447014282195-3444267480453-Rvfl8G0Lm4fAL0obonKWfH9y

## dotoriham extension version
extension.version=4.0.3

## spring-mail
## TODO gmail ??
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=zzang9haha@gmail.com
spring.mail.password=jaigxvoxbpxmrixu
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

## AES secretKey
aes.secretKey = itismustoversixteenlength


```
itismustoversixteenlength ㅋㅋㅋㅋ 16글자를 넘겨야합니다 ㅋㅋㅋㅋㅋ


```json
{
  "type": "service_account",
  "project_id": "dotoriham-dfee3",
  "private_key_id": "85796c2b2645b94eb354eedf718e81ae2fa514dd",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvm+LyoaxsGX9c\njAFRvk74m2fHS8OiuBsR6G7rhZDdppHc0tXvGcCkbJnYOJpTY5gLGwY5wkXbZzbK\nMWmKJ3MRGDvlD4lonQBQkpTAETTuzcx7TdRTSn1L8zwCceE0b3YMDXqiDaTLVYrs\n+zOcmIXG6fgYxf5ekhwwF4EGwrOboOdWI3q8uBnrS0+UMoEEgLsJJK4fhrrh4Z+6\nzENVsHvqs54Y64oIA6tV8fEndD6RmasbP+z9OotFGluVt/wzypOniHQSHevncngn\nSlxI2Jd7nrNb+hrIABiu9S0WO2n6yg6K8KvUxzPHhcz8WJ2TWd1LMp3uu83x9bcT\nst7ntpXLAgMBAAECggEAAqs308ApQqtQiDOIgZmG0bhq51h7bKmnn6oMpX+uJ/A0\nH0sE/VFC4DzWSbbygXnuAZ0zhwUw0pjK+F+v3u2ijgv0PRLzX6ejLZZMtG6Og2KV\nTPpt06Y6KUFVFCRu68EV5jD+QCA89Ooj5l4a9rJKti8wGhBIQV+vFfwFdfjXifHt\nlm4a3suRWYcq9xkGm2FOQ41abKHcxGBemwu/wVpqyh6QJWGgOxmGnXFgFhu+PgT5\nEUCBS/kTWaGBrGaMqWIZcSIDmIheKoqJ09GwJxpr8ude8/QacptUSmKH6FODpIg5\n7RJoe/LRXThSEYVdaF30qYCQrBLyq50KLIe/EINioQKBgQDsfLJkUI2hkYVzhU7b\nkmvWSTmXHGokjczXiDltynzpj+ulHnqWOGz9go2mDPVzA2NB3Hebyp4hKA7spZB9\nMuXC4GJhYO4SuFp4ja/2szl+Hmc3Yph4td+OleJOJyktfF0LTPnn6R/5vZfCr48l\nQ26zoGe3KFbYr8V8CAUz+j0BJwKBgQC+GUOEMv45WqsAfOZK3g5NZYr3qJBnfOnc\n6Pjs6DOI9rTiX8TX3YfYPlFk8GLyK7co7i+AXjXG+d5gDemJTUrmkMxwn7fkxguQ\n/G0qx1ZYxDPsNkhXWaNkpTMuZGy32v1YPeDGZi2Scl1CX3BMr7JaILXHxG+P2F4J\nSu2DyurkvQKBgQDQlE8XUUEKDvqgYCSkXymDr8P+ts4bfYH9W6YjYuP3cLvLP+2p\nTw06L4rVuTpHfeZusZBBNV1xKw62xHSDKIAj+Jps/vwcQMNy7q0TrxH3XcN1wx1t\n4iPSc/pNKhcUikraa8NDO4e7UvBmg0eC+03JWqH/lrG6npVVBxHnvT9PIwKBgQCN\nSLGJW2zeq6hUIH/4PLlchI+YKUvJ3mjhqrT3PkyvCsy9QnhGB3ujGA3ee1rOqfbj\nEMN1II/PZn4D3dMoHK4CVrPbMJm4CgkmpLVuCeD+8DO251E0uoZZkv5LCJBUxQlt\nv++DBQXxxdXSMqSAGkTv/0ebRT+1JRYeyfVk8jdJ8QKBgE4GTA1gGT363YQp+XEF\nntJqVOTlfyLg4RrAX8V506D+bas/KqtbCSOZdJDcDx1Zk/iYVILsK4zjFcOErKd+\nJEi904jXadw9TZzGBp/2J6NFTnKRlNwjhhtuXvC9fU7t1lGG6wfk5PxGKbkyPAHn\nEdStqcNXBfZNqflrd7+TqnTM\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-bm51h@dotoriham-dfee3.iam.gserviceaccount.com",
  "client_id": "103263537253598310377",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-bm51h%40dotoriham-dfee3.iam.gserviceaccount.com"
}


```

음...



# 3. 
https://choo.oopy.io/79bee99c-5768-4817-b926-c23e4120bcf4

https://github.com/ChooSeoyeon

https://github.com/DDD-Community/KDKD-Server

```
application.spring.datasource.url=jdbc:mysql://kdkd-db.cgbr3pjfc7a1.ap-northeast-2.rds.amazonaws.com/kdkd?serverTimezone=Asia/Seoul
application.spring.datasource.username=admin
application.spring.datasource.password=kdkd4321
application.jwt.secret=kdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyoure
application.jwt.secret_refresh=dyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdkdyourekdk
```

이분은 디비 들어가져..

이분은 이력 보니까 코딩 강사셨던데..

친절하게 이슈 남겨줬어..

https://github.com/DDD-Community/KDKD-Server/issues/91


# 느낀점
일단 키가 밖으로 나와있는 프로젝트가 굉장히 많다.

이거 뿐만 아니라 되게 흔했음..

여기에 나온 프로젝트는 이걸 다른사람에게 보이게 글로 정리를 해뒀기 때문임

나도 이 글들중 하나를 읽고 무지성으로 따라했다가 키를 밖에 내보였기 때문에 어지러웠다.

심지어 아직도 어딘가에 흔적이 남아있는 느낌..

위에 링크 걸어둔 글들은 없어지거나 뒷 내용이 업데이트 되어야 할 것 같다.


# 문제 정리
깃헙 액션을 사용할때 도커이미지 빌드 전에 touch 등으로 secret 설정을 추가해서 배포하는 경우

외부에서 secret을 읽을 수 있다.

# 해결 ?
나도 모두에게 소중한것을 공개해버린 입장에서.. 내가 말하는게 해결책일지 모르지만

환경설정으로 값을 넘겨주는 방식이 조금 더 나은것같다.

docker -e

프로젝트 명과 도커 유저이름을 시크릿으로 등록하면 시크릿키가 공개되어있는 것은 동일하지만 

블로그 글을 타고 넘어가는 것은 방지할 수 있다.





<br>

<br>

<br>

<br>

<br>

<br>
