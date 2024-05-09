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

  initKeyboard() {
    GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:
                this.inputMap[kbInfo.event.code] = true;
                //console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                break;
            case KeyboardEventTypes.KEYUP:
                this.inputMap[kbInfo.event.code] = false;
                this.actions[kbInfo.event.code] = true;
                //console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
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

    Inspector.Show(GlobalManager.scene, Game)
    GlobalManager.engine.hideLoadingUI();

    //TODO : le bloc suivant à supprimer
    window.addEventListener("keydown", (event) => {
      if (event.key === "i" || event.key === "I") {
          Inspector.Show(this.gameScene, Game);
      }
  });

  }

  endGame() { }

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
    // let deltaTime = this.#engine.getDeltaTime();
    // this.#phase += 0.0019 * deltaTime;
    // this.#sphere.position.y = Math.sin(this.#phase); // TODO : SERT POUR LE BOUNCE DU BATEAU
  }



  async createScene () {
    GlobalManager.scene = new Scene(GlobalManager.engine);
    GlobalManager.scene.collisionsEnabled = true;

    GlobalManager.camera = new FollowCamera("followCam", new Vector3(0, 0, 0), GlobalManager.scene);

    // Configurer la caméra
    GlobalManager.camera.radius = 11; // Distance de la cible
    GlobalManager.camera.heightOffset = 2; // Hauteur par rapport à la cible
    GlobalManager.camera.rotationOffset = -90; // Rotation de 90 degrés autour de la cible

    // Attacher la caméra au canvas sans permettre le contrôle utilisateur
    GlobalManager.camera.attachControl(this.canvas, true);
    GlobalManager.camera.inputs.clear(); 

    let light = new HemisphericLight("light1", new Vector3(0, 1, 0), GlobalManager.scene);

    // Skybox
    let skybox = Mesh.CreateBox("skyBox", 1000.0, GlobalManager.scene);
    let skyboxMaterial = new StandardMaterial("skyBox", GlobalManager.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new Texture(skyhUrl, GlobalManager.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Ground
    let groundMaterial = new StandardMaterial("groundMaterial", GlobalManager.scene);
    groundMaterial.diffuseTexture = new Texture(floorUrl, GlobalManager.scene);
    groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;

    let ground = Mesh.CreateGround("ground", this.mapsize, this.mapsize, 32, GlobalManager.scene, false);
    ground.position.y = -1;
    ground.material = groundMaterial;

    // Water
    let waterMesh = Mesh.CreateGround("waterMesh", this.mapsize, this.mapsize, 32, GlobalManager.scene, false);

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
