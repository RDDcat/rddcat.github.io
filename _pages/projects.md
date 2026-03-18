---
title: "프로젝트"
layout: archive
permalink: /projects/
author_profile: false
sidebar_main: false
---

<p class="page__lead">프로젝트를 통해 어떤 문제를 풀었고, 어떤 결과물을 만들었는지 정리합니다.</p>

{% assign project_posts = site.posts | where: "post_type", "project" %}
{% assign project_collection = site.projects %}

{% if project_collection.size > 0 %}
<h2 class="archive__subtitle">프로젝트 아카이브</h2>
<div class="entries-list">
  {% for project in project_collection %}
    {% include archive-single.html type="list" %}
  {% endfor %}
</div>
{% endif %}

{% if project_posts.size > 0 %}
<h2 class="archive__subtitle">프로젝트 관련 글</h2>
<div class="entries-list">
  {% for post in project_posts %}
    {% include archive-single.html type="list" %}
  {% endfor %}
</div>
{% endif %}

{% if project_posts.size == 0 and project_collection.size == 0 %}
<p>아직 등록된 프로젝트가 없습니다.</p>
{% endif %}
