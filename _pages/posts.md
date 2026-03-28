---
title: ""
layout: archive
permalink: /posts/
author_profile: false
sidebar_main: false
---

<div class="posts-view">
<div class="posts-toolbar">
  <div class="posts-toolbar__sort">
    <div class="posts-toolbar__sort-buttons" role="group" aria-label="정렬 방식">
      <button type="button" class="graph-filter-btn posts-sort-btn active" data-sort="latest">최신순</button>
      <button type="button" class="graph-filter-btn posts-sort-btn" data-sort="oldest">오래된순</button>
    </div>
  </div>

  <div class="posts-toolbar__tags">
    <button type="button" id="posts-tag-toggle" class="posts-toolbar__tag-toggle">
      태그 선택
    </button>
    <div id="posts-tag-panel" class="posts-toolbar__tag-panel" hidden>
      {% assign sorted_tags = site.tags | sort %}
      {% for tag in sorted_tags %}
      <label class="posts-toolbar__tag-option">
        <input type="checkbox" value="{{ tag[0] | escape }}">
        <span>{{ tag[0] }}</span>
        <small>({{ tag[1].size }})</small>
      </label>
      {% endfor %}
    </div>
  </div>
</div>

<div id="posts-active-tags" class="posts-active-tags" hidden></div>

<div class="entries-list posts-list" id="posts-list">
  {% for post in site.posts %}
  {% assign tags_joined = "" %}
  {% for tag in post.tags %}
    {% assign normalized_tag = tag | downcase | strip %}
    {% assign tags_joined = tags_joined | append: normalized_tag %}
    {% unless forloop.last %}
      {% assign tags_joined = tags_joined | append: "|" %}
    {% endunless %}
  {% endfor %}
  <article
    class="archive__item posts-list__item"
    data-date="{{ post.date | date: '%s' }}"
    data-tags="{{ tags_joined }}"
  >
    <h2 class="archive__item-title no_toc">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>
    <p class="page__meta">
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      {% if post.tags and post.tags.size > 0 %}
        &middot;
        {% for tag in post.tags %}
          <span class="posts-list__tag">{{ tag }}</span>{% unless forloop.last %}, {% endunless %}
        {% endfor %}
      {% endif %}
    </p>
  </article>
  {% endfor %}
</div>

</div>

<script src="{{ '/assets/js/posts-filters.js' | relative_url }}"></script>
