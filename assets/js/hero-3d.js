(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0d1117, 1);

  const NODE_COUNT = 120;
  const EDGE_COUNT = 160;

  const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const nodes = [];
  const nodeColors = [0x7c8cff, 0x94a3b8, 0x58a6ff, 0x8b5cf6, 0x6ee7b7];

  for (let i = 0; i < NODE_COUNT; i++) {
    const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];
    const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(nodeGeo, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 20
    );
    mesh.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.005
      ),
      baseScale: 0.6 + Math.random() * 1.2,
    };
    mesh.scale.setScalar(mesh.userData.baseScale);

    scene.add(mesh);
    nodes.push(mesh);
  }

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x7c8cff,
    transparent: true,
    opacity: 0.12,
  });

  const edges = [];
  for (let i = 0; i < EDGE_COUNT; i++) {
    const a = Math.floor(Math.random() * NODE_COUNT);
    let b = Math.floor(Math.random() * NODE_COUNT);
    if (b === a) b = (b + 1) % NODE_COUNT;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const line = new THREE.Line(geo, edgeMat);
    line.userData = { a: a, b: b };
    scene.add(line);
    edges.push(line);
  }

  const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const glowCount = 8;
  const glows = [];
  for (let i = 0; i < glowCount; i++) {
    const glowMat = new THREE.MeshBasicMaterial({
      color: nodeColors[i % nodeColors.length],
      transparent: true,
      opacity: 0.06,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(nodes[i * Math.floor(NODE_COUNT / glowCount)].position);
    glow.scale.setScalar(3 + Math.random() * 4);
    scene.add(glow);
    glows.push(glow);
  }

  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    const t = Date.now() * 0.001;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.position.add(n.userData.velocity);

      if (Math.abs(n.position.x) > 22) n.userData.velocity.x *= -1;
      if (Math.abs(n.position.y) > 14) n.userData.velocity.y *= -1;
      if (Math.abs(n.position.z) > 12) n.userData.velocity.z *= -1;

      const pulse = 1 + Math.sin(t * 1.5 + i * 0.3) * 0.15;
      n.scale.setScalar(n.userData.baseScale * pulse);
    }

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const pa = nodes[e.userData.a].position;
      const pb = nodes[e.userData.b].position;
      const pos = e.geometry.attributes.position.array;
      pos[0] = pa.x; pos[1] = pa.y; pos[2] = pa.z;
      pos[3] = pb.x; pos[4] = pb.y; pos[5] = pb.z;
      e.geometry.attributes.position.needsUpdate = true;

      const dist = pa.distanceTo(pb);
      e.material.opacity = dist < 12 ? 0.15 : 0.03;
    }

    for (let i = 0; i < glows.length; i++) {
      const g = glows[i];
      const refIdx = i * Math.floor(NODE_COUNT / glowCount);
      g.position.lerp(nodes[refIdx].position, 0.02);
      const gPulse = 3 + Math.sin(t * 0.8 + i) * 1.5;
      g.scale.setScalar(gPulse);
      g.material.opacity = 0.04 + Math.sin(t + i) * 0.02;
    }

    renderer.render(scene, camera);
  }

  animate();

  const scrollHint = document.querySelector(".hero-3d__scroll-hint");
  if (scrollHint) {
    scrollHint.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("graph-section");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
