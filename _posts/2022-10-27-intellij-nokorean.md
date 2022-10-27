---
layout: single
title: "인텔리제이 한글이 깨질때"
tags: intellij, 인텔리제이
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---
## 📘 인텔리제이 한글이 깨져요..


### 해결

1. 인텔리제이 셋팅으로 들어간다.  

<img width="249" alt="인텔리제이스샷" src="https://user-images.githubusercontent.com/55569476/198182182-e045627b-4c04-4ec9-b408-0e250a84b4a8.png">

2. 셋팅화면 editor탭을 찾아서 들어간다.  

![image](https://user-images.githubusercontent.com/55569476/198182401-273042b4-3836-467e-a605-f67d1b6a556d.png)

3. File Encoding을 찾아서 들어간다.  

![image](https://user-images.githubusercontent.com/55569476/198182440-c4722877-7fc4-4cb4-85db-de26219fb3d4.png)

4. 3군데에 Encoding 설정을 해줄수 있는데 전부 UTF-8로 바꾼다.



![image](https://user-images.githubusercontent.com/55569476/198182507-252e5a61-16fc-4a75-abd6-767248eba619.png)

window 10을 써서 그런가.. 왜 기본 셋팅이 iso-8859-1 인지 모르겠네..

ISO-8859-1은 HTML 4.01의 기본 문자였고 전체 웹사이트에 1.3%정도에 사용된다고 합니다.  

라틴어 계열쪽 유럽쪽 언어는 넓은 폭으로 커버하는것 같은데 

한국어는 포함안되서 한국어 인식을 못하고 콘솔창이 깨진느낌?

저는 위 방법대로 UTF-8로 바꾸니까 해결됬습니다.

<br>  

<br>  
