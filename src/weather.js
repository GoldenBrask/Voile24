import {
  MeshBuilder,
  Vector2,
  Vector3,
  Color3,
  Color4,
  CubeTexture,
  Mesh,
  StandardMaterial,
  Texture,
  ParticleSystem,
  Sound,

} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";
import { WaterMaterial } from "@babylonjs/materials";
import waterUrl from "../assets/textures/waterbump.png";
import floorUrl from "../assets/textures/ground.jpg";
import TropicalSunnyDay_px from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_px.jpg";
import TropicalSunnyDay_nx from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_nx.jpg";
import TropicalSunnyDay_py from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_py.jpg";
import TropicalSunnyDay_ny from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_ny.jpg";
import TropicalSunnyDay_pz from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_pz.jpg";
import TropicalSunnyDay_nz from "../assets/textures/TropicalSunnyDay/TropicalSunnyDay_nz.jpg";
import RainDay_px from "../assets/textures/RainDay/sky_px.jpg";
import RainDay_nx from "../assets/textures/RainDay/sky_nx.jpg";
import RainDay_py from "../assets/textures/RainDay/sky_py.jpg";
import RainDay_ny from "../assets/textures/RainDay/sky_ny.jpg";
import RainDay_pz from "../assets/textures/RainDay/sky_pz.jpg";
import RainDay_nz from "../assets/textures/RainDay/sky_nz.jpg";
import rainDrop from "../assets/textures/raindrop.png";
import seaFileSound from "../assets/sounds/seaSound.mp3";
import rainFileSound from "../assets/sounds/rainSound.mp3";
import rainFileSound2 from "../assets/sounds/rainSound2.mp3";

class Weather {

    player;

    constructor(player){

      this.player = player;

    }
  
    setWeather(choice) {
      switch (choice) {
        case 1:
          this.setupWeather1();
          break;
        case 2:
          this.setupWeather2();
          break;
      }

    }
  
    setupWeather1() {
    // Skybox
    let skyboxTexture = CubeTexture.CreateFromImages(
        [TropicalSunnyDay_px, TropicalSunnyDay_py, TropicalSunnyDay_pz, TropicalSunnyDay_nx, TropicalSunnyDay_ny, TropicalSunnyDay_nz], 
        GlobalManager.scene
      );

      const skybox = MeshBuilder.CreateBox("skyBox", { size: 2000}, GlobalManager.scene);
      const skyboxMaterial = new StandardMaterial("skyBox", GlobalManager.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.disableLighting = true;
      skybox.material = skyboxMaterial;
      skybox.infiniteDistance = true;
      skyboxMaterial.disableLighting = true;
      skyboxMaterial.reflectionTexture = skyboxTexture;
      skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  
      // Ground
      let groundMaterial = new StandardMaterial("groundMaterial", GlobalManager.scene);
      groundMaterial.diffuseTexture = new Texture(floorUrl, GlobalManager.scene);
      groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;
  
      let ground = Mesh.CreateGround("ground", 2000, 2000, 32, GlobalManager.scene, false);
      ground.position.y = -1;
      ground.material = groundMaterial;
  
  
  
      // Water
      // let waterMesh = Mesh.CreateGround("waterMesh", 2048, 2048, 16, GlobalManager.scene, false);
      // let water = new WaterMaterial("water", GlobalManager.scene, new Vector2(512, 512));
      // water.backFaceCulling = true;
      // water.bumpTexture = new Texture(waterUrl, GlobalManager.scene);
      // water.windForce = -12;
      // water.waveHeight = 0.1;
      // water.windDirection = new Vector2(1, 1);
      // water.waterColor = new Color3(0.19, 0.19, 0.55);
      // water.colorBlendFactor = 0.5;
      // water.bumpHeight = 0.1; 
      // water.waveLength = 0.1;
      // water.addToRenderList(skybox);
      // water.addToRenderList(ground);
      // waterMesh.material = water;
      let waterMesh = Mesh.CreateGround("waterMesh", 2048, 2048, 16, GlobalManager.scene, false);
      let water = new WaterMaterial("water", GlobalManager.scene, new Vector2(512, 512));
      water.backFaceCulling = true;
      water.bumpTexture = new Texture(waterUrl, GlobalManager.scene);
      water.windForce = -15;
      water.waveHeight = 0.2;
      water.windDirection = new Vector2(1, 1);
      water.waterColor = new Color3(0.22, 0.22, 0.54);
      water.colorBlendFactor = 0.7;
      water.bumpHeight = 0.2; 
      water.waveLength = 0.5;
      water.addToRenderList(skybox);
      water.addToRenderList(ground);
      waterMesh.material = water;

      let seaSound = new Sound("seaSound", seaFileSound, GlobalManager.scene, null, { loop: true, autoplay: true });
      seaSound.setVolume(0.6);



  }

  setupWeather2() {

    // Skybox
    let skyboxTexture = CubeTexture.CreateFromImages(
      [RainDay_px, RainDay_py, RainDay_pz, RainDay_nx, RainDay_ny, RainDay_nz], 
      GlobalManager.scene
    );
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 2000}, GlobalManager.scene);
    const skyboxMaterial = new StandardMaterial("skyBox", GlobalManager.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = skyboxTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    // Ground
    let groundMaterial = new StandardMaterial("groundMaterial", GlobalManager.scene);
    groundMaterial.diffuseTexture = new Texture(floorUrl, GlobalManager.scene);
    groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;

    let ground = Mesh.CreateGround("ground", 2000, 2000, 32, GlobalManager.scene, false);
    ground.position.y = -1;
    ground.material = groundMaterial;



    // Water
    let waterMesh = Mesh.CreateGround("waterMesh", 2048, 2048, 16, GlobalManager.scene, false);
    let water = new WaterMaterial("water", GlobalManager.scene, new Vector2(512, 512));
    water.backFaceCulling = true;
    water.bumpTexture = new Texture(waterUrl, GlobalManager.scene);
    water.windForce = -15;
    water.waveHeight = 0.2;
    water.windDirection = new Vector2(1, 1);
    water.waterColor = new Color3(0.3, 0.3, 0.4);
    water.colorBlendFactor = 0.5;
    water.bumpHeight = 0.5; 
    water.waveLength = 0.5;
    water.addToRenderList(skybox);
    water.addToRenderList(ground);
    waterMesh.material = water;

    // Rain
    var particleSystem = new ParticleSystem("rain", 1500, GlobalManager.scene);
    particleSystem.particleTexture = new Texture(rainDrop, GlobalManager.scene);
    particleSystem.emitter = this.player.mesh;
    particleSystem.minEmitBox = new Vector3(-50, 30, 20);
    particleSystem.maxEmitBox = new Vector3(50, 30, 50);
    particleSystem.color1 = new Color4(1, 1, 1);
    particleSystem.color2 = new Color4(0, 0, 0, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0); 
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.4;
    particleSystem.minLifeTime = 1;
    particleSystem.maxLifeTime = 4;
    particleSystem.emitRate = 500;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new Vector3(0, -9.81, 0);
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1.0;
    particleSystem.updateSpeed = 0.025;
    // particleSystem.direction1 = new Vector3(0, -10, 0); // Direction de départ
    // particleSystem.direction2 = new Vector3(0, -10, 0); // Direction de fin

    particleSystem.start();



//Sound of the rain
let rainSound = new Sound("rainSound", rainFileSound, GlobalManager.scene, null, { loop: true, autoplay: true });
rainSound.setVolume(0.6);
let rainSound2 = new Sound("rainSound2", rainFileSound2, GlobalManager.scene, null, { loop: true, autoplay: true });
rainSound2.setVolume(0.6);


  }

  
}


export default Weather;