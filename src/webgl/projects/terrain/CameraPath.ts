import * as THREE from "three";

const DURATION = 7; // 카메라가 CatmullRomCurve3 경로를 한바퀴 도는 데 걸리는 지속시간 -> 값이 작을수록 카메라가 빨리 움직임.
const CURVE_HEIGHT = -17;

/**
 * CatmullRomCurve3 로 그린 Curve 는 삐뚤빼뚤해서
 * 카메라가 해당 경로를 따라 움직이면 어지럽고 멀미가 발생함...
 *
 * 따라서, 이를 대신하기 위해
 * 2D Curve 를 그려주는 EllipseCurve 를 사용하여
 * 카매라 이동 경로를 그려주기로 함.
 */
export default class CameraPath extends THREE.EllipseCurve {
  constructor() {
    // 타원형 Curve 경로의 형태와 위치를 정의함.
    const aX = -55;
    const aY = 80;
    const xRadius = 70;
    const yRadius = 80;
    const aStartAngle = 0;
    const aEndAngle = Math.PI * 2;
    const aClockwise = false;
    const aRotation = THREE.MathUtils.degToRad(-40);
    super(
      aX,
      aY,
      xRadius,
      yRadius,
      aStartAngle,
      aEndAngle,
      aClockwise,
      aRotation
    );
  }

  // EllipseCurve 경로상에 위치하는 카메라 현재 좌표값 계산
  getCameraPosition(time: number) {
    const t = (time % DURATION) / DURATION;
    const point = this.getPointAt(t);
    const position = new THREE.Vector3(point.x, CURVE_HEIGHT, point.y); // EllipseCurve 는 x,y 값만 갖는 2d curve 이므로, y좌표값을 Vector3 z값에 맵핑해줘야 함.
    return position;
  }

  // EllipseCurve 경로상에 위치하는 카메라 현재 lookAt 값 계산 (카메라가 현재 위치하는 EllipseCurve 상의 Point 보다 0.1 정도 앞에 있는 곳을 바라보도록 설정함.)
  getCameraLookAt(time: number) {
    const t = ((time + 0.1) % DURATION) / DURATION;
    const point = this.getPointAt(t);
    const lookAt = new THREE.Vector3(point.x, CURVE_HEIGHT, point.y); // EllipseCurve 는 x,y 값만 갖는 2d curve 이므로, y좌표값을 Vector3 z값에 맵핑해줘야 함.
    return lookAt;
  }
}
