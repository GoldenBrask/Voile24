import {
  Quaternion,
  SceneLoader,
  TransformNode,
  Vector3,
  Color3,
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";

import buoyMeshUrl from "../assets/models/buoySolo.glb";

class Buoy {
  mesh;
  spawnPoint;

  constructor(spawnPoint) {
    this.spawnPoint = spawnPoint;
  }

  async initBuoy() {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "",
      buoyMeshUrl,
      GlobalManager.scene
    );

    this.mesh = result.meshes[0];
    this.mesh.name = "buoy";
    this.mesh.position = this.spawnPoint;
    this.mesh.scaling = new Vector3(0.05, 0.05, 0.05);
    this.mesh.checkCollisions = true;
    this.mesh.ellipsoid = new Vector3(1, 1, 1);
    this.mesh.showBoundingBox = true;

    for (let childMesh of result.meshes) {
      childMesh.checkCollisions = true; // Assurez-vous que les collisions sont vérifiées pour chaque sous-maillage

      if (childMesh.getTotalVertices() > 0) {
        childMesh.receiveShadows = true;
        GlobalManager.addShadowCaster(childMesh);
      }
    }
  }

  update() {
    console.log("update");
  }
}

export default Buoy;
