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

import chekered from "../assets/textures/checkered.png";
import Player from "./player";
import Mountain from "./moutain";
import Decors from "./decors";
import Buoy from "./buoy";
import { GlobalManager } from "./globalmanager";
import { CannonJSPlugin } from "babylonjs";

//TODO : VARIABLE LEVELs
const LEVELS = {
  name: "level1",
  width: 40,
  height: 40,
  rows: [
    "                BBBBB                   ",
    "                B S B                   ",
    "                B   B                   ",
    "                B   B BBBBBBBBBBBBB     ",
    "                B   B B  Q   Q    B     ",
    "                B   BBB     BBB   B     ",
    "                B          B M B  B     ",
    "                BD D       B   B  B     ",
    "                BBBBBBBBBBBB   B  B     ",
    "                               B  B     ",
    "                               B  B     ",
    "                               B  B     ",
    "                               B  B     ",
    "                               B  B     ",
    "                BBBBBBBBBBBBBBBB  B     ",
    "                B                 B     ",
    "        BBBBBBBBB                 B     ",
    "        B                      Z  B     ",
    "        B    BBBBBBBBBBBBBBBBBBBBBB     ",
    "        B    B                          ",
    "        B    BBBBB                      ",
    "        BBB      BB                     ",
    "         BBBBBBB   BB                   ",
    "               BB   BB                  ",
    "                B     B                 ",
    "                 BBB   B                ",
    "                   BB   B               ",
    "                    BB  BB              ",
    "                     B   B              ",
    "                     BB   B             ",
    "                     BB   B             ",
    "                     B  F  B            ",
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

        let wall;
        let buoy;
        let mountain;
        let finishline;
        let hasNeighbor;
        let texture;
        let material;
        let animation;
        let miniMountain;
        // let wallDepth;
        // Vérification

        switch (currentCell) {
          case "S":
            this.spawnPoint = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              3,
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

            wall = MeshBuilder.CreateBox(
              "ENDWALL",
              {
                height: 50,
                width: 50,
                depth: 50,
              },
              GlobalManager.scene
            );
            wall.checkCollisions = true;
            wall.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              0,
              y * scaleFactor - this.mapsize / 2
            );
            wall.scaling = new Vector3(0.9, 0.5, 0.05);
            wall.isVisible = false;
            break;
          case "M":
            //TODO Ajouter un murc

            wall = SceneLoader.ImportMeshAsync(
              "",
              "",
              mountain1MeshUrl,
              GlobalManager.scene
            );
            wall.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                -50,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(0.15, 0.15, 0.15);
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
            //TODO Ajouter un murc
            miniMountain = new Decors(
              new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2
              ),
              mountain2MeshUrl,
              new Vector3(0.15, 0.15, 0.15)
            );
            miniMountain.init();
            break;
          case "D":
            //TODO Ajouter un murc

            wall = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            wall.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
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

            wall = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            wall.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
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

            wall = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            wall.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2 + 8
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.rotate(Vector3.Up(), Math.PI);
              mesh.name = "Arrow";

              mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                childMesh.checkCollisions = true;
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
          case "W":
            //TODO Ajouter un mur
            // wallWidth = 50;
            // wallHeight = 50;
            // wallDepth = 50;
            wall = MeshBuilder.CreateBox(
              "wall",
              {
                height: 30,
                width: 30,
                depth: 30,
              },
              GlobalManager.scene
            );
            // wall.checkCollisions = true;
            wall.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              15,
              y * scaleFactor - this.mapsize / 2
            );
            wall.scaling = new Vector3(1, 1, 1);
            wall.material = new StandardMaterial(
              "wallMaterial",
              GlobalManager.scene
            );
            wall.material.diffuseColor = new Color3(1, 0, 0);

            wall.physicsImpostor = new PhysicsImpostor(
              wall,
              PhysicsImpostor.BoxImpostor,
              { mass: 0, restitution: 0 }
            );

            break;
          case "B":
            // buoy = new Buoy(new Vector3(x* scaleFactor - this.mapsize / 2 , 15, y * scaleFactor - this.mapsize / 2 ));
            // await buoy.initBuoy();
            // this.buoys.push(buoy);
            mountain = new Mountain(
              new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2
              )
            );
            mountain.init();
            wall = MeshBuilder.CreateBox(
              "barrier",
              {
                height: 2,
                width: 30,
                depth: 30,
              },
              GlobalManager.scene
            );
            wall.checkCollisions = true;
            wall.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              2.5,
              y * scaleFactor - this.mapsize / 2
            );
            // wall.scaling = new Vector3(0.8335, 1, 0.0005);

            wall.material = new StandardMaterial(
              "wallMaterial",
              GlobalManager.scene
            );
            wall.material.diffuseColor = new Color3(1, 0, 0);
            wall.visibility = 0.5;

            // Assurez-vous que Babylon est correctement importé et initialisé ici

            // Création de la texture
            texture = new Texture(chekered, GlobalManager.scene);

            // Création du matériau
            material = new StandardMaterial(
              "materialForWall",
              GlobalManager.scene
            );
            material.diffuseTexture = texture; // Appliquer la texture comme texture diffuse

            // Appliquer le matériau à la paroi
            wall.material = material;

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
              wall.rotate(Vector3.Up(), Math.PI / 2); // Rotation de 90 degrés
            }
            break;
          case "b":
            // buoy = new Buoy(new Vector3(x* scaleFactor - this.mapsize / 2 , 15, y * scaleFactor - this.mapsize / 2 ));
            // await buoy.initBuoy();
            // this.buoys.push(buoy);
            mountain = new Mountain(
              new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2
              )
            );
            mountain.init();
            wall = MeshBuilder.CreateBox(
              "barriertounr",
              {
                height: 2,
                width: 30,
                depth: 3,
              },
              GlobalManager.scene
            );
            wall.checkCollisions = true;
            wall.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              2.5,
              y * scaleFactor - this.mapsize / 2
            );
            wall.scaling = new Vector3(0.8335, 1, 0.0005);

            wall.material = new StandardMaterial(
              "wallMaterial",
              GlobalManager.scene
            );
            wall.material.diffuseColor = new Color3(1, 0, 0);
            wall.visibility = 0.5;

            // Assurez-vous que Babylon est correctement importé et initialisé ici

            // Création de la texture
            texture = new Texture(chekered, GlobalManager.scene);

            // Création du matériau
            material = new StandardMaterial(
              "materialForWall",
              GlobalManager.scene
            );
            material.diffuseTexture = texture; // Appliquer la texture comme texture diffuse

            // Appliquer le matériau à la paroi
            wall.material = material;
            wall.rotate(Vector3.Up(), Math.PI / 4); // Rotation de 90 degrés
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
    this.drawLevel();

    let player2 = new Player(new Vector3(5, 3, 0));
    await player2.init();

    let player3 = new Player(new Vector3(10, 3, 0));
    await player3.init();

    // const box = MeshBuilder.CreateBox("box", {
    //   height: 75,
    //   width: 75,
    //   depth: 5,
    // });
    // box.checkCollisions = true;
    // box.position = new Vector3(0, 3, 0);

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
    for (let buoy of this.buoys) {
      buoy.update();
    }
    this.player.update(this.inputMap, this.actions);
  }

  async createScene() {
    GlobalManager.scene = new Scene(GlobalManager.engine);

    // GlobalManager.scene.collisionsEnabled = true;
    // const assumedFramesPerSecond = 60;
    // GlobalManager.scene.gravity = new Vector3(
    //   0,
    //   GlobalManager.gravityVector / assumedFramesPerSecond,
    //   0
    // );
    GlobalManager.scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new CannonJSPlugin(true, 10, CANNON)
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
    GlobalManager.camera.attachControl(this.canvas, true);
    GlobalManager.camera.inputs.clear(); // Supprimer les inputs par défaut

    let light = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      GlobalManager.scene
    );

    // Skybox
    let skyboxTexture = CubeTexture.CreateFromImages(
      [
        TropicalSunnyDay_px,
        TropicalSunnyDay_py,
        TropicalSunnyDay_pz,
        TropicalSunnyDay_nx,
        TropicalSunnyDay_ny,
        TropicalSunnyDay_nz,
      ],
      GlobalManager.scene
    );
    const skybox = MeshBuilder.CreateBox(
      "skyBox",
      { size: this.mapsize },
      GlobalManager.scene
    );
    const skyboxMaterial = new StandardMaterial("skyBox", GlobalManager.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    // skybox.infiniteDistance = true;
    // skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = skyboxTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

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
    // water.addToRenderList(skybox);
    water.addToRenderList(ground);

    // Assign the water material
    waterMesh.material = water;

    // const mountain = new Mountain(new Vector3(225, -25, 325));
    // mountain.init();
  }
}

export default Game;
