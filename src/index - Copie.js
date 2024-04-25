import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3, SceneLoader, Vector2 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector'; 

import meshUrl from "../assets/models/HVGirl.glb";
import { ArcRotateCamera, Color3, CubeTexture, Mesh, StandardMaterial, Texture } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
 
let engine;
let canvas;

window.onload = () => { 
    console.log('Hello World!'); 
 
    const canvas = document.getElementById("renderCanvas"); 
    let engine = new Engine(canvas, true); 
    let scene = createScene();  

    Inspector.Show(scene, {});

    engine.runRenderLoop(function () { 
        scene.render(); 
    }); 

    window.addEventListener("resize", function () { 
        engine.resize(); 
    }); 
};

var createScene = function () {
	var scene = new Scene(engine);

	var camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, Vector3.Zero(), scene);
	camera.attachControl(canvas, true);

	var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
	
	// Skybox
	var skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new CubeTexture("../assets/textures/sky.jpg", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	skyboxMaterial.specularColor = new Color3(0, 0, 0);
	skyboxMaterial.disableLighting = true;
	skybox.material = skyboxMaterial;
		
	// Ground
	var groundMaterial = new StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = new Texture("../assets/textures/ground.jpg", scene);
	groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;
	
	var ground = Mesh.CreateGround("ground", 512, 512, 32, scene, false);
	ground.position.y = -1;
	ground.material = groundMaterial;
		
	// Water
	var waterMesh = Mesh.CreateGround("waterMesh", 2048, 2048, 32, scene, false);
	
	var water = new WaterMaterial("water", scene);
	water.bumpTexture = new Texture("../assets/textures/waterbump.png", scene);
	
	// Water properties
	water.windForce = -35;
	water.waveHeight = 0.3;
	water.windDirection = new Vector2(1, 1);
	water.waterColor = new Color3(0.4, 0.4, 0.61);
	water.colorBlendFactor = 0.3;
	water.bumpHeight = 0.01;
	water.waveLength = 0.1;
	
	// Add skybox and ground to the reflection and refraction
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
	
	// Assign the water material
	waterMesh.material = water;

	return scene;
}
