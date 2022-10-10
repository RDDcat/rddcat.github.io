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
RequestDispatcher의 forward


## SendRedirect
SendRedirect()는 HttpServletResponse Interface에 선언되어 있습니다.

클라이언트의 요청을 다른 위치로 리디렉션 시킬 수 있습니다. 이 요청은 브라우저에서 실행한 새로운 요청으로 볼 수 있습니다.

Forward 요청은 웹 컨테이너에 의해 처리되며 클라이언트에게 알리지 않고 다른 리소스로 전송됩니다.



