import * as THREE from "three";

export type ResourceType =
  | THREE.BufferGeometry
  | THREE.Material
  | THREE.Texture
  | THREE.WebGLRenderTarget
  | THREE.Object3D;
