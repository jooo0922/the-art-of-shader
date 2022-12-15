import { GrannyKnot } from "three/examples/jsm/curves/CurveExtras"; // Three.js 가 제공하는 built-in 커브를 가져올 수 있는 url

const DURATION = 7; // 카메라가 GrannyKnot 커브 경로를 한바퀴 도는 데 걸리는 지속시간 -> 값이 작을수록 카메라가 빨리 움직임.

export default class CameraPath extends GrannyKnot {
  // GrannyKnot 커브 경로상에 위치하는 카메라 현재 좌표값 계산
  getCameraPosition(time: number) {
    const t = (time % DURATION) / DURATION; // DURATION 값이 클수록 t값이 0 ~ 1 로 주기를 반복하는데 걸리는 시간이 길어짐 -> 즉, 커브 한바퀴 도는 데 걸리는 시간이 더 길어진다는 뜻!
    const point = this.getPointAt(t);
    const position = point.clone(); // 원본 벡터값이 훼손되지 않도록 복사본을 반환함.
    return position;
  }

  // GrannyKnot 커브 경로상에 위치하는 카메라 현재 lookAt 값 계산 (카메라가 현재 위치하는 경로상의 Point 보다 0.1 정도 앞에 있는 곳을 바라보도록 설정함.)
  getCameraLookAt(time: number) {
    const t = ((time + 0.1) % DURATION) / DURATION;
    const point = this.getPointAt(t);
    const lookAt = point.clone(); // 원본 벡터값이 훼손되지 않도록 복사본을 반환함.
    return lookAt;
  }
}
