import * as THREE from "three";
import Camera from "./Camera";
import vs from "./glsl/aura.vs";
import fs from "./glsl/aura.fs";

export default class Aura extends THREE.Mesh {
  isActive: boolean;

  constructor() {
    const geometry = new THREE.PlaneGeometry(40, 40);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        postEffectTex: {
          value: null,
        },
        noiseTex: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true, // 알파블렌딩 셰이더를 활성화시킴. (프래그먼트 셰이더에서 투명도가 0.01보다 작은 애들은 discard 시키는 알파테스팅을 적용할거기 때문!)
    });
    super(geometry, material);
    this.name = "Aura";
    this.isActive = false;
  }

  init(postEffectTex: THREE.Texture, noiseTex: THREE.Texture) {
    this.isActive = true;
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.postEffectTex.value = postEffectTex; // 렌더타겟 텍스쳐
      this.material.uniforms.noiseTex.value = noiseTex; // 노이즈 텍스쳐
    }
  }

  update(time: number, camera: Camera) {
    if (this.isActive === false) return;
    this.rotation.copy(camera.rotation); // 후처리 효과를 위한 면이므로, 카메라 회전을 따라서 동일하게 회전해줘야 함.
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }
}
