import {
  FollowCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  SceneLoader,
  Vector2,
  KeyboardEventTypes,
  Color3,
  CubeTexture,
  Mesh,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

import { Inspector } from "@babylonjs/inspector";
import { WaterMaterial } from "@babylonjs/materials";
//Texture :
import floorUrl from "../assets/textures/ground.jpg";
import skyhUrl from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay.jpg";
import waterUrl from "../assets/textures/waterbump.png";
import Player from "./player";
import { GlobalManager } from "./globalmanager";

class Game {
  canvas;
  engine;
  gameScene;
  sphere;
  mapsize = 2048;
  phase = 0.0;
  camera;

  player;
  inputMap = {};
  actions = {};

  constructor(canvas, engine) {
    GlobalManager.engine = engine;
    GlobalManager.canvas = canvas;
  }

  initKeyboard() {
    GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this.inputMap[kbInfo.event.code] = true;
          break;
        case KeyboardEventTypes.KEYUP:
          this.inputMap[kbInfo.event.code] = false;
          this.actions[kbInfo.event.code] = true;
          break;
      }
    });
  }

  async start() {
    await this.initGame();
    this.gameLoop();
    this.endGame();
  }

  async initGame() {
    GlobalManager.engine.displayLoadingUI();
    await this.createScene();
    this.initKeyboard();
    this.player = new Player(new Vector3(0, 3, 0));
    await this.player.init();

    GlobalManager.camera.lockedTarget = this.player.mesh;

    let player2 = new Player(new Vector3(5, 3, 0));
    await player2.init();

    let player3 = new Player(new Vector3(10, 3, 0));
    await player3.init();

    const box = MeshBuilder.CreateBox("box", {
      height: 75,
      width: 75,
      depth: 5,
    });
    box.checkCollisions = true;
    box.position = new Vector3(0, 3, 0);

    GlobalManager.engine.hideLoadingUI();

    //TODO : le bloc suivant à supprimer
    window.addEventListener("keydown", (event) => {
      if (event.key === "i" || event.key === "I") {
        Inspector.Show(this.gameScene, Game);
      }
    });
  }

  endGame() {}

  gameLoop() {
    const divFps = document.getElementById("fps");
    GlobalManager.engine.runRenderLoop(() => {
      GlobalManager.update();
      this.updateGame();
      divFps.innerHTML = GlobalManager.engine.getFps().toFixed() + " fps";
      GlobalManager.scene.render();
    });
  }

  updateGame() {
    this.player.update(this.inputMap, this.actions);
  }

  async createScene() {
    GlobalManager.scene = new Scene(GlobalManager.engine);

    GlobalManager.scene.collisionsEnabled = true;
    const assumedFramesPerSecond = 60;
    GlobalManager.scene.gravity = new Vector3(
      0,
      GlobalManager.gravityVector / assumedFramesPerSecond,
      0
    );

    GlobalManager.camera = new FollowCamera(
      "followCam1",
      new Vector3(0, 5, -10),
      GlobalManager.scene
    );

    // Configurer la caméra
    GlobalManager.camera.radius = 11; // Distance de la cible
    GlobalManager.camera.heightOffset = 2; // Hauteur par rapport à la cible
    GlobalManager.camera.rotationOffset = 180; // Rotation de 90 degrés autour de la cible

    // GlobalManager.camera.inputs.clear();
    GlobalManager.camera.attachControl(this.canvas, true);
    GlobalManager.camera.inputs.clear(); // Supprimer les inputs par défaut

    let light = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      GlobalManager.scene
    );

    // Skybox
    let skybox = Mesh.CreateBox("skyBox", 1000.0, GlobalManager.scene);
    let skyboxMaterial = new StandardMaterial("skyBox", GlobalManager.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new Texture(
      skyhUrl,
      GlobalManager.scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Ground
    let groundMaterial = new StandardMaterial(
      "groundMaterial",
      GlobalManager.scene
    );
    groundMaterial.diffuseTexture = new Texture(floorUrl, GlobalManager.scene);
    groundMaterial.diffuseTexture.uScale =
      groundMaterial.diffuseTexture.vScale = 4;

    let ground = Mesh.CreateGround(
      "ground",
      this.mapsize,
      this.mapsize,
      32,
      GlobalManager.scene,
      false
    );
    ground.position.y = -1;
    ground.material = groundMaterial;

    // Water
    let waterMesh = Mesh.CreateGround(
      "waterMesh",
      this.mapsize,
      this.mapsize,
      32,
      GlobalManager.scene,
      false
    );

    let water = new WaterMaterial("water", GlobalManager.scene);
    water.bumpTexture = new Texture(waterUrl, GlobalManager.scene);

    // Water properties
    water.windForce = -35;
    water.waveHeight = 0.05;
    water.windDirection = new Vector2(1, 1);
    water.waterColor = new Color3(0.1, 0.1, 0.6);
    water.colorBlendFactor = 0.3;
    water.bumpHeight = 0.04;
    water.waveLength = 0.1;

    // Add skybox and ground to the reflection and refraction
    water.addToRenderList(skybox);
    water.addToRenderList(ground);

    // Assign the water material
    waterMesh.material = water;
  }
}

export default Game;
