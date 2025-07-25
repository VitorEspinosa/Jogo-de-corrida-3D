import * as THREE from 'three';


// Cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Loader e LoadingManager para garantir texturas carregadas
const loadingManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadingManager);

// Carregando texturas do cenário
const textures = {
  sky: loader.load('../texturas/ceu.avif'),
  asphalt: loader.load('../texturas/asfhalto.jpg'),
  building: loader.load('../texturas/prédio.avif'),
  houseBase: loader.load('../texturas/casa.jpg'),
  houseRoof: loader.load('../texturas/telhado.avif'),
};

// Quando todas as texturas estiverem carregadas, configura a cena e inicia
loadingManager.onLoad = () => {
  scene.background = textures.sky;

  // Textura asfalto - repeat
  const asphaltTexture = textures.asphalt;
  asphaltTexture.wrapS = THREE.RepeatWrapping;
  asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(10, 80);

  // Pista
  const trackWidth = 24;
  const trackLength = 1600;
  const planeGeometry = new THREE.PlaneGeometry(trackWidth, trackLength);
  const planeMaterial = new THREE.MeshLambertMaterial({ map: asphaltTexture });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Laterais de grama (aumentada em 50%)
  const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
  const grassWidthTotal = 50 * 1.5;  // 75
  const sideGrassWidth = (grassWidthTotal - trackWidth) / 2;

  const leftGrass = new THREE.Mesh(new THREE.BoxGeometry(sideGrassWidth, 0.1, trackLength), grassMaterial);
  leftGrass.position.set(-trackWidth / 2 - sideGrassWidth / 2, -0.49, 0);
  scene.add(leftGrass);

  const rightGrass = new THREE.Mesh(new THREE.BoxGeometry(sideGrassWidth, 0.1, trackLength), grassMaterial);
  rightGrass.position.set(trackWidth / 2 + sideGrassWidth / 2, -0.49, 0);
  scene.add(rightGrass);

  // Paredes da pista
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const wallHeight = 2;
  const wallLength = trackLength;
  const wallThickness = 0.5;

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
  leftWall.position.set(-trackWidth / 2, wallHeight / 2, 0);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
  rightWall.position.set(trackWidth / 2, wallHeight / 2, 0);
  scene.add(rightWall);

  // Função para criar prédios e casas com texturas e árvore opcional
  function createBuildingOrHouseWithOptionalTree(x, z) {
    const group = new THREE.Group();

    // Decide aleatoriamente se é prédio ou casa
    const isBuilding = Math.random() > 0.4;

    let structure;
    if (isBuilding) {
      const height = 10 + Math.random() * 10;
      structure = new THREE.Mesh(
        new THREE.BoxGeometry(5, height, 5),
        new THREE.MeshLambertMaterial({ map: textures.building })
      );
      structure.position.y = height / 2;
    } else {
      const house = new THREE.Group();

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 5),
        new THREE.MeshLambertMaterial({ map: textures.houseBase })
      );
      base.position.y = 1.5;
      house.add(base);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.8, 2.5, 4),
        new THREE.MeshLambertMaterial({ map: textures.houseRoof })
      );
      roof.position.y = 4;
      roof.rotation.y = Math.PI / 4;
      house.add(roof);

      structure = house;
    }

    group.add(structure);

    // Árvores opcionais (70% de chance)
    if (Math.random() < 0.7) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2),
        new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      );
      trunk.position.set(-3, 1, 0);
      group.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x228b22 })
      );
      leaves.position.set(-3, 2.5, 0);
      group.add(leaves);
    }

    group.position.set(x, 0, z);
    scene.add(group);
  }

  // Distribui construções em duas fileiras densas de cada lado da pista (aumentado a densidade e fileiras)
  for (let z = -trackLength / 2; z < trackLength / 2; z += 10) {  // Menor espaçamento para mais construções
    createBuildingOrHouseWithOptionalTree(-19, z);
    createBuildingOrHouseWithOptionalTree(-25, z + 5);
    createBuildingOrHouseWithOptionalTree(-31, z + 10); // fileira extra à esquerda
    createBuildingOrHouseWithOptionalTree(19, z);
    createBuildingOrHouseWithOptionalTree(25, z + 5);
    createBuildingOrHouseWithOptionalTree(31, z + 10);  // fileira extra à direita
  }

  // Função para criar um carro estilo fusca
  function createFusca(color = 0xffff00) {
    const car = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 4), new THREE.MeshLambertMaterial({ color }));
    body.position.y = 0.5;
    car.add(body);

    const hood = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 1.5, 16, 1, false, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color })
    );
    hood.rotation.z = Math.PI / 2;
    hood.position.set(0, 1, 1.50);
    car.add(hood);

    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

    const wheelPositions = [
      [-1, 0.2, 1.5],
      [1, 0.2, 1.5],
      [-1, 0.2, -0.60],
      [1, 0.2, -1.5],
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(...pos);
      car.add(wheel);
    });

    return car;
  }

  // Jogador
  const player = createFusca(0xffff00);
  player.position.set(0, 0, 0);
  scene.add(player);

  // Obstáculos - carros inimigos
  const obstacles = [];
  const enemyColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffa500];

  // Obstáculos extras - pedrinhas pequenas
  const stones = [];
  const stoneGeometry = new THREE.DodecahedronGeometry(0.3);
  const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });

  // Spawn de obstáculo (carros)
  function spawnObstacle() {
    const color = enemyColors[Math.floor(Math.random() * enemyColors.length)];
    const enemyCar = createFusca(color);
    enemyCar.position.set((Math.random() - 0.5) * (trackWidth - 4), 0, player.position.z - 100);
    scene.add(enemyCar);
    obstacles.push(enemyCar);
  }

  // Spawn de pedrinhas
  function spawnStone() {
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.position.set((Math.random() - 0.5) * (trackWidth - 2), 0.15, player.position.z - 80);
    scene.add(stone);
    stones.push(stone);
  }

  // Controles
  let moveLeft = false, moveRight = false, moveForward = false, moveBackward = false;
  const playerSpeed = 0.20;  // Velocidade reduzida

  document.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
      case 'arrowleft': case 'a': moveLeft = true; break;
      case 'arrowright': case 'd': moveRight = true; break;
      case 'arrowup': case 'w': moveForward = true; break;
      case 'arrowdown': case 's': moveBackward = true; break;
    }
  });
  document.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
      case 'arrowleft': case 'a': moveLeft = false; break;
      case 'arrowright': case 'd': moveRight = false; break;
      case 'arrowup': case 'w': moveForward = false; break;
      case 'arrowdown': case 's': moveBackward = false; break;
    }
  });

  // Função para ativar controle pelos botões na tela (touch e mouse)
  function setupTouchControls() {
    function activateMovement(direction, isActive) {
      switch (direction) {
        case 'left': moveLeft = isActive; break;
        case 'right': moveRight = isActive; break;
        case 'forward': moveForward = isActive; break;
        case 'backward': moveBackward = isActive; break;
      }
    }

    const buttonsInfo = [
      { id: 'leftBtn', direction: 'left' },
      { id: 'upBtn', direction: 'forward' },
      { id: 'downBtn', direction: 'backward' },
      { id: 'rightBtn', direction: 'right' },
    ];

    buttonsInfo.forEach(({ id, direction }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      btn.addEventListener('mousedown', () => activateMovement(direction, true));
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        activateMovement(direction, true);
      }, { passive: false });

      btn.addEventListener('mouseup', () => activateMovement(direction, false));
      btn.addEventListener('mouseleave', () => activateMovement(direction, false));
      btn.addEventListener('touchend', () => activateMovement(direction, false));
      btn.addEventListener('touchcancel', () => activateMovement(direction, false));
    });
  }
  setupTouchControls();

  // Inicialização da câmera
  camera.position.set(0, 5, 12);
  camera.lookAt(0, 0, 0);

  let obstacleSpawnCounter = 0;
  let stoneSpawnCounter = 0;
  let spawnInterval = 40; // Spawn mais frequente de obstáculos e pedras
  let gameSpeed = 0.18;
  const finishLineZ = -trackLength / 2 + 20;

  // Túnel final
  const tunnelGroup = new THREE.Group();
  const tunnelRadius = trackWidth / 2 + 2;
  const tunnelLength = 40;
  const tunnelGeometry = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, 1, true);
  const tunnelMaterial = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.BackSide });
  const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
  tunnel.rotation.x = Math.PI / 2;
  tunnel.position.z = finishLineZ - tunnelLength / 2;
  tunnelGroup.add(tunnel);

  const finishLineGeometry = new THREE.PlaneGeometry(trackWidth, 4);
  const finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
  finishLine.position.set(0, 1, finishLineZ);
  tunnelGroup.add(finishLine);

  scene.add(tunnelGroup);

  // Iluminação
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Colisão simples (caixas)
  function checkCollision(obj1, obj2, margin = 0.5) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    // Diminuir caixa para pedrinhas
    box1.expandByScalar(-margin);
    box2.expandByScalar(-margin);
    return box1.intersectsBox(box2);
  }

  let gameOver = false;

  function endGame(message) {
    if (!gameOver) {
      alert(message);
      gameOver = true;
    }
  }

  // Atualiza posição do jogador com limites laterais e limite para trás, mas sem limite para frente (linha de chegada)
  function updatePlayer() {
    if (moveLeft) player.position.x -= playerSpeed;
    if (moveRight) player.position.x += playerSpeed;
    if (moveForward) player.position.z -= playerSpeed;
    if (moveBackward) player.position.z += playerSpeed;

    // Limite lateral da pista
    const halfTrack = trackWidth / 2 - 1.25;
    if (player.position.x < -halfTrack) player.position.x = -halfTrack;
    if (player.position.x > halfTrack) player.position.x = halfTrack;

    // Limite para não sair para trás
    const maxZ = 10;
    if (player.position.z > maxZ) player.position.z = maxZ;

    // Sem limite mínimo para o z, para permitir passar a linha de chegada
  }

  function animate() {
    if (gameOver) return;

    requestAnimationFrame(animate);

    updatePlayer();

    // Move a câmera acompanhando o player
    camera.position.z = player.position.z + 12;
    camera.position.x = player.position.x;
    camera.lookAt(player.position.x, 0, player.position.z);

    // Spawn obstáculos
    obstacleSpawnCounter++;
    stoneSpawnCounter++;

    if (obstacleSpawnCounter > spawnInterval) {
      spawnObstacle();
      obstacleSpawnCounter = 0;
    }

    if (stoneSpawnCounter > spawnInterval * 1.5) {
      spawnStone();
      stoneSpawnCounter = 0;
    }

    // Move obstáculos (carros inimigos)
    obstacles.forEach((obstacle, index) => {
      obstacle.position.z += gameSpeed * 1.2;

      if (obstacle.position.z > player.position.z + 10) {
        scene.remove(obstacle);
        obstacles.splice(index, 1);
      } else if (checkCollision(player, obstacle)) {
        endGame('Você bateu em um carro inimigo! Game Over!, reinicie o navegador e tente novamente');
      }
    });

    // Move pedrinhas
    stones.forEach((stone, index) => {
      stone.position.z += gameSpeed * 1.2;

      if (stone.position.z > player.position.z + 10) {
        scene.remove(stone);
        stones.splice(index, 1);
      } else if (checkCollision(player, stone, 0.3)) {
        endGame('Você bateu em uma pedrinha! Game Over!, reinicie o navegador e tente novamente');
      }
    });

    // Verifica se passou da linha de chegada
    if (player.position.z <= finishLineZ) {
      alert('Parabéns, você terminou a corrida!');
      gameOver = true;
    }

    renderer.render(scene, camera);
  }

  animate();
};

// timer.js

let startTime = null;
let timerInterval = null;
let finalTime = null;

const timerDisplay = document.getElementById('timer');
const finishMessage = document.getElementById('finishMessage');

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    if (finalTime !== null) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Tempo: ${elapsed}s`;
  }, 1000);
}

// Função pública para finalizar o tempo
export function finishGameTimer() {
  if (finalTime !== null) return;
  finalTime = Math.floor((Date.now() - startTime) / 1000);
  clearInterval(timerInterval);
  finishMessage.textContent = `🏁 Você terminou em ${finalTime} segundos!`;
  finishMessage.classList.remove('hidden');
}

// Começa o cronômetro automaticamente
startTimer();


