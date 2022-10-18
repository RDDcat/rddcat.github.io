---
layout: single
title: "@Bean과 @Component의 차이?"
tags: @Bean, @Component
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
excerpt: "📘 @Bean과 @Component의 차이?"
---
# 📘 @Bean과 @Component의 차이?

## 📘 @Bean?

@Bean은 @Configuration 어노테이션이 명시된 클래스 안의 매서드에 선언한다.  

코드로 보면 다음과 같다.

```java
@Configuration
public class SampleConfig{  
  
  @Bean
  public SampleBean SampleBean() {
      // 프로젝트 어딘가에 클래스가 선언되있다고 가정
      return new SampleBean();
  }
}
```
 
@Bean이 선언된 매서드에서 리턴된 클래스들은 스프링 빈 컨테이너에서 관리하는 싱글톤 객체가 된다.  

프로젝트 내부에 정의된 클래스 뿐만 아니라 클래스 외부에 정의된 객체들까지도 스프링 컨테이너에 객체를 올려두고 관리할 수 있다.  

## 📘 @Component?
우리가 흔히 사용하는 @Service, @Repository 안에 포함된 어노테이션이다.  

@Component가 선언된 클래스는 스프링이 뜰때 자동으로 스캔되어 스프링 빈 컨테이너에 객체가 올라간다.

```java
@Component
public class SampleComponent {
    // ...
}
```

## 📘 @Bean과 @Component의 공통점?

@Bean과 @Component 둘다 선언된 객체를 스프링 빈 컨테이너에서 관리하도록 만든다는 공통점이 있다.  

또한 둘다 @Autowired를 통해 객체를 주입받을 수 있다.

## 📘 @Bean과 @Component의 차이?

그럼 둘은 무슨 차이가 있을까?

유치한 차이점은 @Bean은 매서드위에 명시되고 @Component는 클래스 위에 명시된다는 차이점이 있다. 

이를 우리는 @Component는 클래스 레벨의 어노테이션, @Bean은 매서드 레벨 어노테이션이라고 부른다.

설명에도 약간 언급이 되었지만 @Bean은 @Configuration이 명시된 클래스와 함께 써야하며 내 기억으로는 @Configuration의 경우 개발자의 선택에 따라 해당 설정의 사용 여부를 결정할 수 있다.

반면 @Component의 경우에는 @Configuration이 필요없으며 스프링에서 제공하는 컴포넌트 스캔의 대상이 되어 자동으로 객체를 감지한다. (선언 되어있다면 무조건 관리됨)

@Bean의 경우에는 스프링 컨테이너 외부에 있는 클래스의 빈을 생성할 수 있으며 @Component의 경우에는 불가능하다.  

@Component는 빈의 선언을 클래스와 분리하지 않으며  
 
@Bean은 빈의 명시적 선언을 @Configuration이 명시된 클래스에서 담당하고 클래스의 정의는 다른 위치에서 정의될 수 있다.  


## 📘 PS

자료를 조사하면서 느꼈던 의문은 용도가 정확히 어떻게 되는거지? 였습니다.

눈앞에 칼이 잇는데 하나는 사시미고 하나는 중식도라면 둘의 용도는 썰기로 동일하지만 둘은 분명히 써는 용도가 다릅니다.  

마찮가지로 @Bean과 @Component는 어떤 디테일의 차이가 있을까요...

<a href="https://jojoldu.tistory.com/27">jojoldo 블로그 내용중</a>  

@bean은 setter나 builder 등을 통해서 사용자가 프로퍼티를 변경해서 생성한 인스턴스를 스프링에게 관리하라고 맡길 수 있다.  

@component는 클래스를 스프링이 알아서 인스턴스 생성한 후에 빈으로 등록하라고 맡길 수 있다.

1 @Bean- 개발자가 생성하지 않은 외부라이브러리 객체에 사용.  

2 @Component- 개발자가 직접 생성한 클래스에 사용.


<br>
<br>
<br>  