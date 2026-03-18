---
title: "모든 글"
layout: archive
permalink: /posts/
author_profile: false
sidebar_main: false
---

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}

{% for year in posts_by_year %}
<h2 class="archive__subtitle">{{ year.name }}</h2>
<div class="entries-list">
  {% for post in year.items %}
    {% include archive-single.html type="list" %}
  {% endfor %}
</div>
{% endfor %}
