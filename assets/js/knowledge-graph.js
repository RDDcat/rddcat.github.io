(function () {
  "use strict";

  const COLORS = {
    post: "#6366f1",
    tag: "#f59e0b",
    project: "#10b981",
    link: "#e2e8f0",
    linkHover: "#94a3b8",
    bg: "#ffffff",
    text: "#1e293b",
    textMuted: "#64748b",
  };

  const SIZES = {
    post: 5,
    tag: 8,
    project: 7,
  };

  function initGraph(containerId, dataUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMini = options.mini || false;
    const width = container.clientWidth || 800;
    const height = isMini ? 300 : Math.max(500, window.innerHeight - 250);

    container.innerHTML = "";

    const svg = d3
      .select(container)
      .append("svg")
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
        renderGraph(g, data, width, height, isMini, svg, zoom);
        if (!isMini) {
          setupControls(data, g);
          setupSearch(data, g);
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

    const relevantLinks = data.links.filter((l) => tagIds.has(l.target) || tagIds.has(l.source));
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
      links: data.links.filter((l) => allIds.has(l.source) && allIds.has(l.target)),
    };
  }

  function renderGraph(g, data, width, height, isMini, svg, zoom) {
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(isMini ? 40 : 60)
      )
      .force("charge", d3.forceManyBody().strength(isMini ? -40 : -80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (SIZES[d.type] || 5) + 2)
      );

    const link = g
      .append("g")
      .attr("class", "graph-links")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", COLORS.link)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6);

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
      .attr("r", (d) => SIZES[d.type] || 5)
      .attr("fill", (d) => COLORS[d.type] || COLORS.post)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    if (!isMini) {
      node
        .append("text")
        .text((d) => truncateLabel(d.label, 16))
        .attr("dx", (d) => (SIZES[d.type] || 5) + 4)
        .attr("dy", "0.35em")
        .attr("font-size", (d) => (d.type === "tag" ? "11px" : "10px"))
        .attr("fill", COLORS.text)
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

          highlightConnections(d, node, link, data);
        })
        .on("mousemove", (event) => {
          tooltip.style.left = event.clientX + 12 + "px";
          tooltip.style.top = event.clientY - 10 + "px";
        })
        .on("mouseout", () => {
          tooltip.style.display = "none";
          resetHighlight(node, link);
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
  }

  function highlightConnections(d, node, link, data) {
    const connectedIds = new Set();
    connectedIds.add(d.id);

    data.links.forEach((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      if (sourceId === d.id) connectedIds.add(targetId);
      if (targetId === d.id) connectedIds.add(sourceId);
    });

    node.style("opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.15));

    link
      .attr("stroke", (l) => {
        const sid = typeof l.source === "object" ? l.source.id : l.source;
        const tid = typeof l.target === "object" ? l.target.id : l.target;
        return sid === d.id || tid === d.id ? COLORS.linkHover : COLORS.link;
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

  function resetHighlight(node, link) {
    node.style("opacity", 1);
    link
      .attr("stroke", COLORS.link)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);
  }

  function buildTooltip(d) {
    let html = `<strong>${d.label}</strong>`;
    if (d.type === "tag") {
      html += `<br><span class="tt-type">태그</span>`;
      if (d.count) html += ` · ${d.count}개의 글`;
    } else if (d.type === "project") {
      html += `<br><span class="tt-type">프로젝트</span>`;
      if (d.date) html += ` · ${d.date}`;
    } else {
      html += `<br><span class="tt-type">글</span>`;
      if (d.date) html += ` · ${d.date}`;
    }
    if (d.tags && d.tags.length > 0) {
      html += `<br><span class="tt-tags">${d.tags.join(" · ")}</span>`;
    }
    return html;
  }

  function truncateLabel(label, max) {
    return label.length > max ? label.substring(0, max) + "…" : label;
  }

  function setupControls(data, g) {
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

  function setupSearch(data, g) {
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
