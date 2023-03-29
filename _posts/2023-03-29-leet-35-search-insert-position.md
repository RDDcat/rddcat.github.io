---
layout: single
title: "리트코드 35 Search Insert Position"
tags: 알고리즘, 고난, leetcode, leetcode35 
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---
## 35. Search Insert Position

> Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
>
>You must write an algorithm with O(log n) runtime complexity.

> 정렬된 정수형 배열이 주어지고, target 값이 주어질때
> 
> 타겟이 배열안에 동일한 값이 있으면 찾아진 값의 인덱스를 리턴해주세요
> 
> 아니라면 target이 순서상 그 배열안에 삽입되어야할 인덱스를 리턴해주세요 
> 
> 근데 코드는 좀 빨라야 할겁니다 ㅎㅎ

내가 겪은 문제 :
[내 테스트 코드는 통과하는데?? 외않되..](./2023-03-29-test-second-challenge.md)



풀이 :

```java
public int searchInsert(int[] nums, int target) {
  int start =0;
  int end = nums.length -1;
  int mid =0;

  while (start <= end){
      mid = start + (end - start) / 2;
      if(target == nums[mid]){
          return mid;
      }
      if(target > nums[mid]){
          start = mid+1;
      }
      else {
          end = mid-1;
      }
  }
  if(start < end){
      return start+1;
  }
  return start;
}
```

코드 링크 :
[SerchInsertPosition35](https://github.com/RDDcat/Algorithm/blob/main/coding/src/main/java/com/maro/coding/leetcode/SerchInsertPosition35.java)



<br>  

<br>  

<br>  






