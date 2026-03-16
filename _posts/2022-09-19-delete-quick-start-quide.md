---
layout: single
title: "깃헙 지킬 블로그 Quick Start Quide 지우는 방법"
tags: [기술정리, 프론트엔드]
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
excerpt: "📘 깃헙 블로그 오른쪽위에 Quick-Start Quide 지우기"
summary: "Jekyll 블로그에서 Quick-Start Guide 메뉴 제거 방법"
post_type: "article"
---

## 📘 깃헙 블로그 오른쪽위에 Quick-Start Quide 지우기

📌https://github.com/mmistakes/minimal-mistakes   
깃헙블로그를 시작할때 위의 링크의 블로그를 포크하거나 클론하여 블로그를 시작할 경우 오른쪽 위에 Quick-Start Guide 링크가 있습니다. 

더 깔끔한 블로그를 위해 지워보도록 하겠습니다.


![blogmain](https://user-images.githubusercontent.com/55569476/190987930-c2ca7f57-7270-4d91-bca3-b5822c78fca7.png)

## 📘 지우는 방법
지우는 방법은 단순합니다. 
### 1. 프로젝트 폴더구조에서 _data 폴더 밑의 navigation.yml 파일에 들어갑니다.

![blog](https://user-images.githubusercontent.com/55569476/190988147-8bccfb6b-62c8-4a88-a177-dfff45dbf17d.png)


### 2. 야믈(yml) 파일을 확인해 3번째 4번째 줄을 주석처리합니다.  



![image](https://user-images.githubusercontent.com/55569476/190988673-db36a543-f0d3-407d-97e4-832ea5668165.png)


![image](https://user-images.githubusercontent.com/55569476/190988719-42af99d6-6c0e-431e-b103-88470afffdb2.png)

<br>

그 다음 블로그의 변경사항을 커밋-푸쉬 해주고 깃헙에서 내 블로그의 변경사항이 다 등록될때까지 잠시 기다려 주면 Quick-Start Guide 가 사라진 깔끔한 블로그를 볼 수 있습니다.

### 결과물

![blogafter](https://user-images.githubusercontent.com/55569476/190988559-4b9263c4-57d3-4769-8bad-32bc9695d08c.png)