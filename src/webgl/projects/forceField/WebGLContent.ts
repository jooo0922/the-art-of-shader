import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Water } from "three/examples/jsm/objects/Water";
import BrightPostEffect from "./BrightPostEffect";
import BlurPostEffect from "./BlurPostEffect";
import BloomPostEffect from "./BloomPostEffect";
import Camera from "./Camera";
import Dome from "./Dome";
import Castle from "./Castle";
import Background from "./Background";
import Fog from "./Fog";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  rtScene: THREE.Scene;

  camera: THREE.OrthographicCamera;

  rtCamera: Camera;

  dome: Dome;

  castle: Castle | undefined;

  water: Water | undefined;

  background: Background;

  fog: Fog;

  controls: OrbitControls;

  renderTarget1: THREE.WebGLRenderTarget;

  renderTarget2: THREE.WebGLRenderTarget;

  renderTarget3: THREE.WebGLRenderTarget;

  renderTarget4: THREE.WebGLRenderTarget;

  brightPostEffect: BrightPostEffect;

  blurPostEffectX: BlurPostEffect;

  blurPostEffectY: BlurPostEffect;

  bloomPostEffect: BloomPostEffect;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

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

    this.scene = new THREE.Scene(); // 렌더타겟 텍스쳐가 입혀진 평면을 담는 scene
    this.rtScene = new THREE.Scene(); // 렌더타겟에 그리는 실제 장면을 담는 scene
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 렌더타겟 텍스쳐가 입혀진 평면을 촬영하는 orthographic 카메라 (절두체 수평/수직 폭이 -1 ~ 1, 즉 2 이므로, 평면의 사이즈도 2*2 로 지정했음.)
    this.rtCamera = new Camera(); // 렌더타겟에 그리는 실제 장면을 촬영하는 perspective 카메라
    this.dome = new Dome();
    this.background = new Background();
    this.fog = new Fog();

    this.brightPostEffect = new BrightPostEffect();
    this.blurPostEffectX = new BlurPostEffect();
    this.blurPostEffectY = new BlurPostEffect();
    this.bloomPostEffect = new BloomPostEffect();

    this.controls = new OrbitControls(this.rtCamera, this.renderer.domElement);
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = 100 * (Math.PI / 180); // OrbitControls 로 카메라를 맨 위 꼭대기에서 몇 도 까지 회전시킬 수 있게 할 것인지 최댓값 범위를 지정함. -> 100도로 지정해서 Water 의 밑부분은 안보이도록 막아놓음.
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.target.set(0, 20, 0);
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
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
  render() {
    // BrightPostEffect 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget1); // 1번 렌더타겟 지정
    this.renderer.render(this.rtScene, this.rtCamera); // BrightPostEffect 에서 사용할 렌더타겟 텍스쳐 렌더링

    // BlurPostEffectX 후처리에 사용할 렌더타겟 텍스쳐(= BrightPostEffect 가 적용된 텍스쳐) 렌더링
    this.renderer.setRenderTarget(this.renderTarget2); // 2번 렌더타겟 지정 (null 로 지정해놓고 확인하면, 추출된 경계선의 밝기값만 렌더링되는 걸 볼 수 있음.)
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
  update(time: number): void {
    this.rtCamera.update(time);

    this.dome.update(time);

    this.fog.update(time, this.rtCamera);

    if (this.water) this.water.material.uniforms["time"].value = time; // three.js Water 객체에 시간변수 time 을 유니폼변수로 넘겨줘야 내부적으로 uv 스크롤링을 처리해주는 것 같음.

    this.controls.update();

    this.render();
  }

  async init() {
    const objLoader = new OBJLoader();
    const texLoader = new THREE.TextureLoader();
    const cubeTexLoader = new THREE.CubeTextureLoader();
    await Promise.all([
      objLoader.loadAsync("./models/forceField/castle.obj"),
      texLoader.loadAsync("./images/noise/noise1.png"),
      cubeTexLoader
        .setPath("./images/forceField/cubemap/")
        .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]),
      texLoader.loadAsync("./images/forceField/normTex.png"),
      texLoader.loadAsync("./images/forceField/fog.png"),
    ]).then((response) => {
      const castleGeometry = (response[0].children[0] as THREE.Mesh).geometry;
      const noiseTex = response[1];
      const cubeTex = response[2];
      const normTex = response[3];
      const fogTex = response[4];

      this.castle = new Castle(castleGeometry);
      this.castle.init();

      noiseTex.wrapS = THREE.RepeatWrapping;
      noiseTex.wrapT = THREE.RepeatWrapping;
      this.dome.init(noiseTex); // Dome 셰이더 코드에 노이즈 텍스쳐를 전달함.

      this.background.setTexture(cubeTex); // Background 셰이더 코드에 큐브맵 텍스쳐 전달

      // THREE.JS Water 객체에 옵션으로 전달해 줄 노말맵 텍스쳐의 랩 모드를 반복으로 지정함.
      normTex.wrapS = THREE.RepeatWrapping;
      normTex.wrapT = THREE.RepeatWrapping;

      const waterGeometry = new THREE.PlaneGeometry(20000, 20000); // Water 객체의 사이즈를 Background 사이즈와 동일하게 맞춤.
      this.water = new Water(waterGeometry, {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals: normTex,
        sunDirection: new THREE.Vector3(-1.0, 1.0, 0.2), // Castle 의 프래그먼트 셰이더에서 적용해 준 디렉셔널 라이트 벡터와 동일하게 맞춤.
        sunColor: 0x00000f,
        waterColor: 0x000000,
        distortionScale: 3.7,
      });
      this.water.rotation.x = -Math.PI / 2; // Water 객체 평면을 -90도 회전시킴.

      this.fog.setTexture(fogTex); // Fog 셰이더 코드에 안개 텍스쳐 전달

      this.rtCamera.init();
      this.rtScene.add(this.background);
      this.rtScene.add(this.castle);
      this.rtScene.add(this.dome); // 실제 dome 이 찍히는 렌더타겟 씬에 Dome 을 넣어줌.
      this.rtScene.add(this.water);
      this.rtScene.add(this.fog);

      this.brightPostEffect.setTexture(this.renderTarget1.texture); // BrightPostEffect 에 1번 렌더타겟 텍스쳐 지정
      this.blurPostEffectX.setTexture(this.renderTarget2.texture); // BlurPostEffectX 에 2번 렌더타겟 텍스쳐 지정
      this.blurPostEffectY.setTexture(this.renderTarget3.texture); // BlurPostEffectY 에 3번 렌더타겟 텍스쳐 지정
      this.bloomPostEffect.setTexture(
        this.renderTarget1.texture, // 맨 처음에 아무런 postEffect 도 적용되지 않은 렌더타겟 텍스쳐
        this.renderTarget4.texture // 마지막을 제외한 모든 postEffect(bright, blurX, blurY) 가 적용된 렌더타겟 텍스쳐
      ); // BloomPostEffect 에 1번과 4번 렌더타겟 텍스쳐 지정

      this.blurPostEffectX.setDirection(1, 0); // 가우시안 블러의 방향을 수평방향으로 지정한 postEffect 평면
      this.blurPostEffectY.setDirection(0, 1); // 가우시안 블러의 방향을 수직방향으로 지정한 postEffect 평면
    });
  }
}
