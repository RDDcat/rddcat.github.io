---
layout: single
title: "인텔리제이 edit configuration vm options 안보임"
tags: 인텔리제이, 옵션
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---

## 📘 Unable to find GatewayFilterFactory with name 에러

구글에 검색해봐도 이런 에러에 대한 설명이 4페이지 밖에 안나와서 당황했는데 역시나 멍청한건 나였다.

에러 메시지를 해석하면 게이트웨이 필터 팩토리의 이름을 찾을 수 없다 인데

내 경우에는 말그대로 yml 설정파일에 filter 이름을 안적어줬다;

![image](https://user-images.githubusercontent.com/55569476/225941362-7e6c683d-3281-4aa6-9a7e-6c6f73119692.png)

name: 필터이름

이렇게 적어주니 어이없게 해결됐다..

글로 남기는 것조차 부끄러울 지경이다..





