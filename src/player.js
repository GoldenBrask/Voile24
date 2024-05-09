import { AxesViewer, Color3, MeshBuilder, Quaternion, Scalar, Scene, SceneLoader, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core';
import { GlobalManager } from './globalmanager';

import playerMeshUrl from "../assets/models/yacht.glb";

const SPEED = 15.0;
const TURN_SPEED = 4*Math.PI;

class Player {
    mesh;
    axes;
    spawnPoint;

    constructor(spawnPoint) {
        this.spawnPoint = spawnPoint;
    }

    async init() {


        const result = await SceneLoader.ImportMeshAsync("", "", playerMeshUrl, GlobalManager.scene);
    
        this.mesh = result.meshes[0];
        this.mesh.name = "playerVehicule";
       

        this.mesh.position = this.spawnPoint;
        
    }

    update(inputMap, actions) {

        this.getInputs(inputMap, actions);
        // this.move();
    }

    getInputs(inputMap, actions) {

        this.moveInput.set(0, 0, 0);

        if (inputMap["KeyA"]) {
            this.moveInput.x = -1;
        }
        else if (inputMap["KeyD"]) {
            this.moveInput.x = 1;
        }

        
        if (inputMap["KeyW"]) {
            this.moveInput.z = 1;
        }
        else if (inputMap["KeyS"]) {
            this.moveInput.z = -1;
        }

        if (actions["Space"]) {
            //TODO jump
        }

    }

    

    // move() {
    // }
}

export default Player;