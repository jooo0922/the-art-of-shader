import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Camera from "./Camera";
import MagicCircle from "./MagicCircle";
import RayGroup from "./RayGroup";
import Points from "./Points";
import CharacterGroup from "./CharacterGroup";
import Background from "./Background";
import BrightPostEffect from "./BrightPostEffect";
import BlurPostEffect from "./BlurPostEffect";
import BloomPostEffect from "./BloomPostEffect";
import Ground from "./Ground";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  rtScene: THREE.Scene;

  camera: THREE.OrthographicCamera;

  rtCamera: Camera;

  outerMagicCircle: MagicCircle;

  innerMagicCircle: MagicCircle;

  rayGroup: RayGroup;

  points: Points;

  characterGroup: CharacterGroup;

  background: Background;

  ground: Ground;

  hsv: THREE.Vector3;

  ambientLight: THREE.AmbientLight;

  directionalLight: THREE.DirectionalLight;

  pointLight: THREE.PointLight;

  renderTarget1: THREE.WebGLRenderTarget;

  renderTarget2: THREE.WebGLRenderTarget;

  renderTarget3: THREE.WebGLRenderTarget;

  renderTarget4: THREE.WebGLRenderTarget;

  brightPostEffect: BrightPostEffect;

  blurPostEffectX: BlurPostEffect;

  blurPostEffectY: BlurPostEffect;

  bloomPostEffect: BloomPostEffect;

  controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
      logarithmicDepthBuffer: true, // 카메라를 멀리 당겼을 때 캐릭터 모델에 z-fighting 현상 발생 해결하기 위한 옵션 -> 좀 더 리서치한 뒤 하단에 필기 내용 정리
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene(); // 렌더타겟 텍스쳐가 입혀진 평면을 담는 scene
    this.rtScene = new THREE.Scene(); // 렌더타겟에 그리는 실제 장면을 담는 scene
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 렌더타겟 텍스쳐가 입혀진 평면을 촬영하는 orthographic 카메라 (절두체 수평/수직 폭이 -1 ~ 1, 즉 2 이므로, 렌더타겟 텍스쳐를 적용하는 각 평면의 사이즈도 2*2 로 지정했음.)
    this.rtCamera = new Camera(); // 렌더타겟에 그리는 실제 장면을 촬영하는 perspective 카메라
    this.outerMagicCircle = new MagicCircle(0.5, -1);
    this.innerMagicCircle = new MagicCircle(0.5, 1);
    this.rayGroup = new RayGroup();
    this.points = new Points();
    this.characterGroup = new CharacterGroup();
    this.background = new Background();
    this.ground = new Ground();
    this.hsv = new THREE.Vector3(0.54, 0.3, 0.95);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(0, 100, 0);
    this.pointLight = new THREE.PointLight(
      new THREE.Color().setHSL(...this.hsv.toArray()),
      3.0,
      0,
      2
    );

    // 각각의 렌더타겟은 postEffect, 즉, 후처리에 사용하는 렌더타겟이므로, 윈도우 사이즈(=캔버스 사이즈)와 항상 동일해야 함.
    this.renderTarget1 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.renderTarget2 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.renderTarget3 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.renderTarget4 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    // 렌더타겟 텍스쳐를 입혀줄 후처리 평면 메쉬 생성
    this.brightPostEffect = new BrightPostEffect();
    this.blurPostEffectX = new BlurPostEffect();
    this.blurPostEffectY = new BlurPostEffect();
    this.bloomPostEffect = new BloomPostEffect();

    // 디버깅용 컨트롤러
    this.controls = new OrbitControls(this.rtCamera, this.renderer.domElement);
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = 100 * (Math.PI / 180); // OrbitControls 로 카메라를 맨 위 꼭대기에서 몇 도 까지 회전시킬 수 있게 할 것인지 최댓값 범위를 지정함. -> 100도로 지정해서 Water 의 밑부분은 안보이도록 막아놓음.
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.target.set(0, 5, 0);
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);

    // 후처리에 사용되는 렌더타겟의 사이즈는 캔버스 사이즈와 항상 동일해야 하므로, 리사이징할 때 똑같이 맞춰줄 것.
    this.renderTarget1.setSize(resolution.x, resolution.y);
    this.renderTarget2.setSize(resolution.x, resolution.y);
    this.renderTarget3.setSize(resolution.x, resolution.y);
    this.renderTarget4.setSize(resolution.x, resolution.y);

    this.points.resize(resolution);
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
  update(time: number): void {
    this.rtCamera.update(time);

    this.outerMagicCircle.update(time);
    this.innerMagicCircle.update(time);
    this.rayGroup.update(time);
    this.points.update(time);
    this.characterGroup.update(time);

    this.controls.update();

    this.render();
  }

  async init() {
    const texLoader = new THREE.TextureLoader();
    const cubeTexLoader = new THREE.CubeTextureLoader();
    const gltfLoader = new GLTFLoader();
    await Promise.all([
      texLoader.loadAsync("./images/magicCircle/outerMagicCircle.png"),
      texLoader.loadAsync("./images/magicCircle/innerMagicCircle.png"),
      texLoader.loadAsync("./images/magicCircle/shortRay.png"),
      texLoader.loadAsync("./images/magicCircle/longRay.png"),
      texLoader.loadAsync("./images/magicCircle/ground_diffuse.jpg"),
      texLoader.loadAsync("./images/magicCircle/ground_normal.jpg"),
      texLoader.loadAsync("./images/noise/noise1.png"),
      gltfLoader.loadAsync("./models/magicCircle/character.glb"),
      cubeTexLoader
        .setPath("./images/forceField/cubemap/")
        .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]),
    ]).then((response) => {
      const outerMagicCircleTex = response[0];
      const innerMagicCircleTex = response[1];
      const shortRayTex = response[2];
      const longRayTex = response[3];
      const groundDiffuseTex = response[4];
      const groundNormalTex = response[5];
      const noiseTex = response[6];
      const gltf = response[7];
      const cubeTex = response[8];

      groundDiffuseTex.wrapS = THREE.RepeatWrapping;
      groundDiffuseTex.wrapT = THREE.RepeatWrapping;
      groundNormalTex.wrapS = THREE.RepeatWrapping;
      groundNormalTex.wrapT = THREE.RepeatWrapping;

      this.outerMagicCircle.setTexture(outerMagicCircleTex);
      this.innerMagicCircle.setTexture(innerMagicCircleTex);
      this.rayGroup.setTextures(shortRayTex, longRayTex);
      this.points.setTexture(noiseTex);
      this.background.setTexture(cubeTex);
      this.ground.setTextures(groundDiffuseTex, groundNormalTex);

      this.outerMagicCircle.setHSV(this.hsv);
      this.innerMagicCircle.setHSV(this.hsv);
      this.rayGroup.setHSV(this.hsv);
      this.points.setHSV(this.hsv);
      this.ground.setHSV(this.hsv);

      this.characterGroup.setModel(gltf.scene);
      this.characterGroup.setAnimation(gltf.animations[0]);

      this.rtCamera.init();
      this.background.init();
      this.ground.init();
      this.outerMagicCircle.init();
      this.innerMagicCircle.init();
      this.rayGroup.init();
      this.points.init();
      this.characterGroup.init();

      this.directionalLight.position.set(3, 10, 5);
      this.pointLight.position.set(0, 0, 0);

      this.rtScene.add(this.background);
      this.rtScene.add(this.ground);
      this.rtScene.add(this.outerMagicCircle);
      this.rtScene.add(this.innerMagicCircle);
      this.rtScene.add(this.rayGroup);
      this.rtScene.add(this.points);
      this.rtScene.add(this.characterGroup);
      this.rtScene.add(this.directionalLight);
      this.rtScene.add(this.ambientLight);
      this.rtScene.add(this.pointLight);

      this.brightPostEffect.setTexture(this.renderTarget1.texture); // BrightPostEffect 에 1번 렌더타겟 텍스쳐 지정
      this.blurPostEffectX.setTexture(this.renderTarget2.texture); // BlurPostEffectX 에 2번 렌더타겟 텍스쳐 지정
      this.blurPostEffectY.setTexture(this.renderTarget3.texture); // BlurPostEffectY 에 3번 렌더타겟 텍스쳐 지정
      this.bloomPostEffect.setTexture(
        this.renderTarget1.texture, // 맨 처음에 아무런 postEffect 도 적용되지 않은 원본 렌더타겟 텍스쳐
        this.renderTarget4.texture // 마지막을 제외한 모든 postEffect(bright, blurX, blurY) 가 적용된 렌더타겟 텍스쳐
      ); // BloomPostEffect 에 1번과 4번 렌더타겟 텍스쳐 지정

      this.blurPostEffectX.setDirection(1, 0); // 가우시안 블러의 방향을 수평방향으로 지정한 postEffect 평면
      this.blurPostEffectY.setDirection(0, 1); // 가우시안 블러의 방향을 수직방향으로 지정한 postEffect 평면
    });
  }
}

/**
 * logarithmicDepthBuffer
 *
 * z-fighting 현상을 해결하기 위해
 * 각 픽셀의 z 버퍼값을 계산하는 새로운 방법이라고 보면 됨.
 *
 * 일반적으로, z-fighting 현상은
 * 수천 킬로미터 정도의 멀리있는 물체들에서 주로 발생하는데,
 * 왜 그러냐면, 수천 킬로미터 정도의 거리를
 * '선형 깊이 버퍼' 로 표현하다 보면,
 *
 * 가까이 있는 물체는 어느 정도 수준의 정밀도를 보장하지만,
 * 멀리 있는 물체일수록 정밀도가 떨어지게 되는 현상이 발생함.
 *
 * 이때, '선형 깊이버퍼'는 말 그대로,
 * 픽셀의 z값의 역수에 비례하는 개념으로 보면 됨.
 *
 * 따라서, 이렇게 멀리 있는 물체들의 경우
 * 깊이 버퍼가 정확히 구분이 안되다보니 자기들끼리
 * 서로 앞에 나서려고 하는 z-fighting(또는 glitching) 현상을
 * 일으키게 되는 것임.
 *
 * 이걸 해결하기 위해,
 * z값 분포를 계산하는 새로운 공식이 필요한데
 * 그게 바로 logarithmic Depth Buffer 라고 하는 것임.
 *
 * logarithmic 는 '로그함수' 를 뜻함.
 * 로그함수는 아무래도 선형 깊이버퍼와는 반대로
 * 비선형적으로 깊이버퍼를 계산해주게 되고,
 * 멀리 있는 물체의 z값에 대해서도 일정 수준의 정밀도를 보장하나 봄.
 *
 * 구체적인 공식은 아래와 같음.
 * Z = log(Cz + 1) / log(CFar + 1) * w
 *
 * [참고] https://doc.babylonjs.com/features/featuresDeepDive/materials/advanced/logarithmicDepthBuffer
 * [참고] https://www.gamedeveloper.com/programming/logarithmic-depth-buffer
 */
