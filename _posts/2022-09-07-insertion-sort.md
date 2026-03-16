---
layout: single
title: "삽입정렬이란 [코드포함]"
tags: [기술정리, 알고리즘]
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
excerpt: "📘 삽입정렬이란 무엇인가.."
summary: "삽입정렬 알고리즘의 개념, 코드, 시간복잡도 정리"
post_type: "article"
---

# 📘삽입정렬 (InsertionSort)

📌깃헙주소 :
https://github.com/RDDcat/Algorithm/blob/main/src/com/company/InsertionSort.java  

삽입정렬은 배열을 정렬된부분과 정렬되지 않은 부분 2파트로 나누어서 정렬하는 방식의 정렬 알고리즘 입니다.  

### 📖삽입정렬의 특징
엄청 간단한 구현방식을 가진 알고리즘이며 데이터의 크기가 커질수록 성능이 떨어집니다.  
그래서 작은 데이터가 들어온다는 전제가 있는 곳에서는 쓰이는 것 같습니다.   
삽입정렬 알고리즘상 이미 정렬되있으면 빠르게 처리됩니다.  

<br>

___


### 📖코드
삽입정렬의 코드는 다음과 같습니다.  

 

삽입정렬.java
```java
public class InsertionSort implements Sort{
    // 삽입정렬
    @Override
    public int[] Sort(int[] array) {
        int n = array.length;
        int j, key;
        for (int i = 1; i < n; i++) {
            key = array[i];
            j = i-1;
            while((j > -1) && (array[j] > key)){
                array[j+1] = array[j];
                j--;
            }
            array[j+1] = key;
        }
        return array;
    }
}
```
메인문.java
```java
public class Main {

    public static void main(String[] args) {
	// write your code here
        int[] arr = {3,4,2,9,5,4,2,1,6};
        PrintArray(arr);

        Sort sort = new InsertionSort();
        sort.Sort(arr);

        PrintArray(arr);
    }

    // 인트 배열 출력
    public static void PrintArray(int[] arr){
        for(int i = 0; i < arr.length; i++){
            System.out.print(arr[i] + ", ");
        }
        System.out.println();
    }
}
```
실행 결과
```
3, 4, 2, 9, 5, 4, 2, 1, 6, 
1, 2, 2, 3, 4, 4, 5, 6, 9, 
```

만약 빠르게 _배껴야_ 된다면 
```java
public class InsertionSort{
  public static void main(String[] args) {
    int[] array = {3,4,2,9,5,4,2,1,6};
    // 입력 배열 출력
    for(int i = 0; i < array.length; i++){
      System.out.print(array[i] + ", ");
    }
    // 삽입정렬
    int n = array.length;
    int j, key;
    for (int i = 1; i < n; i++) {
      key = array[i];
      j = i-1;
      while((j > -1) && (array[j] > key)){
        array[j+1] = array[j];
        j--;
      }
      array[j+1] = key;
    }
    // 결과 출력
    for(int i = 0; i < array.length; i++){
      System.out.print(array[i] + ", ");
    }
  }
}
```
### 📖삽입정렬 알고리즘 설명

크기가 N인 배열을 오름차순으로 정렬하려면:

1. 배열에 대해 arr[1]에서 arr[N]까지 반복합니다. (인덱스 1부터 N까지)
1. 정렬할 값(키)을 정렬된 값들 중 제일 오른쪽 값부터 하나씩 비교합니다.
1. 키 값이 정렬된 배열부분 중 선택된 값보다 작으면 한칸 왼쪽 값과 비교합니다. 선택된 값(비교했었던)을 한 위치 위로 이동하여 교체된 요소를 위한 공간을 만듭니다.

<br>

### 📖삽입정렬의 시간 복잡도
시간 복잡도: O(N^2)
보조 공간: O(1)  
<br>

시간 복잡도 베스트 케이스 : n  (배열이 이미 정렬된 경우)  
시간 복잡도 평균 케이스 : n<sup>2  
시간 복잡도 워스트 케이스 : n<sup>2</sup>  (배열이 역순으로 정렬된 경우)  


시간복잡도의 평균케이스는 보통 워스트 케이스를 따라가는 경향이 있다.





<br><br><br><br><br> 



