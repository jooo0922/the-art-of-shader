import * as THREE from "three";
import Ball from "./Ball";
import Camera from "./Camera";
import CameraAura from "./CameraAura";
import AuraPostEffect from "./AuraPostEffect";
import Aura from "./Aura";
import Points from "./Points";
import Drag from "./Drag";

export default class AuraBall extends THREE.Group {
  ball: Ball | undefined;

  dummy: THREE.Object3D | undefined;

  auraPostEffect: AuraPostEffect | undefined;

  aura: Aura | undefined;

  points: Points | undefined;

  renderTarget1: THREE.WebGLRenderTarget;

  renderTarget2: THREE.WebGLRenderTarget;

  time: number;

  isActive: boolean;

  constructor() {
    super();
    this.name = "AuraBall";
    this.renderTarget1 = new THREE.WebGLRenderTarget(256, 256);
    this.renderTarget2 = new THREE.WebGLRenderTarget(256, 256);
    this.time = 0;
    this.isActive = false;
  }

  init(geometry: THREE.BufferGeometry, noiseTex: THREE.Texture) {
    this.ball = new Ball(geometry);
    this.dummy = new THREE.Object3D();
    this.auraPostEffect = new AuraPostEffect();
    this.aura = new Aura();
    this.points = new Points();

    this.dummy.add(this.ball);
    this.add(this.dummy);
    this.add(this.aura);
    this.add(this.points);

    this.ball.init(noiseTex);
    this.aura.init(this.renderTarget1.texture, noiseTex);
    this.points.init(noiseTex);

    this.isActive = true;
  }

  update(
    time: number,
    renderer: THREE.WebGLRenderer,
    camera: Camera,
    sceneAura: THREE.Scene,
    cameraAura: CameraAura,
    drag: Drag
  ) {
    if (this.isActive === false) return;

    this.time = time;

    // 드래그 이벤트에 따라 Ball 을 회전시킴
    // this.ball.update() 내부에서 rotation.set() 을 이미 덮어쓰고 있기 때문에,
    // dummy 요소로 ball 을 감싼 다음, 해당 dummy 요소를 회전시켜 주고 있음.
    if (drag) {
      this.dummy?.rotation.set(
        THREE.MathUtils.degToRad(drag.vCur.y - 15),
        THREE.MathUtils.degToRad(drag.vCur.x + 15),
        THREE.MathUtils.degToRad(-20)
      );
    }

    // 자식요소 update
    this.ball?.update(time, camera);
    this.aura?.update(time, camera);
    this.points?.update(time);

    // Aura 에서 사용할 렌더타겟 준비
    renderer.setRenderTarget(this.renderTarget1);
    if (this.dummy) sceneAura.add(this.dummy); // 원래 this.ball 을 add 해줘야 하는데, this.dummy 를 대신 add 함.
    if (this.ball?.material instanceof THREE.RawShaderMaterial) {
      // 렌더타겟 텍스쳐를 렌더링할 때에만 임시로 renderOutline 을 1로 처리해서 버텍스들을 노멀방향으로 확장시켜 그리는 것 같음. (이게 rimLight 뒤에 들어가는 동그란 후광으로 사용하려는 거 같음.)
      this.ball.material.uniforms.renderOutline.value = 1;
    }

    // Aura 에서 사용할 렌더타겟 텍스쳐 렌더링
    renderer.render(sceneAura, cameraAura);

    // Aura 에서 사용한 렌더타겟 텍스쳐와 동일한 것을 AuraPostEffect 에도 전달
    this.auraPostEffect?.setDirection(1, 0); // 가우시안 블러를 수평방향(u축)으로 적용함
    this.auraPostEffect?.setTexture(this.renderTarget1.texture);

    // AuraPostEffect 에서 사용할 첫 번째 렌더타겟(renderTarget2) 준비
    renderer.setRenderTarget(this.renderTarget2); // 렌더타깃 변경
    if (this.dummy) sceneAura.remove(this.dummy); // renderTarget2 에 렌더링 시 ball 제거 (원래 this.ball 인데, this.dummy 를 대신 제거함.)
    if (this.auraPostEffect) sceneAura.add(this.auraPostEffect); // renderTarget2 에 렌더링 시 auraPostEffect 평면 추가

    // AuraPostEffect 에서 사용할 렌더타겟(renderTarget2) 텍스쳐 렌더링 (renderTarget2 에 렌더링하고 있고, ball 이 빠지고, auraPostEffect 평면이 들어간 상태.)
    renderer.render(sceneAura, cameraAura);

    // 변경한 렌더타깃에 렌더링한 텍스쳐를 AuraPostEffect 에 전달
    if (this.auraPostEffect) {
      this.auraPostEffect.setDirection(0, 1); // 가우시안 블러를 수직방향(v축)으로 적용함
      this.auraPostEffect.setTexture(this.renderTarget2.texture);
    }

    // Aura 에서 사용할 렌더타겟(renderTarget1) 재설정
    renderer.setRenderTarget(this.renderTarget1);

    // Aura 에서 사용할 렌더타겟(renderTarget1) 텍스쳐 렌더링 (renderTarget1 에 렌더링하고 있고, ball 이 빠지고, auraPostEffect 평면이 들어간 상태.)
    // auraPostEffect 평면이 렌더링되고 있는 장면을 Aura 에도 전달함으로써, Aura 에 auraPostEffect 가 반영되도록 함.
    renderer.render(sceneAura, cameraAura);

    renderer.setRenderTarget(null); // 렌더타겟 텍스쳐 렌더링 후 렌더타겟을 원래 캔버스로 초기화
    if (this.auraPostEffect) sceneAura.remove(this.auraPostEffect); // 다음 프레임에서 sceneAura 에 auraPostEffect 평면이 남아있으면 안되므로, 다음 프레임으로 넘어가기 전 미리 sceneAura 에서 제거해 둠.
    if (this.dummy) this.add(this.dummy); // 원래 this.ball 을 add 해줘야 하는데, this.dummy 를 대신 add 함.
    if (this.ball?.material instanceof THREE.RawShaderMaterial) {
      this.ball.material.uniforms.renderOutline.value = 0;
    }
  }

  resize(resolution: THREE.Vector2) {
    this.points?.resize(resolution);
  }
}
