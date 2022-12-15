import * as THREE from "three";
import * as SkeletonUtils from "./utils/SkeletonUtils";

export default class CharacterGroup extends THREE.Group {
  private character: THREE.Object3D | undefined;

  private mixer: THREE.AnimationMixer | undefined;

  private clock: THREE.Clock;

  constructor() {
    super();
    this.name = "Character";
    this.clock = new THREE.Clock();
  }

  public init(): void {}

  public update(time: number): void {
    // 애니메이션 믹서에 델타타임 값(프레임 사이의 시간 간격)을 넘겨주면서
    // 믹서에 등록된 애니메이션들을 업데이트 해줘야 함.
    const deltaTime = this.clock.getDelta();
    this.mixer?.update(deltaTime);
  }

  public setModel(model: THREE.Object3D): void {
    this.character = SkeletonUtils.clone(model);
    this.character.traverse((child: THREE.Object3D) => {
      child.frustumCulled = false;
    });
    this.add(this.character);
  }

  /**
   *  애니메이션 클립을 인자로 전달받아서 애니메이션을 재생한다.
   * @param animationClip 애니메이션 클립. 애니메이션의 가장 기본 단위. 단위 애니메이션에 대한 기본 데이터가 저장되어 있음.
   */
  public setAnimation(animationClip: THREE.AnimationClip): void {
    if (this.character) {
      this.mixer = new THREE.AnimationMixer(this.character); // 애니메이션 믹서 생성 (전달받은 오브젝트의 여러 애니메이션을 조합하여 관리하는 요소)
      const animationAction = this.mixer.clipAction(animationClip); // 애니메이션 액션 생성 (애니메이션 클립에 저장된 데이터를 가져와서 실질적으로 애니메이션을 제어하는 요소)
      animationAction.play(); // 에니메이션을 활성화 해달라고 믹서에 요청하는 것
    }
  }
}
