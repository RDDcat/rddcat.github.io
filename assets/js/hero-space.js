/* =========================================================================
   hero-space.js  ―  3D 지식 우주 (Knowledge Universe)
   태그를 계층(트리)으로 세우고, 글은 자기 태그 둘레에 성운처럼 흩뿌린 씬.
   제임스웹 망원경 톤: 보라·푸른 가스 구름, 6갈래 회절 스파이크, 볼류메트릭 글로우.
   ========================================================================= */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

(function () {
  "use strict";

  const canvas = document.getElementById("space-canvas");
  if (!canvas) return;

  const section = document.getElementById("hero-space");
  const tooltip = document.getElementById("space-tooltip");
  const overlay = document.getElementById("hero-space-overlay");
  const enterBtn = document.getElementById("hero-space-enter-btn");
  const filterBtns = Array.from(document.querySelectorAll(".space-filter-btn"));

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- 기본 셋업 --------------------------------------------------------- */
  let W = window.innerWidth;
  let H = window.innerHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060f, 0.0034);

  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 2000);
  camera.position.set(0, 6, 200);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x05060f, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  /* ---- 포스트프로세싱: 볼류메트릭 글로우(블룸) --------------------------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(W, H),
    0.5, // strength — 은은하게
    0.5, // radius
    0.22 // threshold — 밝은 코어만 번지게
  );
  composer.addPass(bloom);

  /* ---- 절차적 텍스처 ----------------------------------------------------- */
  function makeStarTexture(spikes) {
    const s = 256;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d");
    const cx = s / 2;

    const core = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    core.addColorStop(0.0, "rgba(255,255,255,1)");
    core.addColorStop(0.12, "rgba(244,248,255,0.95)");
    core.addColorStop(0.3, "rgba(188,205,255,0.42)");
    core.addColorStop(0.62, "rgba(128,150,255,0.12)");
    core.addColorStop(1.0, "rgba(120,140,255,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, s, s);

    // 제임스웹 회절 스파이크
    if (spikes) {
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < spikes; k++) {
        ctx.save();
        ctx.translate(cx, cx);
        ctx.rotate(((Math.PI * 2) / spikes) * k);
        const lg = ctx.createLinearGradient(0, 0, 0, -cx);
        lg.addColorStop(0.0, "rgba(255,255,255,0.9)");
        lg.addColorStop(0.18, "rgba(216,226,255,0.32)");
        lg.addColorStop(0.55, "rgba(190,205,255,0.08)");
        lg.addColorStop(1.0, "rgba(190,205,255,0)");
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-2.4, -cx * 0.32);
        ctx.lineTo(0, -cx);
        ctx.lineTo(2.4, -cx * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // 제임스웹 망원경 사진 같은 가스 구름 — 프랙탈 노이즈로 필라멘트와
  // 먼지 띠가 또렷한 성운을 절차적으로 합성한다.
  function makeNebulaTexture(seed) {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(s, s);
    const data = img.data;

    // 값 노이즈 — 난수 격자 + smoothstep 보간
    const G = 256;
    const M = G - 1;
    const grid = new Float32Array(G * G);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random();
    function vn(x, y) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const x0 = xi & M;
      const x1 = (xi + 1) & M;
      const y0 = (yi & M) * G;
      const y1 = ((yi + 1) & M) * G;
      const a = grid[x0 + y0];
      const b = grid[x1 + y0];
      const cc = grid[x0 + y1];
      const d = grid[x1 + y1];
      return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
    }
    // fBm — 부드러운 구름 덩어리
    function fbm(x, y, oct) {
      let sum = 0;
      let amp = 0.5;
      let f = 1;
      for (let i = 0; i < oct; i++) {
        sum += amp * vn(x * f, y * f);
        f *= 2.03;
        amp *= 0.5;
      }
      return sum;
    }
    // 난류(turbulence) — 가스가 휘말린 필라멘트 줄기
    function turb(x, y, oct) {
      let sum = 0;
      let amp = 0.55;
      let f = 1;
      for (let i = 0; i < oct; i++) {
        sum += amp * Math.abs(vn(x * f, y * f) * 2 - 1);
        f *= 2.03;
        amp *= 0.5;
      }
      return sum;
    }
    const lerp = (a, b, t) => a + (b - a) * t;
    const off = (seed || 0) * 19.3 + 0.5;

    for (let py = 0; py < s; py++) {
      for (let px = 0; px < s; px++) {
        const nx = px / s;
        const ny = py / s;
        // 도메인 워핑 — 좌표 자체를 노이즈로 휘어 가스 흐름을 만든다
        const wx =
          nx * 3.1 + off + fbm(nx * 3 + off, ny * 3, 4) * 1.15;
        const wy =
          ny * 3.1 + fbm(nx * 3, ny * 3 + off + 4.7, 4) * 1.15;
        // 난류 밀도 — 대비를 키워 먼지 공동과 밝은 줄기를 또렷하게
        let d = turb(wx, wy, 6);
        d = (d - 0.34) * 2.5;
        d = d <= 0 ? 0 : Math.pow(d > 1 ? 1 : d, 1.55);
        // 색조 — 영역마다 푸른빛 ↔ 보랏빛이 섞이게
        const hue = fbm(nx * 1.7 + off, ny * 1.7, 3);
        let r, g, b;
        if (d < 0.55) {
          const k = d / 0.55;
          r = lerp(14, lerp(58, 124, hue), k);
          g = lerp(11, 58, k);
          b = lerp(44, 196, k);
        } else {
          const k = (d - 0.55) / 0.45;
          r = lerp(lerp(58, 124, hue), 214, k);
          g = lerp(58, 178, k);
          b = lerp(196, 248, k);
        }
        // 원형 마스크 — 스프라이트 사각 경계를 숨긴다
        const cx = nx - 0.5;
        const cy = ny - 0.5;
        let mask = 1 - (cx * cx + cy * cy) * 3.5;
        mask = mask <= 0 ? 0 : mask * mask;
        const idx = (py * s + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = d * mask * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const postTexture = makeStarTexture(6);
  const tagTexture = makeStarTexture(6);
  const softTexture = makeStarTexture(0);
  const nebulaTextures = [
    makeNebulaTexture(1),
    makeNebulaTexture(2),
    makeNebulaTexture(3),
    makeNebulaTexture(4),
    makeNebulaTexture(5),
  ];

  /* ---- 가스 구름 (배경 네뷸라) ------------------------------------------ */
  const nebulaGroup = new THREE.Group();
  scene.add(nebulaGroup);
  const nebulae = [];
  const nebulaTints = [0xcabdff, 0xb7c6ff, 0xd6c2ff, 0xb0ccff, 0xc7b3ff];
  // 깊이별로 층층이 — [개수, 스케일하한, 스케일폭, z하한, z폭, 불투명도하한, 불투명도폭]
  const nebulaLayers = [
    [3, 660, 320, -640, 180, 0.62, 0.18], // 먼 배경막 — 화면을 가득 채운다
    [5, 320, 220, -380, 220, 0.5, 0.2], // 중간 깊이 가스 구름
    [4, 150, 130, -170, 120, 0.32, 0.18], // 가까운 옅은 가스 띠
  ];
  nebulaLayers.forEach((L) => {
    for (let i = 0; i < L[0]; i++) {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: nebulaTextures[(Math.random() * nebulaTextures.length) | 0],
          color: nebulaTints[(Math.random() * nebulaTints.length) | 0],
          transparent: true,
          opacity: L[5] + Math.random() * L[6],
          blending: THREE.NormalBlending,
          depthWrite: false,
          depthTest: false,
          fog: false,
        })
      );
      const w = L[1] + Math.random() * L[2];
      sp.scale.set(w, w * (0.62 + Math.random() * 0.7), 1);
      sp.position.set(
        (Math.random() - 0.5) * 540,
        (Math.random() - 0.5) * 330,
        L[3] - Math.random() * L[4]
      );
      sp.material.rotation = Math.random() * Math.PI * 2;
      sp.userData.spin = (Math.random() - 0.5) * 0.00012;
      sp.userData.drift = (Math.random() - 0.5) * 0.009;
      nebulaGroup.add(sp);
      nebulae.push(sp);
    }
  });

  /* ---- 딥 스타필드 (배경 별 — 다층 구성) -------------------------------- */
  (function buildStarfield() {
    const tints = [
      [1.0, 1.0, 1.0],
      [0.74, 0.82, 1.0],
      [0.86, 0.78, 1.0],
      [0.78, 0.9, 1.0],
      [1.0, 0.88, 0.74],
    ];
    // [별 개수, 점 크기, 밝기 하한, 밝기 폭] — 멀수록 촘촘하고 어둡게
    const layers = [
      [5400, 0.85, 0.16, 0.4],
      [2600, 1.5, 0.36, 0.5],
      [780, 2.4, 0.55, 0.4],
    ];
    layers.forEach((layer) => {
      const count = layer[0];
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1150;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 780;
        pos[i * 3 + 2] = -Math.random() * 920 + 90;
        const t = tints[(Math.random() * tints.length) | 0];
        const b = layer[2] + Math.random() * layer[3];
        col[i * 3] = t[0] * b;
        col[i * 3 + 1] = t[1] * b;
        col[i * 3 + 2] = t[2] * b;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: layer[1],
        sizeAttenuation: true,
        map: softTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Points(geo, mat));
    });
  })();

  /* ---- 우주(트리) 컨테이너 ---------------------------------------------- */
  const universe = new THREE.Group();
  scene.add(universe);

  const postSprites = []; // 글 별
  const tagSprites = []; // 태그 별 (실제 태그 + 가상 분류)
  const clusterNebulae = []; // 글 군집 성운
  let pickable = [];
  let treeLines = null;

  const dataUrl = canvas.dataset.graph || "/assets/js/graph-data.json";
  const treeUrl = canvas.dataset.tree || "/assets/js/tag-tree.json";

  Promise.all([
    fetch(dataUrl).then((r) => r.json()),
    fetch(treeUrl)
      .then((r) => r.json())
      .catch(() => []),
  ])
    .then(([data, tree]) => buildUniverse(data, tree))
    .catch((err) => console.error("[hero-space] data load failed:", err));

  /* ---- 우주 구축: 태그 트리 + 글 성운 ----------------------------------- */
  function buildUniverse(data, treeRaw) {
    /* 1) 트리 정의 정규화 (문자열 잎 / 객체 노드 혼용 허용) */
    function normalize(node) {
      if (typeof node === "string") return { name: node, children: [] };
      return {
        name: node.name,
        children: (node.children || []).map(normalize),
      };
    }
    let roots = (treeRaw || []).map(normalize);

    /* 2) graph-data 의 태그/글 노드 인덱싱 */
    const graphTagByLabel = {};
    const graphPosts = [];
    data.nodes.forEach((n) => {
      if (n.type === "tag") graphTagByLabel[n.label] = n;
      else if (n.type === "post") graphPosts.push(n);
    });

    /* 3) 트리에 없는 태그는 자동으로 루트로 승격 (예: 기술정리) */
    const inTree = new Set();
    (function walk(ns) {
      ns.forEach((n) => {
        inTree.add(n.name);
        walk(n.children);
      });
    })(roots);
    Object.keys(graphTagByLabel).forEach((label) => {
      if (!inTree.has(label)) roots.push({ name: label, children: [] });
    });

    /* 4) 트리 노드 객체 생성 */
    const tagNodes = [];
    const tagNodeByName = {};
    function makeNode(def, depth, parent) {
      const g = graphTagByLabel[def.name] || null;
      const t = {
        name: def.name,
        depth: depth,
        parent: parent,
        children: [],
        graph: g, // 실제 태그면 graph 노드, 가상 분류면 null
        isVirtual: !g,
        pos: new THREE.Vector3(),
        postCount: 0,
      };
      tagNodes.push(t);
      tagNodeByName[t.name] = t;
      t.children = def.children.map((c) => makeNode(c, depth + 1, t));
      return t;
    }
    const rootNodes = roots.map((r) => makeNode(r, 0, null));

    /* 5) 유기적 배치 — 부모-자식 관계(가지)는 유지하되, 격자 트리처럼
       보이지 않도록 가지가 3D 공간 곳곳으로 자연스럽게 뻗어 나가게 한다. */
    function randomDir() {
      // 구면 위의 균일한 임의 방향
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      return new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a));
    }
    function branchOut(node) {
      const ch = node.children;
      if (!ch.length) return;
      // 바깥으로 자라는 기준 방향 — 조부모→부모 방향을 잇고, 없으면 임의
      let outward;
      if (node.parent) {
        outward = node.pos.clone().sub(node.parent.pos);
        outward =
          outward.lengthSq() < 0.001 ? randomDir() : outward.normalize();
      } else {
        outward = randomDir();
      }
      ch.forEach((c) => {
        // 기준 방향을 중심으로 넓게 흩어진 방향 (격자감 제거)
        const dir = outward
          .clone()
          .multiplyScalar(0.5)
          .add(randomDir().multiplyScalar(1.0))
          .normalize();
        const len = Math.max(
          13,
          23 - node.depth * 4.5 + (Math.random() - 0.5) * 12
        );
        c.pos.copy(node.pos).addScaledVector(dir, len);
        branchOut(c);
      });
    }
    // 루트들을 공간에 유기적으로 흩뿌린 뒤 가지치기
    rootNodes.forEach((r) => {
      const d = randomDir();
      const rad = 8 + Math.random() * 20;
      r.pos.set(d.x * rad * 1.2, d.y * rad * 0.78, d.z * rad * 1.05);
      branchOut(r);
    });

    /* 6) 글을 가장 깊은(구체적인) 태그에 귀속 → 그 둘레에 성운처럼 배치 */
    graphPosts.forEach((p) => {
      let host = null;
      (p.tags || []).forEach((name) => {
        const t = tagNodeByName[name];
        if (t && (!host || t.depth > host.depth)) host = t;
      });
      if (!host) host = rootNodes[0]; // 트리 밖 글은 첫 루트로
      host.postCount++;
      // 태그를 둘러싼 구형 성운 — 어느 한쪽으로 치우치지 않게
      const cloud = 5 + Math.random() * 9;
      p.pos = randomDir()
        .multiplyScalar(cloud * (0.55 + Math.random() * 0.7))
        .add(host.pos);
      p.host = host;
    });

    /* 7) 글 별(스프라이트) */
    const lens = graphPosts.map((p) => p.content_length || 0);
    const maxLen = Math.max(1, ...lens);
    graphPosts.forEach((p) => {
      const norm = Math.sqrt((p.content_length || 0) / maxLen);
      const size = 2.4 + norm * 3.3;
      const mat = new THREE.SpriteMaterial({
        map: postTexture,
        color: new THREE.Color().setHSL(
          0.55 + Math.random() * 0.1,
          0.55,
          0.72
        ),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.copy(p.pos);
      sp.scale.setScalar(size);
      sp.userData = {
        node: p,
        base: size,
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 1.1,
        kind: "post",
      };
      universe.add(sp);
      postSprites.push(sp);
    });

    /* 8) 태그 별(스프라이트) — 가상 분류는 크고 부드럽게, 실제 태그는 또렷하게 */
    function descendantPosts(t) {
      let s = t.postCount;
      t.children.forEach((c) => (s += descendantPosts(c)));
      return s;
    }
    tagNodes.forEach((t) => {
      const total = descendantPosts(t);
      let size, color, tex, op;
      if (t.isVirtual) {
        size = 5.6 + Math.min(10, total) * 0.32;
        color = new THREE.Color().setHSL(0.72, 0.4, 0.82);
        tex = softTexture;
        op = 0.95;
      } else {
        size = 3.0 + Math.min(14, t.graph.count || 1) * 0.32;
        color = new THREE.Color().setHSL(
          0.73 + Math.random() * 0.06,
          0.62,
          0.66
        );
        tex = tagTexture;
        op = 0.95;
      }
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: color,
        transparent: true,
        opacity: op,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.copy(t.pos);
      sp.scale.setScalar(size);
      sp.userData = {
        node: t,
        base: size,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.7,
        kind: t.isVirtual ? "category" : "tag",
      };
      universe.add(sp);
      tagSprites.push(sp);

      /* 9) 글이 모인 태그엔 작은 성운을 깔아 "성운처럼" 보이게 */
      if (t.postCount >= 2) {
        const nb = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: nebulaTextures[tagNodes.indexOf(t) % nebulaTextures.length],
            color: nebulaTints[tagNodes.indexOf(t) % nebulaTints.length],
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            fog: false,
          })
        );
        const ns = 24 + Math.min(20, t.postCount) * 2.4;
        nb.scale.set(ns, ns, 1);
        nb.position.set(t.pos.x, t.pos.y - 6, t.pos.z);
        nb.userData.spin = (Math.random() - 0.5) * 0.0003;
        universe.add(nb);
        clusterNebulae.push(nb);
      }
    });

    /* 10) 트리 가지 — 부모 태그 → 자식 태그 연결선 */
    const segs = [];
    tagNodes.forEach((t) => {
      if (t.parent) {
        segs.push(
          t.parent.pos.x,
          t.parent.pos.y,
          t.parent.pos.z,
          t.pos.x,
          t.pos.y,
          t.pos.z
        );
      }
    });
    if (segs.length) {
      const lgeo = new THREE.BufferGeometry();
      lgeo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(segs), 3)
      );
      const lmat = new THREE.LineBasicMaterial({
        color: 0x8a7bff,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
      });
      treeLines = new THREE.LineSegments(lgeo, lmat);
      universe.add(treeLines);
    }

    pickable = postSprites.concat(tagSprites);
  }

  /* ---- 필터 ------------------------------------------------------------- */
  let currentFilter = "all";
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      const showPost = currentFilter !== "tag";
      const showTag = currentFilter !== "post";
      postSprites.forEach((s) => (s.visible = showPost));
      tagSprites.forEach((s) => (s.visible = showTag));
      clusterNebulae.forEach((s) => (s.visible = showPost));
      if (treeLines) treeLines.visible = showTag;
    });
  });

  /* ---- 인터랙션: 호버 / 클릭 -------------------------------------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let pointerX = 0,
    pointerY = 0;
  let mouseClientX = 0,
    mouseClientY = 0;
  let entered = false;

  function onPointerMove(e) {
    mouseClientX = e.clientX;
    mouseClientY = e.clientY;
    pointerX = e.clientX / W - 0.5;
    pointerY = e.clientY / H - 0.5;
    pointer.x = (e.clientX / W) * 2 - 1;
    pointer.y = -(e.clientY / H) * 2 + 1;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function pick() {
    if (!entered || pickable.length === 0) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickable, false);
    for (let i = 0; i < hits.length; i++) {
      if (hits[i].object.visible) return hits[i].object;
    }
    return null;
  }

  function showTooltip(sprite) {
    const u = sprite.userData;
    const n = u.node;
    if (u.kind === "post") {
      tooltip.innerHTML =
        '<span class="space-tip__kind space-tip__kind--post">글</span>' +
        n.label;
    } else if (u.kind === "category") {
      tooltip.innerHTML =
        '<span class="space-tip__kind space-tip__kind--cat">분류</span>' +
        n.name;
    } else {
      const cnt = n.graph ? n.graph.count || 0 : 0;
      tooltip.innerHTML =
        '<span class="space-tip__kind">태그</span>#' +
        n.name +
        ' <span class="space-tip__meta">' +
        cnt +
        "개 글</span>";
    }
    tooltip.style.display = "block";
    const tw = tooltip.offsetWidth;
    let x = mouseClientX + 18;
    if (x + tw > W - 12) x = mouseClientX - tw - 18;
    tooltip.style.left = x + "px";
    tooltip.style.top = mouseClientY + 18 + "px";
  }

  canvas.addEventListener("click", () => {
    if (!hovered) return;
    const u = hovered.userData;
    const url = u.kind === "post" ? u.node.url : u.node.graph && u.node.graph.url;
    if (url) window.location.href = url;
  });

  /* ---- 시네마틱 진입 ---------------------------------------------------- */
  let enterStart = 0;
  const ENTER_DUR = 2600;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      if (entered) return;
      entered = true;
      enterStart = performance.now();
      if (overlay) overlay.classList.add("is-hidden");
      if (section) section.classList.remove("hero-space--locked");
      setTimeout(() => overlay && overlay.remove(), 1100);
    });
  }

  /* ---- 리사이즈 --------------------------------------------------------- */
  window.addEventListener("resize", () => {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    composer.setSize(W, H);
    bloom.setSize(W, H);
  });

  /* ---- 렌더 루프 -------------------------------------------------------- */
  const clock = new THREE.Clock();
  let camZ = 200;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // 진입 카메라 돌리 — 트리가 화면에 들어오는 거리까지
    if (entered) {
      const p = Math.min(1, (performance.now() - enterStart) / ENTER_DUR);
      camZ = 200 + (124 - 200) * easeInOutCubic(p);
    }

    // 패럴럭스
    const px = reducedMotion ? 0 : pointerX;
    const py = reducedMotion ? 0 : pointerY;
    camera.position.x += (px * 24 - camera.position.x) * 0.045;
    camera.position.y += (6 - py * 14 - camera.position.y) * 0.045;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    camera.lookAt(px * 6, 1 - py * 4, 0);

    // 트리는 회전시키지 않고(상하 위계 유지) 아주 약하게만 흔든다
    if (!reducedMotion) {
      universe.rotation.y = Math.sin(t * 0.05) * 0.12;
      nebulaGroup.rotation.z += 0.00006;
      nebulae.forEach((sp) => {
        sp.material.rotation += sp.userData.spin;
        sp.position.x += sp.userData.drift;
      });
      clusterNebulae.forEach((sp) => {
        sp.material.rotation += sp.userData.spin;
      });
    }

    // 별 반짝임
    if (!reducedMotion) {
      for (let i = 0; i < postSprites.length; i++) {
        const s = postSprites[i];
        if (s === hovered) continue;
        const u = s.userData;
        s.scale.setScalar(
          u.base * (1 + Math.sin(t * u.speed + u.phase) * 0.13)
        );
      }
      for (let i = 0; i < tagSprites.length; i++) {
        const s = tagSprites[i];
        if (s === hovered) continue;
        const u = s.userData;
        s.scale.setScalar(
          u.base * (1 + Math.sin(t * u.speed + u.phase) * 0.08)
        );
      }
    }

    // 호버 처리
    const hit = pick();
    if (hit !== hovered) {
      if (hovered) {
        hovered.scale.setScalar(hovered.userData.base);
        hovered.material.color.offsetHSL(0, 0, -0.18);
      }
      hovered = hit;
      if (hovered) {
        hovered.scale.setScalar(hovered.userData.base * 1.7);
        hovered.material.color.offsetHSL(0, 0, 0.18);
        showTooltip(hovered);
        canvas.style.cursor = "pointer";
      } else {
        tooltip.style.display = "none";
        canvas.style.cursor = "default";
      }
    } else if (hovered) {
      showTooltip(hovered);
    }

    composer.render();
  }
  animate();
})();
