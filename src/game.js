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
  Color3,
  Color4,
  CubeTexture,
  Mesh,
  StandardMaterial,
  Texture,
  Quaternion,
  PhysicsImpostor,
} from "@babylonjs/core";

import * as CANNON from "cannon";

import { Inspector } from "@babylonjs/inspector";
import { WaterMaterial } from "@babylonjs/materials";
//Texture :
import floorUrl from "../assets/textures/ground.jpg";
import TropicalSunnyDay_px from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_px.jpg";
import TropicalSunnyDay_nx from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_nx.jpg";
import TropicalSunnyDay_py from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_py.jpg";
import TropicalSunnyDay_ny from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_ny.jpg";
import TropicalSunnyDay_pz from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_pz.jpg";
import TropicalSunnyDay_nz from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_nz.jpg";
import waterUrl from "../assets/textures/waterbump.png";
import startUrl from "../assets/models/starting_line.glb";
import finishUrl from "../assets/models/finish_line.glb";
import mountain1MeshUrl from "../assets/models/mountain1.glb";
import mountain2MeshUrl from "../assets/models/mountain2.glb";
import arrowMeshUrl from "../assets/models/direction_arrows.glb";
import frogMeshUrl from "../assets/models/frog.glb";
import flowersMeshUrl from "../assets/models/pond_pack.glb";
import olympicMeshUrl from "../assets/models/olympic_rings.glb";
import landscapeMeshUrl from "../assets/models/landscape.glb";
import vogueMeshUrl from "../assets/models/vogueMery.glb";

import chekered from "../assets/textures/checkered.png";
import Player from "./player";
import Mountain from "./moutain";
import Buoy from "./buoy";
import { GlobalManager } from "./globalmanager";
import { CannonJSPlugin } from "babylonjs";
import Weather from "./weather";

//TODO : VARIABLE LEVELs
const LEVELS = {
  name: "level1",
  width: 40,
  height: 40,
  rows: [
    "                BBBBB                   ",
    "                B   B                   ",
    "                B S B                   ",
    "                B C B BBBBBBBBBBBBB     ",
    "                B P B B  Q   Q    B     ",
    "                B L BBB     BBB   B     ",
    " m              B          B   B  B     ",
    "                BD D       B M B  B     ",
    "                BBBBBBBBBBBB   B  B     ",
    "                               B  B     ",
    "                               B  B     ",
    "       T                       B  B     ",
    "                      O        B  B     ",
    "                               B  B     ",
    "                BBBBBBBBBBBBBBBB  B     ",
    "                B                 B     ",
    "        BBBBBBBBB                 B     ",
    "        B                      Z  B     ",
    "        B    BBBBBBBBBBBBBBBBBBBBBB     ",
    "        B    B                          ",
    "        B    BBBBB                      ",
    "        BBB      BB            V        ",
    "         BBBBBBB   BB                   ",
    "               BB   BB                  ",
    "                B     B                 ",
    "                 BBB   B                ",
    "                   BB   B               ",
    "                    BB  BB              ",
    "                     B   B              ",
    "                     BB   B             ",
    "      m              BB   B             ",
    "                     BbbFbbB            ",
    "                  BBBEEEEEEB            ",
    "                  BBBBBBBBBB            ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
  ],
};

class Game {
  canvas;
  engine;
  gameScene;
  sphere;
  mapsize = 1000;
  phase = 0.0;
  camera;

  player;
  spawnPoint;
  inputMap = {};
  actions = {};

  width;
  height;
  rows;
  buoys = [];

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
  async loadLevel(level) {
    this.width = level.width;
    this.height = level.height;
    this.rows = [];
    for (let y = 0; y < this.height; y++) {
      let currentRow = [];
      for (let x = 0; x < this.width; x++) {
        let tile = level.rows[this.height - 1 - y].charAt(x);
        currentRow.push(tile);
      }
      this.rows.push(currentRow);
    }
  }

  async drawLevel() {
    const scaleFactor = this.mapsize / this.width; // 2000 / 40 = 50
    for (let y = 0; y < this.height; y++) {
      let currentRow = this.rows[y];
      for (let x = 0; x < this.width; x++) {
        let currentCell = currentRow[x];

        let object;
        let buoy;
        let mountain;
        let finishline;
        let hasNeighbor;
        let texture;
        let material;
        let animation;
        let miniMountain;
        // let  objectDepth;
        // Vérification

        switch (currentCell) {
          case "S":
            this.spawnPoint = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              4,
              y * scaleFactor - this.mapsize / 2
            ).clone();
            this.player = new Player(this.spawnPoint);
            await this.player.init();
            GlobalManager.camera.lockedTarget = this.player.mesh;
            break;
          case "F":
            finishline = SceneLoader.ImportMeshAsync(
              "",
              "",
              finishUrl,
              GlobalManager.scene
            );
            finishline.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(3, 3, 3);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "finishline";

              mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            object = MeshBuilder.CreateBox(
              "ENDWALL",
              {
                height: 50,
                width: 50,
                depth: 50,
              },
              GlobalManager.scene
            );
            object.checkCollisions = true;
            object.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              0,
              y * scaleFactor - this.mapsize / 2
            );
            object.scaling = new Vector3(0.9, 0.5, 0.05);
            object.isVisible = false;
            break;
          case "M":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              mountain1MeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(0.12, 0.12, 0.12);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Mountain";

              // mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                // childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "m":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              mountain2MeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(50, 50, 50);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "mountain";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "L":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              landscapeMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(10, 10, 10);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Landscape";

              mesh.rotate(Vector3.Up(), Math.PI/2);

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "O":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              olympicMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(5, 5, 5);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Olympic";

              // mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                // childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "V":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              vogueMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(50, 50, 50);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "VogueMery";
              mesh.rotate(Vector3.Up(), Math.PI);

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "D":

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.rotate(Vector3.Up(), Math.PI);
              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;

          case "Z":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();

              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;
          case "Q":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2 + 8
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.rotate(Vector3.Up(), Math.PI);
              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;
          case "b":
            mountain = new Mountain(
              new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              )
            );
            await mountain.init();
            break;
          case "B":
            object = MeshBuilder.CreateBox(
              "barrier",
              {
                height: 2,
                width: 30,
                depth: 30,
              },
              GlobalManager.scene
            );
            object.checkCollisions = true;
            object.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              4.5,
              y * scaleFactor - this.mapsize / 2
            );
            //  object.scaling = new Vector3(0.8335, 1, 0.0005);

            object.material = new StandardMaterial(
              "wallMaterial",
              GlobalManager.scene
            );
            object.material.diffuseColor = new Color3(1, 0, 0);
            object.visibility = 0.5;

            // Création de la texture
            texture = new Texture(chekered, GlobalManager.scene);

            // Création du matériau
            material = new StandardMaterial(
              "materialForWall",
              GlobalManager.scene
            );
            material.diffuseTexture = texture; // Appliquer la texture comme texture diffuse

            // Appliquer le matériau à la paroi
            object.material = material;

            hasNeighbor = false;
            if (x > 0 && currentRow[x - 1] === "B") {
              // Vérifier le voisin à gauche
              hasNeighbor = true;
            }
            if (x < this.width - 1 && currentRow[x + 1] === "B") {
              // Vérifier le voisin à droite
              hasNeighbor = true;
            }

            // Appliquer la rotation seulement s'il y a un voisin à gauche ou à droite
            if (!hasNeighbor) {
              object.rotate(Vector3.Up(), Math.PI / 2); // Rotation de 90 degrés
            }
            break;
          default:
            break;
        }
      }
    }
  }

  disposeLevel() {
    GlobalManager.scene.meshes.forEach((mesh) => {
      if (mesh.name === "wall") {
        mesh.dispose();
      }
    });
  }

  async initGame() {
    GlobalManager.engine.displayLoadingUI();
    await this.createScene();
    this.initKeyboard();
    // MANQUE LA GESTION DES STATES
    await this.loadLevel(LEVELS);
    await this.drawLevel();

    const weather = new Weather(this.player);
    await weather.setWeather(1);
   
    GlobalManager.engine.hideLoadingUI();

    //TODO : le bloc suivant à supprimer
    window.addEventListener("keydown", (event) => {
      if (event.key === "i" || event.key === "I") {
        Inspector.Show(this.gameScene, Game);
      }
    });
    //TODO : le bloc suivant à supprimer
    window.addEventListener("keydown", (event) => {
      if (event.key === "r" || event.key === "R") {
        this.respawn();
      }
    });
  }

  endGame() {}

  respawn() {
    this.player.mesh.position = this.spawnPoint;
    this.player.mesh.rotationQuaternion = Quaternion.Identity();
  }

  gameLoop() {
    const divFps = document.getElementById("fps");
    const time = document.getElementById("time");
    GlobalManager.engine.runRenderLoop(() => {
      GlobalManager.update();
      this.updateGame();
      divFps.innerHTML = GlobalManager.engine.getFps().toFixed() + " fps";
      // time.innerHTML = GlobalManager.deltaTime + "secondes";
      GlobalManager.scene.render();
    });
  }

  updateGame() {
    if (typeof this.player !== 'undefined' && typeof this.player.mesh !== 'undefined') {
      this.player.update(this.inputMap, this.actions);
    }
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
    // GlobalManager.scene.enablePhysics(
    //   new Vector3(0, -9.81, 0),
    //   new CannonJSPlugin(true, 10, CANNON)
    // );

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
