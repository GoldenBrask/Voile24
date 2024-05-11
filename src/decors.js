import {
  Quaternion,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";

class Mountain {
  mesh;
  spawnPoint;
  meshUrl
  constructor(spawnPoint, meshUrl, scale = null) {
    this.spawnPoint = spawnPoint;
    this.meshUrl = meshUrl;
    this.scale = scale;
  }

  async init() {

    const result = await SceneLoader.ImportMeshAsync(
      "",
      "",
      this.meshUrl,
      GlobalManager.scene
    );

    this.mesh = result.meshes[0];
    this.mesh.name = "mountain";
    this.mesh.checkCollisions = true;
    this.mesh.rotationQuaternion = Quaternion.Identity();
    this.mesh.position = this.spawnPoint;
    if (this.scale) {
      this.mesh.scaling = new Vector3(this.scale, this.scale, this.scale);
    } 
  
    for (let childMesh of result.meshes) {
      childMesh.checkCollisions = true; // Assurez-vous que les collisions sont vérifiées pour chaque sous-maillage
      if (childMesh.getTotalVertices() > 0) {
        childMesh.receiveShadows = true;
        GlobalManager.addShadowCaster(childMesh);
      }
    }

    this.mesh.ellipsoid = new Vector3(2, 2, 2);
    const ellipsoidOffset = 0.0;
    this.mesh.ellipsoidOffset = new Vector3(0, ellipsoidOffset, 0);

  }

}

export default Mountain;
