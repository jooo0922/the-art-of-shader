import * as THREE from "three";
import Ray from "./Ray";
import ShortRayData from "./ShortRayData";
import LongRayData from "./LongRayData";

// 각 Ray 마다 uniform 변수들을 별도로 생성해야 하므로, InstancedMesh 로는 못하고 Group 으로 묶어서 관리하기로 함.
export default class RayGroup extends THREE.Group {
  private shortRayData: ShortRayData;

  private longRayData: LongRayData;

  constructor() {
    super();
    this.name = "RayGroup";
    this.shortRayData = new ShortRayData();
    this.longRayData = new LongRayData();
    this.addRays(this.shortRayData);
    this.addRays(this.longRayData);
  }

  private addRays(rayData: ShortRayData | LongRayData): void {
    let rayList = [];
    for (let i = 0; i < rayData.number; i++) {
      const rayWidth =
        Math.random() * (rayData.maxRayWidth - rayData.minRayWidth) +
        rayData.minRayWidth;
      const rayHeight =
        Math.random() * (rayData.maxRayHeight - rayData.minRayHeight) +
        rayData.minRayHeight;
      const ray = new Ray(rayWidth, rayHeight);
      this.add(ray);
      rayList.push(ray);
    }
    rayData.rayList = rayList;
  }

  public init(): void {
    this.children.forEach((ray) => {
      if (ray instanceof Ray) ray.init();
    });
    this.setRaysPosition(this.shortRayData);
    this.setRaysPosition(this.longRayData);
    this.setRaysFadeSpeed(this.shortRayData);
    this.setRaysFadeSpeed(this.longRayData);
    this.setRaysMoveDistance(this.shortRayData);
    this.setRaysMoveDistance(this.longRayData);
  }

  private setRaysPosition(rayData: ShortRayData | LongRayData): void {
    rayData.rayList.forEach((ray: Ray) => {
      const angle = THREE.MathUtils.degToRad(Math.random() * 360); // 각 광선 인스턴스 위치계산에 필요한 각도값을 0 ~ 360도 사이의 랜덤한 라디안 각도로 계산
      const perpendicularAngle = angle + THREE.MathUtils.degToRad(90); // 랜덤한 각도에 대해 수직인 각도를 구함. (즉, 랜덤 각도의 직선이 있다고 가정하면, 그 직선에 수직인 방향으로 광선 인스턴스 y축을 회전시키려는 것!)
      const radius =
        Math.random() * (rayData.maxRadius - rayData.minRadius) +
        rayData.minRadius; // 원점에서 각 광선 인스턴스 까지의 반경을 특정 범위 내의 랜덤값으로 계산
      let x = Math.sin(angle) * radius; // 광선 인스턴스의 랜덤한 x좌표값 계산
      let y = ray.rayHeight * 0.5; // 광선 인스턴스의 y 좌표값은 광선높이의 절반으로 지정하여 광선 하단이 원점에 오도록 함.
      let z = Math.cos(angle) * radius; // 광선 인스턴스의 랜덤한 z좌표값 계산
      ray.setPosition(x, y, z);
      ray.setRotation(0, perpendicularAngle, 0);
    });
  }

  private setRaysFadeSpeed(rayData: ShortRayData | LongRayData): void {
    rayData.rayList.forEach((ray: Ray) => {
      const fadeSpeed =
        Math.random() * (rayData.maxFadeSpeed - rayData.minFadeSpeed) +
        rayData.minFadeSpeed; // 각 광선 인스턴스의 fade 속도값을 특정 범위 내의 랜덤값으로 계산
      ray.setFadeSpeed(fadeSpeed);
    });
  }

  private setRaysMoveDistance(rayData: ShortRayData | LongRayData): void {
    rayData.rayList.forEach((ray: Ray) => {
      const moveDistance =
        Math.random() * (rayData.maxMoveDistance - rayData.minMoveDistance) +
        rayData.minMoveDistance; // 각 광선 인스턴스의 y축 최대 이동거리를 특정 범위 내의 랜덤값으로 계산
      ray.setMoveDistance(moveDistance);
    });
  }

  public update(time: number): void {
    this.children.forEach((ray) => {
      if (ray instanceof Ray) ray.update(time);
    });
  }

  public setTextures(
    shortRayTex: THREE.Texture,
    longRayTex: THREE.Texture
  ): void {
    this.shortRayData.rayList.forEach((ray: Ray) => {
      ray.setTexture(shortRayTex);
    });
    this.longRayData.rayList.forEach((ray: Ray) => {
      ray.setTexture(longRayTex);
    });
  }

  public setHSV(hsv: THREE.Vector3): void {
    this.children.forEach((ray) => {
      if (ray instanceof Ray) ray.setHSV(hsv);
    });
  }
}
