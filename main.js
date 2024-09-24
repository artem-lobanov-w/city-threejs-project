import {
  WebGL1Renderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  DoubleSide,
  Vector3,
  Raycaster,
  Vector2,
  PointLight,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
  AmbientLight,
  MeshBasicMaterial,
  BoxGeometry,
  Mesh,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MapControls } from "three/addons/controls/MapControls.js";

let scene,
  renderer,
  camera,
  canvas,
  modelCar,
  modelCar2,
  time = 0,
  isDesktop = true,
  pointer = new Vector2(),
  raycaster = new Raycaster(),
  controls;

// ----------------------------------------------
// Настройка сцены
const initScene = () => {
  renderer = new WebGL1Renderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  canvas = renderer.domElement;
  document.body.appendChild(canvas);

  scene = new Scene();
};

// ----------------------------------------------
// Настройка камеры
const initCamera = () => {
  const fov = 35;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;

  camera = new PerspectiveCamera(fov, aspect, near, far);
  if (isDesktop) {
    camera.position.set(5.9, 3.4, 5.2);
  } else {
    camera.position.set(0, 12.4, 0);
  }
};

// ----------------------------------------------
// Анимация перемещения камеры в определённую позицию
const animateCamera = (position) => {
  new TWEEN.Tween(camera.position)
    .to(position, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onComplete(function () {
      TWEEN.remove(this);
    });
}

// ----------------------------------------------
// Настройка управления камерой
const initControls = () => {
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
};

// ----------------------------------------------
// Настройка освещения
const whiteColor = 0xffffff;
const grayColor = 0x807f8a;

const initLights = () => {
  // Настройка основного источника света
  const overHeadLight = new DirectionalLight(grayColor, 15);
  overHeadLight.position.set(-3, 7, 5);
  overHeadLight.castShadow = true;
  overHeadLight.shadow.camera.left = -16;
  overHeadLight.shadow.camera.right = 16;
  overHeadLight.shadow.camera.top = 16;
  overHeadLight.shadow.camera.bottom = -16;
  overHeadLight.shadow.mapSize.width = 2048;
  overHeadLight.shadow.mapSize.height = 2048;

  const sideLight = new DirectionalLight(grayColor, 5);
  sideLight.position.set(6, 2, 3);

  const pointLight = new PointLight(whiteColor, 25);
  pointLight.position.set(7, 6, 0);

  const ambientLight = new AmbientLight(whiteColor, 0.5);

  const arrLight = [overHeadLight, sideLight, pointLight, ambientLight];

  arrLight.forEach((light) => {
    scene.add(light);
  });
};

// ----------------------------------------------
// Предварительная настройка модели авто
const initCar = (model) => {
  model.scale.set(0.1, 0.1, 0.1);
  return model;
};

// ----------------------------------------------
// Предварительная настройка модели города
const initCity = (model) => {
  return model;
};

// ----------------------------------------------
// Инициализация модели
const initModel = (modelURL, model) => {
  if (modelURL === "/car.glb") {
    model = initCar(model);
    modelCar = model;
    createCars(modelCar, carData1);
  } else if (modelURL === "/car2.glb") {
    model = initCar(model);
    modelCar2 = model;
    createCars(modelCar2, carData2);
  } else if (modelURL === "/city6.glb") {
    model = initCity(model);
  }
  return model;
};
// ----------------------------------------------
// Загрузка и предварительная настройка GLTF-модели
const loadGLTFModel = (modelURL) => {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(modelURL, (gltf) => {
    let model = gltf.scene;
    model = initModel(modelURL, model);

    // ----------------------------------------------
    // Донастройка материалов
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.side = DoubleSide;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    if (modelURL === "/city6.glb") {
      scene.add(model);
    }
  });
};

// ----------------------------------------------
// Параметры боксов, отвечающих за границы районов
const yPosition = 1.2;
const redBox = {
  position: [0.9, yPosition, 0.2],
  name: "redBox",
  color: 0xff0000,
};
const greenBox = {
  position: [0.9, yPosition, -3.9],
  name: "greenBox",
  color: 0x00ff00,
};
const blueBox = {
  position: [-4.7, yPosition, 0.2],
  name: "blueBox",
  color: 0x0000ff,
};
const yellowBox = {
  position: [0.9, yPosition, 4.2],
  name: "yellowBox",
  color: 0xffff00,
};
const purpleBox = {
  position: [6.1, yPosition, 0.2],
  name: "purpleBox",
  color: 0xff00ff,
};

// ----------------------------------------------
// Добавление бокса в сцену
const addBox = (name, color, position) => {
  const geometry = new BoxGeometry();
  const material = new MeshBasicMaterial({
    color: color,
    opacity: 0.0,
    transparent: true,
    side: DoubleSide,
  });
  const meshBox = new Mesh(geometry, material);
  meshBox.name = name;
  scene.add(meshBox);

  meshBox.scale.set(4, 2.8, 3);
  meshBox.position.set(position[0], position[1], position[2]);
};

// ----------------------------------------------
// Добавление моделей
const initModels = () => {

  // Загрузка и предварительная настройка GLTF-модели
  const modelURL = ["/city6.glb", "/car.glb", "/car2.glb"];
  for (let i = 0; i < modelURL.length; i++) {
    loadGLTFModel(modelURL[i]);
  }

  // Добавление всех боксов
  const boxes = [redBox, greenBox, blueBox, yellowBox, purpleBox];
  boxes.forEach((box) => {
    addBox(box.name, box.color, box.position);
  });
};

// ----------------------------------------------
// Класс авто
class Car {
  constructor(model, startPosition, direction, distance, offset) {
    this.model = model.clone();
    this.startPosition = startPosition.clone();
    this.currentPosition = startPosition.clone();
    this.offset = offset;
    this.direction = direction.normalize();
    this.model.rotation.y = Math.atan2(this.direction.x, this.direction.z);
    this.distance = distance;
    this.speed = 0.1;
    this.traveledPath = 0;

    scene.add(this.model);
  }

  update() {
    if (this.traveledPath >= this.distance) {
      this.currentPosition.copy(this.startPosition);
      this.traveledPath = 0;
    } else {
      this.currentPosition.addScaledVector(this.direction, this.speed);
      this.traveledPath += this.speed;
    }
    this.model.position.copy(this.currentPosition);
  }
}

let cars = [];

// ----------------------------------------------
// Параметры для машин в зависимости от типа
const carData1 = [
  [new Vector3(3.55, 0, 15), new Vector3(0, 0, -1), 30, 2],
  [new Vector3(-1.85, 0, 25), new Vector3(0, 0, -1), 50, 2],
  [new Vector3(32, 0, 2.05), new Vector3(-1, 0, 0), 16, 2],
  [new Vector3(20, 0, -2), new Vector3(-1, 0, 0), 40, 2],
  [new Vector3(20, 0, 6.1), new Vector3(-1, 0, 0), 40, 2],
];

const carData2 = [
  [new Vector3(3.2, 0, -10), new Vector3(0, 0, 1), 20, 2],
  [new Vector3(-2.2, 0, -11), new Vector3(0, 0, 1), 22, 2],
  [new Vector3(-10, 0, 2.4), new Vector3(1, 0, 0), 20, 2],
  [new Vector3(-17.5, 0, -1.65), new Vector3(1, 0, 0), 35, 2],
  [new Vector3(-17.5, 0, 6.45), new Vector3(1, 0, 0), 35, 2],
];

// ----------------------------------------------
// Добавление машин
const createCars = (modelCar, carData) => {
  const carsToAdd = carData.map(
    ([position, direction, speed, offset]) =>
      new Car(modelCar, position, direction, speed, offset)
  );
  cars.push(...carsToAdd);
};

// ----------------------------------------------
// Обновление моделей авто
const updateCars = () => {
  cars.forEach((car) => {
    car.update();
  });
};

// ----------------------------------------------
// Координаты мыши
const onPointerMove = (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
};
document.addEventListener("pointermove", onPointerMove);

// ----------------------------------------------
// Определение выбранного района и перемещение к нему камеры
const trackIntersections = () => {
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((child) => {
    if (
      child.object.name === "greenBox" ||
      child.object.name === "redBox" ||
      child.object.name === "blueBox" ||
      child.object.name === "yellowBox" ||
      child.object.name === "purpleBox"
    ) {
      const newPosition = child.object.position;
      animateCamera(
        new Vector3(newPosition.x + 5, camera.position.y, newPosition.z + 5)
      );
    } 
  });
};

// ----------------------------------------------
// Отслеживание нажатия мыши
let mouseCoords = new Vector2(0, 0);
let newMouseCoords = new Vector2(0, 0);
document.addEventListener("mousedown", () => {
  mouseCoords = new Vector2(pointer.x, pointer.y);
});
document.addEventListener("mouseup", () => {
  newMouseCoords = new Vector2(pointer.x, pointer.y);
  if (mouseCoords.x !== newMouseCoords.x && mouseCoords.y !== newMouseCoords.y)
    return;
  trackIntersections();
});

// ----------------------------------------------
// Анимация
const animate = () => {
  time += 0.01;
  TWEEN.update();
  updateCars();
  controls.update();
  camera.position.y = 7;
  camera.lookAt(camera.position.x - 5, 0, camera.position.z - 5);

  const canvas = renderer.domElement;
  
  responsiveDesign(canvas);
  if (resizeRendererToDisplaySize(renderer)) {
    
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  render();
  requestAnimationFrame(animate);
};

const render = () => {
  renderer.render(scene, camera);
};

// ----------------------------------------------
// Ресайз
const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const windowWidth = canvas.clientWidth;
  const windowHeight = canvas.clientHeight;
  const needResize =
  canvas.width !== windowWidth || canvas.height !== windowHeight;
  return needResize;
};

// ----------------------------------------------
// Адаптация
const responsiveDesign = (canvas) => {
  canvas = renderer.domElement;
  canvas.style.height = canvas.height + "px";
  if (window.innerWidth < 1000) {
    isDesktop = false;
  } else {
    isDesktop = true;
  }
};

initScene();
initCamera();
initControls();
initLights();
initModels();
animate();
