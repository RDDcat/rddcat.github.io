---
layout: single
title: "SQLSyntaxErrorException 인데 문법이 안틀렸을때"
tags: [기술정리, 데이터베이스]
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
post_type: "article"
summary: "MariaDB SQL 예약어로 인한 구문 오류 해결 방법을 안내합니다."
---
## 📘 SQLSyntaxErrorException: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'integer, version_id bigint'

앗... SLQ 문법 오류가 났다..

문법 오류가 난 부분은 두 군데였는데 
```sql
Hibernate:

    create table tbl_name (
        id bigint not null,
        col_one integer,
        count BIGINT,
        current_date varchar(255),
        col_two bigint,
        primary key (id)
    ) engine=InnoDB
```

```sql
Hibernate:

    create table tbl_name (
        id bigint not null,
        col_one varchar(255),
        index integer,
        col_two integer,
        primary key (id)
      )  engine=InnoDB   
```
(테이블 이름과 아이디, 칼럼명은 설명에 필요한 부분빼고 다 가렸다.)

구문 자체는 문제가 없어 보였다. 

이 두 테이블을 제외하고는 전부다 디비로 잘 들어갔다.

문법 오류가 났는데 문법은 정상이었다.  

이 점 때문에 고치는데 오래 걸렸는데 (아니면 새벽이어서 그럴지도..)

맨처음엔 해당 구문이 JPA(Hibernate)에서 자동으로 만들어주는거라 JPA 버전 내에 있는 버그인가 싶었다.  

내가 한일은 날라간 쿼리문을 콘솔에서 긁어다가 heidisql 쿼리탭에 붙였는데  


## 📘 문제 해결 과정

![image](https://user-images.githubusercontent.com/55569476/199926148-d465c800-90ce-4765-932e-29eefcc071f7.png)

sql을 직접 쐈는데도 에러가 나는걸 보니 일단 JPA, spring 셋팅의 문제는 아니었다.  

구문에 문제가 있는건데 일단 문법은 맞았다. 

근데 쿼리문에서 칼럼명들이 색이 제멋대로였다.  

![image](https://user-images.githubusercontent.com/55569476/199928907-36459640-8aa4-48a8-8421-c8483dbf80f3.png)

count랑 current_date 만 약간 덜 파란색으로 변해있었다.

![image](https://user-images.githubusercontent.com/55569476/199928355-c5019f6d-f195-4b2c-ab7f-6e75d38acaf1.png)

index 만 색이 파란색으로 강조 되어있었다.

이거 설마 데이터베이스 시스템에서 이미 정의된 단어인가 싶었다.  

긴가민가했던게 count는 다른 테이블에서 사용하고 있어서 count는 예약어가 아니었기 때문이다.  

<a href="https://mariadb.com/kb/en/columnstore-naming-conventions/">마리아 디비 예약어 목록 및 네임 컨벤션</a>

마리아 디비 공식사이트에 들어가보니 두 해당 테이블에있는 index, current_date가 예약어였다.

아니 예약어도 문법오류로 팅겨내내;;

## 📘 해결

__MariaDB에서 사용하는 예약어를 그대로 칼럼명으로 사용했다는 점이다.__  

### 예약어와 동일한 칼럼을 다른 이름으로 대체했다.

평소에 사용하던 네이밍 규칙이 번잡해서 없앴더니 이런일이 일어났다..

(db_db, tbl_table, col_column) -> (db, table, column)

내부 시스템에서 사용하는지 아닌지 해깔리는 이름이면  

이름 짓기 전에 ctrl+f 로 아래 링크에서 확인해보는것도 좋을것같다

<a href="https://mariadb.com/kb/en/columnstore-naming-conventions/">마리아 디비 예약어 목록 및 네임 컨벤션</a>  






<br>  

<br>  

<br>  


