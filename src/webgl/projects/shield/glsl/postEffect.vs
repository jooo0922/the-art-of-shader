// built-in attribute 변수들
attribute vec3 position;
attribute vec2 uv;

// 보간변수
varying vec2 vUv;

void main() {
  vUv = uv; // uv좌표를 프래그먼트 셰이더로 보간하여 넘김
  gl_Position = vec4(position, 1.0); // 렌더타겟 평면의 버텍스 좌표값이므로, 아무런 변환도 하지 않은 평면의 버텍스 좌표값을 클립좌표로 저장함. 
}

/*
  렌더타겟을 그리는 평면 지오메트리는
  Orthographic Camera 로 렌더링하므로,
  projection matrix 도 필요없을 것이고,

  평면 지오메트리를 이동, 회전, 스케일하지도 않으므로,
  model matrix 도 필요없을 것이고,

  평면 지오메트리를 촬영하는 카메라를 움직이지도 않으므로,
  view matrix 도 필요없음!
*/