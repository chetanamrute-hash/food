import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const canvas = document.querySelector("#burger-canvas");
if (canvas) {
  const host = canvas.parentElement;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    console.error("FoodieGo could not start the 3D burger renderer.", error);
  }

  if (renderer) {
    host.classList.add("three-ready");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.15, 7.7);
    const burger = new THREE.Group();
    scene.add(burger);
    const material = (color, roughness = 0.72) => new THREE.MeshStandardMaterial({ color, roughness });

    function addLayer(name, geometry, surface, y, scale = [1, 1, 1], rotation = 0) {
      const piece = new THREE.Mesh(geometry, surface);
      piece.name = name;
      piece.position.y = y;
      piece.scale.set(...scale);
      piece.rotation.y = rotation;
      piece.castShadow = true;
      piece.receiveShadow = true;
      burger.add(piece);
    }

    // Build the burger from simple 3D shapes so it needs no separate model download.
    const bun = material("#e9a443");
    const toasted = material("#d88a32");
    const patty = material("#57301f");
    const cheese = material("#ffcb45", 0.48);
    const lettuce = material("#62a94d", 0.65);
    const tomato = material("#df4932", 0.45);
    const sesame = material("#fff0cf", 0.5);

    addLayer("bottom bun", new THREE.CylinderGeometry(1.34, 1.42, 0.37, 48), bun, -0.75, [1, 0.9, 0.83]);
    addLayer("toasted rim", new THREE.TorusGeometry(1.28, 0.105, 10, 48), toasted, -0.56, [1, 0.82, 0.84]);
    addLayer("lettuce", new THREE.CylinderGeometry(1.53, 1.49, 0.13, 48), lettuce, -0.39, [1, 0.7, 0.81]);
    addLayer("tomato", new THREE.CylinderGeometry(1.4, 1.4, 0.17, 48), tomato, -0.22, [1, 0.8, 0.83]);
    addLayer("cheese", new THREE.BoxGeometry(2.55, 0.14, 2.26), cheese, -0.04, [1, 1, 0.84], 0.16);
    addLayer("beef patty", new THREE.CylinderGeometry(1.38, 1.45, 0.48, 48, 2), patty, 0.26, [1, 0.78, 0.82]);
    addLayer("melted cheese", new THREE.BoxGeometry(2.47, 0.15, 2.2), cheese, 0.56, [1, 1, 0.83], -0.1);
    addLayer("bottom of crown", new THREE.CylinderGeometry(1.35, 1.41, 0.21, 48), toasted, 0.66, [1, 0.8, 0.84]);
    addLayer("bun crown", new THREE.SphereGeometry(1.35, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2), bun, 0.76, [1, 0.75, 0.83]);

    const seedGeometry = new THREE.SphereGeometry(0.055, 8, 6);
    for (let index = 0; index < 17; index += 1) {
      const angle = index * 2.399;
      const radius = 0.28 + (index % 5) * 0.17;
      const seed = new THREE.Mesh(seedGeometry, sesame);
      seed.position.set(Math.cos(angle) * radius, 1.48 - radius * radius * 0.13, Math.sin(angle) * radius * 0.76);
      seed.rotation.z = angle * 0.7;
      seed.scale.set(1.25, 0.72, 0.72);
      seed.castShadow = true;
      burger.add(seed);
    }

    scene.add(new THREE.HemisphereLight("#fff5dd", "#79402c", 2.1));
    const keyLight = new THREE.DirectionalLight("#fff5e3", 3.2);
    keyLight.position.set(-3.5, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    scene.add(keyLight);
    const fillLight = new THREE.PointLight("#ff9d59", 1.1, 12);
    fillLight.position.set(3, 0.5, 3.5);
    scene.add(fillLight);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.65, 48), new THREE.ShadowMaterial({ opacity: 0.17 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.05;
    ground.scale.set(1.15, 0.8, 1);
    ground.receiveShadow = true;
    scene.add(ground);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let frameId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 500 ? 8.6 : 7.7;
      camera.updateProjectionMatrix();
    }

    function animate() {
      frameId = window.requestAnimationFrame(animate);
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      burger.rotation.y = pointerX + (reducedMotion ? 0 : performance.now() * 0.00022);
      burger.rotation.x = pointerY * 0.35;
      burger.position.y = reducedMotion ? 0 : Math.sin(performance.now() * 0.0012) * 0.055;
      renderer.render(scene, camera);
    }

    host.addEventListener("pointermove", (event) => {
      const bounds = host.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.6;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.4;
    });
    host.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!document.hidden && !frameId) animate();
    });
    resize();
    animate();
  }
}
