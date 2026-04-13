(function () {
  "use strict";

  const THEMES = {
    light: {
      link: "#9ca3af",
      linkHover: "#6b7280",
      text: "#ffffff",
      nodeStroke: "#fff",
    },
    dark: {
      link: "rgba(156, 163, 175, 0.35)",
      linkHover: "rgba(209, 213, 219, 0.95)",
      text: "#ffffff",
      nodeStroke: "#151b23",
    },
  };

  const COLORS = {
    post: "#f5b14c",
    tag: "#ffe8a3",
  };

  const BASE_SIZES = {
    post: 5,
    tag: 8,
  };

  const POST_SIZE_MIN = 4;
  const POST_SIZE_MAX = 12;

  function detectTheme(container) {
    const bg = window.getComputedStyle(container).backgroundColor;
    if (!bg || bg === "rgba(0, 0, 0, 0)") return "light";
    const match = bg.match(/\d+/g);
    if (match) {
      const brightness = (parseInt(match[0]) + parseInt(match[1]) + parseInt(match[2])) / 3;
      return brightness < 80 ? "dark" : "light";
    }
    return "light";
  }

  function initGraph(containerId, dataUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMini = options.mini || false;
    const width = container.clientWidth || 800;
    const height = isMini ? 300 : Math.max(500, container.clientHeight || window.innerHeight - 250);
    const theme = THEMES[detectTheme(container)];

    const existingSvg = container.querySelector("svg");
    if (existingSvg) {
      if (existingSvg.__lightTimer) {
        existingSvg.__lightTimer.stop();
      }
      existingSvg.remove();
    }

    const svg = d3
      .select(container)
      .insert("svg", ":first-child")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    fetch(dataUrl)
      .then((r) => r.json())
      .then((data) => {
        if (isMini) {
          data = trimData(data, 40);
        }
        renderGraph(g, data, width, height, isMini, svg, zoom, theme);
        if (!isMini) {
          setupControls(data, g, theme);
          setupSearch(data, g, theme);
        }
      })
      .catch((err) => {
        container.innerHTML =
          '<p style="text-align:center;color:#94a3b8;padding:2rem;">그래프 데이터를 불러올 수 없습니다.</p>';
        console.error("Graph data load error:", err);
      });
  }

  function trimData(data, maxNodes) {
    const tagNodes = data.nodes
      .filter((n) => n.type === "tag")
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10);

    const tagIds = new Set(tagNodes.map((n) => n.id));

    const relevantLinks = data.links.filter(
      (l) => tagIds.has(l.target) || tagIds.has(l.source)
    );
    const relevantPostIds = new Set();
    relevantLinks.forEach((l) => {
      relevantPostIds.add(l.source);
      relevantPostIds.add(l.target);
    });

    const postNodes = data.nodes
      .filter((n) => n.type !== "tag" && relevantPostIds.has(n.id))
      .slice(0, maxNodes - tagNodes.length);

    const allNodes = [...tagNodes, ...postNodes];
    const allIds = new Set(allNodes.map((n) => n.id));

    return {
      nodes: allNodes,
      links: data.links.filter(
        (l) => allIds.has(l.source) && allIds.has(l.target)
      ),
    };
  }

  function renderGraph(g, data, width, height, isMini, svg, zoom, theme) {
    const postLengthStats = buildPostLengthStats(data);
    const glowAssets = ensureGlowAssets(svg, isMini);

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(isMini ? 42 : 62)
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => {
          if (d.type === "post") return isMini ? -20 : -38;
          if (d.type === "tag") return isMini ? -8 : -14;
          return isMini ? -18 : -34;
        })
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(isMini ? 0.02 : 0.012))
      .force("y", d3.forceY(height / 2).strength(isMini ? 0.02 : 0.012))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) =>
            getNodeRadius(d, postLengthStats) + (d.type === "post" ? 4.5 : 2.5)
          )
      );

    const link = g
      .append("g")
      .attr("class", "graph-links")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", theme.link)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6);

    const lightLayer = g.append("g").attr("class", "graph-connection-lights");
    const lightTimer = initConnectionLights(lightLayer, data, svg, isMini);
    if (lightTimer) {
      svg.node().__lightTimer = lightTimer;
    }

    const node = g
      .append("g")
      .attr("class", "graph-nodes")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", (d) => `graph-node graph-node--${d.type}`)
      .style("cursor", "pointer")
      .call(drag(simulation));

    node
      .append("circle")
      .attr("class", "graph-node-glow")
      .attr("r", (d) => getNodeRadius(d, postLengthStats) * (isMini ? 1.9 : 2.2))
      .attr(
        "fill",
        (d) =>
          `url(#${
            glowAssets.gradientIds[d.type] || glowAssets.gradientIds.post
          })`
      )
      .attr("filter", `url(#${glowAssets.filterId})`)
      .attr("pointer-events", "none");

    node
      .append("circle")
      .attr("r", (d) => getNodeRadius(d, postLengthStats))
      .attr("fill", (d) => COLORS[d.type] || COLORS.post)
      .attr("stroke", theme.nodeStroke)
      .attr("stroke-width", 1.5);

    if (!isMini) {
      node
        .append("text")
        .attr("class", "graph-label")
        .text((d) => truncateLabel(d.label, 16))
        .attr("text-anchor", "middle")
        .attr("dy", (d) => getNodeRadius(d, postLengthStats) + 12)
        .attr("font-size", (d) => (d.type === "tag" ? "11px" : "10px"))
        .attr("fill", theme.text)
        .style("opacity", (d) => (d.type === "tag" ? 1 : 0))
        .attr("pointer-events", "none");
    }

    node.on("click", (event, d) => {
      if (d.url) window.location.href = d.url;
    });

    const tooltip = document.getElementById("graph-tooltip");
    if (tooltip) {
      node
        .on("mouseover", (event, d) => {
          tooltip.style.display = "block";
          tooltip.innerHTML = buildTooltip(d);
          tooltip.style.left = event.clientX + 12 + "px";
          tooltip.style.top = event.clientY - 10 + "px";
          highlightConnections(d, node, link, data, theme);
        })
        .on("mousemove", (event) => {
          tooltip.style.left = event.clientX + 12 + "px";
          tooltip.style.top = event.clientY - 10 + "px";
        })
        .on("mouseout", () => {
          tooltip.style.display = "none";
          resetHighlight(node, link, theme);
        });
    }

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    svg.node().__graphData = data;
    svg.node().__simulation = simulation;
    svg.node().__theme = theme;
  }

  function ensureGlowAssets(svg, isMini) {
    const suffix = isMini ? "mini" : "main";
    const glowFilterId = `graph-node-glow-${suffix}`;
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");

    if (defs.select(`#${glowFilterId}`).empty()) {
      const filter = defs
        .append("filter")
        .attr("id", glowFilterId)
        .attr("x", "-120%")
        .attr("y", "-120%")
        .attr("width", "340%")
        .attr("height", "340%");

      filter
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", isMini ? 1.3 : 1.7)
        .attr("result", "blur");

      filter
        .append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur"])
        .enter()
        .append("feMergeNode")
        .attr("in", (d) => d);
    }

    const gradientIds = {};
    Object.entries(COLORS).forEach(([type, color]) => {
      const gradientId = `graph-node-glow-grad-${type}-${suffix}`;
      gradientIds[type] = gradientId;

      if (!defs.select(`#${gradientId}`).empty()) return;

      const gradient = defs
        .append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", isMini ? 0.42 : 0.5);

      gradient
        .append("stop")
        .attr("offset", "42%")
        .attr("stop-color", color)
        .attr("stop-opacity", isMini ? 0.14 : 0.2);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0);
    });

    return {
      filterId: glowFilterId,
      gradientIds,
    };
  }

  function initConnectionLights(lightLayer, data, svg, isMini) {
    const nodeCount = data.nodes.length;
    if (nodeCount === 0 || data.links.length === 0) return null;

    const assets = ensureConnectionLightAssets(svg, isMini);
    const lightCount = Math.min(
      isMini ? 20 : 34,
      Math.max(isMini ? 2 : 4, Math.round(nodeCount * (isMini ? 0.06 : 0.09)))
    );

    const adjacency = buildAdjacencyMap(data.links);
    const lights = Array.from({ length: lightCount }, () =>
      createRandomLightState(data.links, adjacency, isMini)
    );

    const lightSelection = lightLayer
      .selectAll("circle")
      .data(lights)
      .join("circle")
      .attr("r", isMini ? 3.4 : 4.3)
      .attr("fill", `url(#${assets.gradientId})`)
      .attr("filter", `url(#${assets.filterId})`)
      .attr("pointer-events", "none");

    let lastTime = performance.now();
    const timer = d3.timer(() => {
      const svgNode = svg.node();
      if (!svgNode || !document.contains(svgNode)) {
        timer.stop();
        return;
      }

      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      lights.forEach((light) => updateLightState(light, adjacency, now, dt, isMini));

      lightSelection
        .attr("cx", (d) => d.x || 0)
        .attr("cy", (d) => d.y || 0)
        .attr("opacity", (d) => (d.state === "dwelling" ? 0 : 0.78));
    });

    return timer;
  }

  function ensureConnectionLightAssets(svg, isMini) {
    const suffix = isMini ? "mini" : "main";
    const filterId = `graph-connection-light-filter-${suffix}`;
    const gradientId = `graph-connection-light-grad-${suffix}`;
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");

    if (defs.select(`#${gradientId}`).empty()) {
      const gradient = defs
        .append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fffbe8")
        .attr("stop-opacity", 0.98);

      gradient
        .append("stop")
        .attr("offset", "30%")
        .attr("stop-color", "#ffd88f")
        .attr("stop-opacity", isMini ? 0.36 : 0.42);

      gradient
        .append("stop")
        .attr("offset", "72%")
        .attr("stop-color", "#ffd88f")
        .attr("stop-opacity", 0);
    }

    if (defs.select(`#${filterId}`).empty()) {
      const filter = defs
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-180%")
        .attr("y", "-180%")
        .attr("width", "460%")
        .attr("height", "460%");

      filter
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", isMini ? 0.7 : 1.0)
        .attr("result", "blur");

      filter
        .append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur"])
        .enter()
        .append("feMergeNode")
        .attr("in", (d) => d);
    }

    return { gradientId, filterId };
  }

  function createRandomLightState(links, adjacency, isMini) {
    const baseLink = links[Math.floor(Math.random() * links.length)];
    const sourceId = getNodeId(baseLink.source);
    const targetId = getNodeId(baseLink.target);
    const forward = Math.random() > 0.5;

    return {
      state: "moving",
      currentLink: baseLink,
      fromNodeId: forward ? sourceId : targetId,
      toNodeId: forward ? targetId : sourceId,
      progress: Math.random(),
      speed: randomInRange(isMini ? 1.32 : 1.08, isMini ? 3.12 : 2.4),
      prevLink: null,
      dwellUntil: 0,
      x: 0,
      y: 0,
      adjacency,
    };
  }

  function updateLightState(light, adjacency, now, dt, isMini) {
    if (light.state === "dwelling") {
      const currentNode = light.currentNodeId;
      const next = pickNextLink(adjacency, currentNode, light.prevLink);
      if (now >= light.dwellUntil && next) {
        const sourceId = getNodeId(next.source);
        const targetId = getNodeId(next.target);
        light.currentLink = next;
        light.fromNodeId = sourceId === currentNode ? sourceId : targetId;
        light.toNodeId = sourceId === currentNode ? targetId : sourceId;
        light.progress = 0;
        light.speed = randomInRange(isMini ? 1.32 : 1.08, isMini ? 3.12 : 2.4);
        light.state = "moving";
      } else {
        const nodeObj =
          light.currentLink &&
          (getNodeId(light.currentLink.source) === currentNode
            ? light.currentLink.source
            : light.currentLink.target);
        if (nodeObj && typeof nodeObj.x === "number" && typeof nodeObj.y === "number") {
          light.x = nodeObj.x;
          light.y = nodeObj.y;
        }
      }
      return;
    }

    const fromNode =
      getNodeId(light.currentLink.source) === light.fromNodeId
        ? light.currentLink.source
        : light.currentLink.target;
    const toNode =
      getNodeId(light.currentLink.source) === light.fromNodeId
        ? light.currentLink.target
        : light.currentLink.source;

    if (!fromNode || !toNode) return;
    if (typeof fromNode.x !== "number" || typeof toNode.x !== "number") return;

    light.progress += light.speed * dt;
    if (light.progress >= 1) {
      light.progress = 1;
    }

    light.x = fromNode.x + (toNode.x - fromNode.x) * light.progress;
    light.y = fromNode.y + (toNode.y - fromNode.y) * light.progress;

    if (light.progress >= 1) {
      light.state = "dwelling";
      light.currentNodeId = light.toNodeId;
      light.prevLink = light.currentLink;
      light.dwellUntil = now + randomInRange(220, 1200);
    }
  }

  function buildAdjacencyMap(links) {
    const adjacency = {};
    links.forEach((link) => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      if (!sourceId || !targetId) return;
      if (!adjacency[sourceId]) adjacency[sourceId] = [];
      if (!adjacency[targetId]) adjacency[targetId] = [];
      adjacency[sourceId].push(link);
      adjacency[targetId].push(link);
    });
    return adjacency;
  }

  function pickNextLink(adjacency, nodeId, prevLink) {
    const candidates = adjacency[nodeId] || [];
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const pool =
      prevLink && candidates.length > 1
        ? candidates.filter((link) => link !== prevLink)
        : candidates;
    const targetPool = pool.length > 0 ? pool : candidates;
    return targetPool[Math.floor(Math.random() * targetPool.length)];
  }

  function getNodeId(nodeOrId) {
    return typeof nodeOrId === "object" ? nodeOrId.id : nodeOrId;
  }

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildPostLengthStats(data) {
    const lengths = data.nodes
      .filter((n) => n.type === "post")
      .map((n) => Number(n.content_length) || 0)
      .filter((len) => len > 0);

    if (lengths.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
    };
  }

  function getNodeRadius(node, postLengthStats) {
    if (node.type !== "post") {
      return BASE_SIZES[node.type] || 5;
    }

    const rawLength = Number(node.content_length) || 0;
    const clampedLength = Math.max(0, rawLength);
    const range = postLengthStats.max - postLengthStats.min;

    if (range <= 0) {
      return BASE_SIZES.post;
    }

    const logMin = Math.log1p(postLengthStats.min);
    const logMax = Math.log1p(postLengthStats.max);
    const logRange = logMax - logMin;

    if (logRange <= 0) {
      return BASE_SIZES.post;
    }

    const normalized = clamp01((Math.log1p(clampedLength) - logMin) / logRange);
    return POST_SIZE_MIN + normalized * (POST_SIZE_MAX - POST_SIZE_MIN);
  }

  function clamp01(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  function highlightConnections(d, node, link, data, theme) {
    const connectedIds = new Set();
    connectedIds.add(d.id);

    data.links.forEach((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      if (sourceId === d.id) connectedIds.add(targetId);
      if (targetId === d.id) connectedIds.add(sourceId);
    });

    node.style("opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.15));
    node
      .selectAll("text.graph-label")
      .style("opacity", (n) =>
        n.type === "tag" ? 1 : connectedIds.has(n.id) ? 1 : 0
      );

    link
      .attr("stroke", (l) => {
        const sid = typeof l.source === "object" ? l.source.id : l.source;
        const tid = typeof l.target === "object" ? l.target.id : l.target;
        return sid === d.id || tid === d.id ? theme.linkHover : theme.link;
      })
      .attr("stroke-opacity", (l) => {
        const sid = typeof l.source === "object" ? l.source.id : l.source;
        const tid = typeof l.target === "object" ? l.target.id : l.target;
        return sid === d.id || tid === d.id ? 1 : 0.1;
      })
      .attr("stroke-width", (l) => {
        const sid = typeof l.source === "object" ? l.source.id : l.source;
        const tid = typeof l.target === "object" ? l.target.id : l.target;
        return sid === d.id || tid === d.id ? 2 : 1;
      });
  }

  function resetHighlight(node, link, theme) {
    node.style("opacity", 1);
    node
      .selectAll("text.graph-label")
      .style("opacity", (d) => (d.type === "tag" ? 1 : 0));
    link
      .attr("stroke", theme.link)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);
  }

  function buildTooltip(d) {
    let html = `<strong>${d.label}</strong>`;
    if (d.type === "tag") {
      html += `<br><span class="tt-type">태그</span>`;
      if (d.count) html += ` &middot; ${d.count}개의 글`;
    } else {
      html += `<br><span class="tt-type">글</span>`;
      if (d.date) html += ` &middot; ${d.date}`;
    }
    if (d.tags && d.tags.length > 0) {
      html += `<br><span class="tt-tags">${d.tags.join(" &middot; ")}</span>`;
    }
    return html;
  }

  function truncateLabel(label, max) {
    return label.length > max ? label.substring(0, max) + "\u2026" : label;
  }

  function setupControls(data, g, theme) {
    const buttons = document.querySelectorAll(".graph-filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;

        g.selectAll(".graph-node").style("opacity", (d) => {
          if (filter === "all") return 1;
          return d.type === filter ? 1 : 0.1;
        });

        g.selectAll(".graph-links line").attr("stroke-opacity", (l) => {
          if (filter === "all") return 0.6;
          const sid = typeof l.source === "object" ? l.source : { type: "" };
          const tid = typeof l.target === "object" ? l.target : { type: "" };
          return sid.type === filter || tid.type === filter ? 0.6 : 0.05;
        });
      });
    });
  }

  function setupSearch(data, g, theme) {
    const input = document.getElementById("graph-search");
    if (!input) return;

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        g.selectAll(".graph-node").style("opacity", 1);
        g.selectAll(".graph-links line").attr("stroke-opacity", 0.6);
        return;
      }

      g.selectAll(".graph-node").style("opacity", (d) =>
        d.label.toLowerCase().includes(query) ? 1 : 0.15
      );
    });
  }

  function drag(simulation) {
    return d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const graphContainer = document.getElementById("graph-container");
    if (graphContainer) {
      initGraph("graph-container", "/assets/js/graph-data.json", {
        mini: false,
      });
    }

    const miniContainer = document.getElementById("mini-graph-container");
    if (miniContainer) {
      initGraph("mini-graph-container", "/assets/js/graph-data.json", {
        mini: true,
      });
    }
  });
})();
