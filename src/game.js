import {
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  SceneLoader,
  Vector2,
} from "@babylonjs/core";
import {
  ArcRotateCamera,
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
class Game {
  #canvas;
  #engine;
  #gameScene;
  #sphere;
  #mapsize = 2048;
  #phase = 0.0;

  constructor(canvas, engine) {
    this.#canvas = canvas;
    this.#engine = engine;
  }

  start() {
    this.initGame();
    this.gameLoop();
    this.endGame();
  }

  initGame() {
    this.#gameScene = this.createScene();
    Inspector.Show(this.#gameScene,Game)
  }

  endGame() {}

  gameLoop() {
    const divFps = document.getElementById("fps");
    this.#engine.runRenderLoop(() => {
      this.updateGame();
      divFps.innerHTML = this.#engine.getFps().toFixed() + " fps";
      this.#gameScene.render();
    });
  }

  updateGame() {
    // let deltaTime = this.#engine.getDeltaTime();
    // this.#phase += 0.0019 * deltaTime;
    // this.#sphere.position.y = Math.sin(this.#phase); // TODO : SERT POUR LE BOUNCE DU BATEAU
  }

  //   createScene() {
//     const scene = new Scene(this.#engine);
//     const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
//     camera.setTarget(Vector3.Zero());
//     camera.attachControl(this.#canvas, true);
//     const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
//     light.intensity = 0.7;
//     const sphere = MeshBuilder.CreateSphere(
//       "sphere",
//       { diameter: 2, segments: 32 },
//       scene
//     );
//     this.#sphere = sphere;
//     sphere.position.y = 1;
//     const ground = MeshBuilder.CreateGround(
//       "ground",
//       { width: 6, height: 6 },
//       scene
//     );
//     const matGround = new StandardMaterial("boue", scene);
//     matGround.diffuseColor = new Color3(1, 0.4, 0);
//     ground.material = matGround;
//     return scene;
//   }

  createScene = function () {
	const scene = new Scene(this.#engine);

	let camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, Vector3.Zero(), scene);
	camera.attachControl(this.#canvas, true);

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
	
	let ground = Mesh.CreateGround("ground", this.#mapsize, this.#mapsize, 32, scene, false);
	ground.position.y = -1;
	ground.material = groundMaterial;
		
	// Water
	let waterMesh = Mesh.CreateGround("waterMesh", this.#mapsize, this.#mapsize, 32, scene, false);
	
	let water = new WaterMaterial("water", scene);
	water.bumpTexture = new Texture(waterUrl, scene);
	
	// Water properties
	water.windForce = -35;
	water.waveHeight = 0.7;
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
