---
layout: post
title: "컬렉션은 무엇인가"
tags: JAVA
sitemap:
  changefreq : daily
  priority : 0.5
---

# 컬렉션은 무엇인가

자바에서 컬렉션은 데이터를 담는 여러가지 통이다.
객체 그룹을 저장하고 조작하는데 간편화된 자료구조를 제공해준다.

자바 컬렉션에는 크게 3가지 인터페이스를 제공하는데, 각각 List, Queue, Set 이다.

<br>

List는  LinkedList, Vector, ArrayList들을 구현체로

Queue는 LinkedList PriorityQueue들을 구현체로  
(LinkedList는 Queue를 상속받는 Deque를 상속받는 동시에 List 또한 상속받으며 직렬화 되어있다.)

Set은 HashSet, LinkedHashSet, TreeSet을 구현체로 가진다.
<br><br><br>

### List 인터페이스
순서(index)가 있는 데이터이며
자료를 한줄로 나열하여 여러 데이터가 일직선으로 연결되어있습니다.
List의 구현체가 java.io.Serializable를 상속받고 있는 것도 확인이 됩니다.
순서가 있기 때문에 자료의 중복을 허용합니다.

<br><br>
### Queue 인터페이스
선입선출 컴퓨터쪽에선 FIFO구조로  
앞서 들어간 데이터가 먼저 나오는 자료구조입니다.

<br><br>
### Set 인터페이스
집합처럼 값들의 순서가 없이 저장되는 데이터 입니다.
순서가 없기 때문에 데이터의 중복 또한 허용하지 않습니다.






#
#