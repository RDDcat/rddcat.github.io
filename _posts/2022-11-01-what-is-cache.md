---
layout: single
title: "캐시란 무엇인가?"
tags: 캐시, cache
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---

## 📘 캐시란 무엇인가?
캐시는 쉽게말해 "근처에 데이터를 저장"해두는 기술을 말합니다.  

작게는 CPU에서 부터 크게는 네트워크 캐시서버까지 속도향상을 목적으로 사용하는 보편적인 기술입니다.  

캐시의 핵심은 접근이 빠른 메모리에 저장해 서비스 시간을 줄이는 것입니다.

### 📘 CPU 캐시
데이터를 컴퓨터에 저장할때는 여러가지 장치를 사용합니다.

플로피디스크, 하드디스크, CD, USB, RAM, 플래시 메모리 등등이 그들입니다.  

이들은 크게 2가지로 나뉘어 지는데,

하나는 전원이 꺼지면 가지고 있는 데이터가 삭제되는 저장장치이고  

하나는 전원이 꺼지더라도 가진 데이터를 유지하는 장치가 있습니다.

cpu가 연산을 처리하기 위해 실행할 데이터를 가져올때

컴퓨터는 다음과 같은 흐름으로 실행됩니다.  

하드디스크(혹은 SSD) -> RAM -> CPU

여기서 RAM부터 CPU까지에 저장된 데이터들은 전원이 꺼지면 데이터가 휘발됩니다.

~~"하지만 빨랐죠."~~

데이터를 유지하기 위해 프로그램 데이터들이 하드디스크에 저장이 되고 

사용자가 실행하려는 프로그램을 RAM(요즘은 16GB)에 올려 CPU에서 실행됩니다.  

하지만 문제가 있습니다 CPU의 연산속도는 RAM에서 데이터를 끌어오는 속도에 비해 월등하게 빨랐습니다.  

이는 데이터 저장소에서 가져온 데이터가 바로 처리되고 다음데이터가 올때까지 CPU가 쉰다는 것을 의미합니다.  

사람들이 메모리(RAM)의 위치별 접근 횟수에 대한 통계를 내보니 놀랍게도 CPU는 동일하거나 근처의 데이터를 다음번에 조회할 확률이 높았습니다.

cpu가 한번 조회한것을 다시 조회하는 특징을 지역성이라고 합니다.  

사람들은 이러한 지역성에 아이디어를 얻어 캐시의 개념을 생각해내게 됩니다.

RAM 보다 빠르고 CPU보다 적당히 느린 하지만 비싼 메모리가 있었습니다.

플레시 메모리라고 하는데요.  

이를 이요해 사람들은 다음과 같이 컴퓨터를 구성했습니다. 

```
하드디스크(혹은 SSD) -> RAM -> 플래시메모리(캐시) -> CPU
```
```
하드디스크(혹은 SSD) -> RAM -> 플래시(1차 캐시) -> 플래시(2차 캐시) -> CPU
```

이런 구조로 컴퓨터를 구성하고 일부 실행부분과 일부의 데이터를 cpu와 가장 가까운곳에 저장합니다.   

다음에 또 실행될 학률이 높은 정보 순서대로 cpu와 가장 가까운곳에 데이터를 이동시킵니다.  

이럴 경우 지역성 때문에 컴퓨터는 더 높은 실행속도를 가질 수 있습니다.  


#### 지역성이 나타나는 이유

간단한 반복문을 한번 볼까요?

```java
for(int i=0;i<100;i++){
    System.out.println(i);
}
```
프로그램을 개발할때 반복문이 자주 사용되는데요.  

반복문을 보면 int i가 100번의 실행동안 참조되는것을 확인할 수 있습니다.  

i의 정보다 1번 이용될때 그것을 cpu와 가까운 캐시메모리에 저장해두고 다음 실행때 가져오면 

SSD나 하드디스크에 저장해두고 가져와서 실행하는 것보다 빠르겠죠.  

같은 데이터는 100번이나 참조하니까요.  

Map, 배열등의 자료구조에서도 지역성을 확인할 수 있습니다.  

배열에 한번 접근해서 데이터를 사용한다면 역시 다음에도 배열의 값을 참조할 가능성이 높습니다.  

우리가 배열에 값들을 조회할때 첫번째 배열접근때 배열을 전부다 캐시메모리에 넣어둔다면 

속도가 역시 빨라지겠죠.   


### 📘 캐시 서버

캐시는 수요가 예상되면 근처에다가 데이터를 두고 공급하는 것입니다.  

우리는 네트워크에서도 이러한 캐시기술을 볼 수 있는데요.  

캐시 서버가 그 예시입니다.  

국가와 국가간의 통신은 해저 광케이블을 통해 이루어집니다.  

미국의 10억의 유저가 대한민국 서버에 접근한다고 가정해봅시다.  

데이터 전송량이 광케이블의 대역폭을 가뿐히 넘어가게 되고  

대역폭을 넘긴다면 10억번째 사람은 아마 내년을 되야 요청한 정보를 받아볼 수 있을겁니다.  

귀성길의 고속도로를 생각해보면 쉽게 이해할 수 있습니다.  

그럼 이런 문제는 어떻게 해결할 수 있을까요?

제일 쉬운 방법은 광케이블을 늘리면 됩니다.  

10억명의 대역폭을 받아낼수있는 광케이블을 깔면되죠.  

하지만 이것은 엄청난 비용을 야기할 것입니다. 

우리는 이것의 해결책으로 캐시서버를 사용합니다.  

그 지역에 원본서버와 비슷한 서버를 설치하는 것이죠.  

쉽게 예를 들면, 구글은 한국에 구글 자체 서버시설을 설치했습니다.  

구글은 미국기업이고 미국에 서버가 있지만, 

한국인이 구글에 하는 요청은 한국 구글지사의 서버에서 처리가 됩니다.  

데이터가 캐시서버를 통해 바다를 건너지 않게 되는것이죠.  


## 📘 캐시의 장점

앞서 입이 닳도록 언급했던것 같지만, 다시 정리해보면

캐시는 속도를 올려줍니다.  

적은 자원으로 높은 효율의 실행을 할수있습니다.



## 📘 캐시의 단점

그런건 없습니다.





<br>  

<br>  



