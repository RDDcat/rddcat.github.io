---
layout: single
title: "[JAVA] 977. Squares of a Sorted Array 풀이"
tags: 알고리즘, leetcode, leetcode977, JAVA
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
---
## 977. Squares of a Sorted Array 풀이
### JAVA

>Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.

작은수부터 정렬된 int[] (정수형 배열)이 하나 주어진다.

각각의 수를 제곱하고 작은수부터 큰수 순서대로 정렬하라!

<br>

>could you find an O(n) solution using a different approach?

혹시.. 실례가 되지 않는다면 좀 빠른 해결책을 생각해보지 않을래?

<br>

### 풀이
[자바코드링크]("https://github.com/RDDcat/Algorithm/blob/main/coding/src/main/java/com/maro/coding/leetcode/SquaresOfSortedArray977.java")

```java
public int[] sortedSquares(int[] nums) {
    int[] squares = new int[nums.length];
    int index = 0;
    // 투포인터
    int[] result = new int[nums.length];
    int start = 0;
    int end = nums.length-1;

    for (int n:nums) {
        squares[index++] = (int) Math.pow(n,2);
    }
//        System.out.println(Arrays.toString(squares));


    while(index > 0){
        if(squares[start] > squares[end]){
            result[--index] = squares[start];
            start++;
        }
        else {
            result[--index] = squares[end];
            end--;
        }
    }
//        System.out.println(Arrays.toString(result));

    return result;
}

```
`
<br>

<br>

<br>

<br>`



















