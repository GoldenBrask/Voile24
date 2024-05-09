import {
  FollowCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  SceneLoader,
  Vector2,
} from "@babylonjs/core";
import {
  FreeCamera,
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

import Player from './player';

import { GlobalManager } from './globalmanager';

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

  async start() {
    await this.initGame();
    this.gameLoop();
    this.endGame();
  }

  async initGame() {
    GlobalManager.engine.displayLoadingUI();
    this.gameScene = this.createScene();
    this.player = new Player(new Vector3(0, 0.5, 0));
    await this.player.init();
   
    this.camera.lockedTarget = this.player.mesh;

    Inspector.Show(this.gameScene, Game)
    GlobalManager.engine.hideLoadingUI();
  }

  endGame() { }

  gameLoop() {
    const divFps = document.getElementById("fps");
    GlobalManager.engine.runRenderLoop(() => {
      this.updateGame();
      divFps.innerHTML = GlobalManager.engine.getFps().toFixed() + " fps";
      this.gameScene.render();
    });
  }

  updateGame() {
    // let deltaTime = this.#engine.getDeltaTime();
    // this.#phase += 0.0019 * deltaTime;
    // this.#sphere.position.y = Math.sin(this.#phase); // TODO : SERT POUR LE BOUNCE DU BATEAU
  }



  createScene = function () {
    const scene = new Scene(GlobalManager.engine);

    this.camera = new FollowCamera("followCam", new Vector3(0, 5, -10), this.scene);

    // Configurer la caméra
    this.camera.radius = 10; // Distance de la cible
    this.camera.heightOffset = 2; // Hauteur par rapport à la cible
    this.camera.rotationOffset = -85; // Rotation de 90 degrés autour de la cible

    // Attacher la caméra au canvas sans permettre le contrôle utilisateur
    this.camera.attachControl(this.canvas, true);
    this.camera.inputs.clear(); 

    let light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    // Skybox
    let skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
    let skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new Texture(skyhUrl, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Ground
    let groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new Texture(floorUrl, scene);
    groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;

    let ground = Mesh.CreateGround("ground", this.mapsize, this.mapsize, 32, scene, false);
    ground.position.y = -1;
    ground.material = groundMaterial;

    // Water
    let waterMesh = Mesh.CreateGround("waterMesh", this.mapsize, this.mapsize, 32, scene, false);

    let water = new WaterMaterial("water", scene);
    water.bumpTexture = new Texture(waterUrl, scene);

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

    return scene;
  }


}

export default Game;
