---
layout: single
title: "Forward와 Send-Redirect의 차이"
tags: JSP, Servlet
sitemap:
changefreq : daily
priority : 0.5
categories : Tech
excerpt: "📘 JSP 서블릿에서 Forward와 Send-Redirect의 차이"
---
# Forward와 Send Redirect의 차이점

## Forward
foward()는 한 JSP에서 다른 JSP로 또는 JSP에서 서블릿으로 리소스 요청을 전달하는데 사용됩니다.  

웹 컨테이너에 의해 제어되며 클라이언트 브라우저는 foward에 관여하지 않습니다. (서버내에서 동작)

forward() 매서드는 RequestDispatcher에 선언되어 있습니다.  


## SendRedirect
SendRedirect()는 HttpServletResponse Interface에 선언되어 있습니다.

클라이언트의 요청을 다른 위치로 리디렉션 시킬 수 있습니다.  

이 요청은 클라이언트의 브라우저에서 실행한 새로운 요청으로 볼 수 있습니다.


## 둘의 차이 (Foward vs Redirect)
Forward 요청은 웹 컨테이너에 의해 처리되며 클라이언트에게 알리지 않고 다른 리소스로 전송됩니다.

따라서 클라이언트는 요청의 진행과 최종결과물의 주소를 볼 수 없습니다.

SendRedirect는 요청이 클라이언트 브라우저에 의해 실행됩니다.  

클라이언트는 redirect된 요청의 위치를 알 수 있습니다.  

<br>
forward에서는 요청의 객체들 Request, Response 객체들이 최종 결과물까지 유지됩니다.  

반면 redirect에서는 최초의 요청페이지의 request, response 객체들이 파괴되고 새로운 요청에 따라 다시 생성됩니다.  

<br>
foward는 서버 내에서 작동하기 때문에 SendRedirect보다 빠르게 실행됩니다. 

왜냐하면 Redirect의 경우는 클라이언트 브라우저의 HTTP요청이 다시 도착하기까지 기다리는 시간이 존재하기 때문입니다.  







