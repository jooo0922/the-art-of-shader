import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import BloomPostEffect from "./BloomPostEffect";
import BlurPostEffect from "./BlurPostEffect";
import BrightPostEffect from "./BrightPostEffect";
import Camera from "./Camera";
import Shield from "./Shield";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public rtScene: THREE.Scene;

  public camera: THREE.OrthographicCamera;

  public rtCamera: Camera;

  public shield: Shield | undefined;

  public renderTarget1: THREE.WebGLRenderTarget;

  public renderTarget2: THREE.WebGLRenderTarget;

  public renderTarget3: THREE.WebGLRenderTarget;

  public renderTarget4: THREE.WebGLRenderTarget;

  public brightPostEffect: BrightPostEffect;

  public blurPostEffectX: BlurPostEffect;

  public blurPostEffectY: BlurPostEffect;

  public bloomPostEffect: BloomPostEffect;

  public controls: OrbitControls;

  public resourceTracker: ResourceTracker;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene(); // 렌더타겟 텍스쳐가 입혀진 평면을 담는 scene
    this.rtScene = new THREE.Scene(); // 렌더타겟에 그리는 실제 장면을 담는 scene
    this.rtScene.background = new THREE.Color(0, 0, 0);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 렌더타겟 텍스쳐가 입혀진 평면을 촬영하는 orthographic 카메라 (절두체 수평/수직 폭이 -1 ~ 1, 즉 2 이므로, 렌더타겟 텍스쳐를 적용하는 각 평면의 사이즈도 2*2 로 지정했음.)
    this.rtCamera = new Camera(); // 렌더타겟에 그리는 실제 장면을 촬영하는 perspective 카메라

    // 각각의 렌더타겟은 postEffect, 즉, 후처리에 사용하는 렌더타겟이므로, 윈도우 사이즈(=캔버스 사이즈)와 항상 동일해야 함.
    this.renderTarget1 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget2 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget3 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget4 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );

    // 렌더타겟 텍스쳐를 입혀줄 후처리 평면 메쉬 생성
    this.brightPostEffect = new BrightPostEffect();
    this.blurPostEffectX = new BlurPostEffect();
    this.blurPostEffectY = new BlurPostEffect();
    this.bloomPostEffect = new BloomPostEffect();

    // 카메라 컨트롤러 생성
    this.controls = new OrbitControls(this.rtCamera, this.renderer.domElement);
    this.controls.dampingFactor = 0.1;
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.target.set(0, 0, 0);

    this.resourceTracker = new ResourceTracker();
  }

  // 리사이징 메서드
  public resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);

    // 후처리에 사용되는 렌더타겟의 사이즈는 캔버스 사이즈와 항상 동일해야 하므로, 리사이징할 때 똑같이 맞춰줄 것.
    this.renderTarget1.setSize(resolution.x, resolution.y);
    this.renderTarget2.setSize(resolution.x, resolution.y);
    this.renderTarget3.setSize(resolution.x, resolution.y);
    this.renderTarget4.setSize(resolution.x, resolution.y);

    this.rtCamera.resize(resolution);

    // 각 blurPostEffect 에서 사용하는 가우시안 블러 함수에 현재 캔버스의 해상도값을 전달해준 것.
    this.blurPostEffectX.resize(resolution);
    this.blurPostEffectY.resize(resolution);
  }

  // 렌더링 루프 (렌더링 객체 관련)
  public render(): void {
    // BrightPostEffect 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget1); // 1번 렌더타겟 지정
    this.renderer.render(this.rtScene, this.rtCamera); // BrightPostEffect 에서 사용할 렌더타겟 텍스쳐 렌더링

    // BlurPostEffectX 후처리에 사용할 렌더타겟 텍스쳐(= BrightPostEffect 가 적용된 텍스쳐) 렌더링
    this.renderer.setRenderTarget(this.renderTarget2); // 2번 렌더타겟 지정 (null 로 지정해놓고 확인하면, 최소밝기값 이상의 추출된 색상들만 렌더링되는 걸 볼 수 있음.)
    this.scene.add(this.brightPostEffect); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.brightPostEffect); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // BlurPostEffectY 후처리에 사용할 렌더타겟 텍스쳐(= BlurPostEffectX 가 적용된 텍스쳐) 렌더링
    this.renderer.setRenderTarget(this.renderTarget3); // 3번 렌더타겟 지정 (null 로 지정해놓고 확인하면, 수평방향 blur만 적용되서 렌더링되는 걸 볼 수 있음.)
    this.scene.add(this.blurPostEffectX); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.blurPostEffectX); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // BloomPostEffect 후처리에 사용할 렌더타겟 텍스쳐(= BlurPostEffectY 가 적용된 텍스쳐) 렌더링
    this.renderer.setRenderTarget(this.renderTarget4); // 4번 렌더타겟 지정 (null 로 지정해놓고 확인하면, 수평/수직방향 blur가 모두 적용되서 렌더링되는 걸 볼 수 있음.)
    this.scene.add(this.blurPostEffectY); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.blurPostEffectY); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // 최종 후처리 평면 렌더링
    this.renderer.setRenderTarget(null); // 렌더타겟을 원래 캔버스로 복구 (null 로 지정해야 그 이후부터 renderer 가 렌더하는 장면들을 Canvas 엘레먼트에서 눈으로 확인 가능함!)
    this.scene.add(this.bloomPostEffect); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링 -> 최종적으로 화면에 그려줄 평면
    this.scene.remove(this.bloomPostEffect); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거
    // -> 다음 렌더링 루프에서 다시 this.brightPostEffect 를 추가해서 렌더링해줘야 하므로, 다음 렌더링 루프로 넘어가기 전 this.scene 을 비워준 것임.

    /**
     * 만약 다음 렌더링 루프로 넘어가기 전에,
     * 렌더타겟 텍스쳐가 하나라도 적용된 평면메쉬를 Scene 에서 제거하지 않는다면,
     * '피드백 루프가 활성화되었다' 라는 에러메시지가 뜰 것임.
     *
     * 이게 뭐냐면,
     * 렌더타겟 텍스쳐를 촬영하는 Scene 안에
     * 렌더타겟 텍스쳐 자기 자신이 존재하기 때문에
     * 렌더타겟 텍스쳐가 자기 자신을 촬영하게 되는
     * 루프 에러가 발생한다는 의미임.
     *
     * 정확한 비유는 아닐 수도 있지만,
     * 거울 두 개를 마주보게 세우면
     * 상대 거울에 비친 자기자신의 거울이 비쳐서
     * 거울 스스로가 자기 자신을 반복적으로 비치는 것과 유사한 현상임.
     */

    /**
     * 위의 렌더타겟을 교체하며
     * 후처리를 패스해주는 단계를 잘 이해해야 함.
     *
     * 각 단계마다 setRenderTarget(null) 로 변경하여
     * 렌더타겟 텍스쳐에 그려주던 씬들을 캔버스에 직접 그려줘서
     * 눈으로 직접 확인해보는 게 좋음.
     *
     * 그래서 각 단계마다 어떤 후처리가 적용되고 있는지,
     * learnOpenGL 의 Bloom 파트에서 설명하는 단계 중
     * 어느 단계에 대응하는지 확인해볼 것.
     *
     * [참고] https://learnopengl.com/Advanced-Lighting/Bloom
     */
  }

  // 업데이트 루프 (데이터 관련)
  public update(time: number): void {
    this.rtCamera.update(time);

    this.shield?.update(time);

    this.controls.update();

    this.render();
  }

  public async init(): Promise<void> {
    const objLoader = new OBJLoader();
    const texLoader = new THREE.TextureLoader();
    await Promise.all([
      objLoader.loadAsync("./models/shield/shield.obj"),
      texLoader.loadAsync("./images/shield/shield.png"),
    ]).then((response) => {
      const shieldGeometry = (response[0].children[0] as THREE.Mesh).geometry;
      const hexagonTex = response[1];

      this.shield = new Shield(shieldGeometry);
      this.shield.init();
      this.shield.setTexture(hexagonTex);

      this.rtCamera.init();

      this.rtScene.add(this.shield);

      this.brightPostEffect.setTexture(this.renderTarget1.texture); // BrightPostEffect 에 1번 렌더타겟 텍스쳐 지정
      this.blurPostEffectX.setTexture(this.renderTarget2.texture); // BlurPostEffectX 에 2번 렌더타겟 텍스쳐 지정
      this.blurPostEffectY.setTexture(this.renderTarget3.texture); // BlurPostEffectY 에 3번 렌더타겟 텍스쳐 지정
      this.bloomPostEffect.setTexture(
        this.renderTarget1.texture, // 맨 처음에 아무런 postEffect 도 적용되지 않은 원본 렌더타겟 텍스쳐
        this.renderTarget4.texture // 마지막을 제외한 모든 postEffect(bright, blurX, blurY) 가 적용된 렌더타겟 텍스쳐
      ); // BloomPostEffect 에 1번과 4번 렌더타겟 텍스쳐 지정

      this.blurPostEffectX.setDirection(1, 0); // 가우시안 블러의 방향을 수평방향으로 지정한 postEffect 평면
      this.blurPostEffectY.setDirection(0, 1); // 가우시안 블러의 방향을 수직방향으로 지정한 postEffect 평면

      this.resourceTracker.track(this.scene);
      this.resourceTracker.track(this.rtScene);
      this.resourceTracker.track(this.shield);
      this.resourceTracker.track(this.renderTarget1);
      this.resourceTracker.track(this.renderTarget2);
      this.resourceTracker.track(this.renderTarget3);
      this.resourceTracker.track(this.renderTarget4);
      this.resourceTracker.track(this.brightPostEffect);
      this.resourceTracker.track(this.blurPostEffectX);
      this.resourceTracker.track(this.blurPostEffectY);
      this.resourceTracker.track(this.bloomPostEffect);
    });
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
    this.renderer.dispose();
    this.renderer.clear();
  }
}
