import {
  Quaternion,
  SceneLoader,
  TransformNode,
  Vector3,
  Color3,
} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";


import mountainMeshUrl from "../assets/models/buoySolo.glb";
import { Mesh, MeshBuilder } from "babylonjs";

class Mountain {
  mesh;
  spawnPoint;
  scaleFactor;
  constructor(spawnPoint, scaleFactor) {
    this.spawnPoint = spawnPoint;
    this.scaleFactor = scaleFactor;
  }

  async init() {

    let arrow = SceneLoader.ImportMeshAsync(
      "",
      "",
      arrowMeshUrl,
      GlobalManager.scene
    );
    arrow.then((result) => {
      let mesh = result.meshes[0];
      mesh.position = new Vector3(
        x * this.scaleFactor - this.mapsize / 2,
        0,
        y * this.scaleFactor - this.mapsize / 2
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

  }
}

export default Mountain;
