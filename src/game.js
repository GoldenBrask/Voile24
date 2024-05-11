import {
  FreeCamera,
  FollowCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  SceneLoader,
  Vector2,
  KeyboardEventTypes,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import { GlobalManager } from "./globalmanager";
// import { ThinRenderTargetTexture } from "babylonjs"; Bassem : à quoi il sert ?

import Player from "./player";
import Weather from "./weather";



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
    this.player = new Player(new Vector3(0, 4, 0));
    await this.player.init();


    GlobalManager.camera.lockedTarget = this.player.mesh;

    const weather = new Weather(this.player);
    weather.setWeather(1);
    let player2 = new Player(new Vector3(5, 3, 0));
    await player2.init();

    let player3 = new Player(new Vector3(10, 3, 0));
    await player3.init();



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


    //Camera
    GlobalManager.camera = new FollowCamera(
      "followCam1",
      new Vector3(0, 0, 0),
      GlobalManager.scene
    );
    GlobalManager.camera.radius = 12; // Distance de la cible
    GlobalManager.camera.heightOffset = 3; // Hauteur par rapport à la cible
    GlobalManager.camera.rotationOffset = 180; // Rotation de 90 degrés autour de la cible
    GlobalManager.camera.attachControl(this.canvas, true);
    GlobalManager.camera.inputs.clear(); // Supprimer les inputs par défaut

    let light = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      GlobalManager.scene
    );



  }
}

export default Game;
