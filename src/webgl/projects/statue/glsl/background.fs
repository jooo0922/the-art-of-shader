precision highp float;

// 사용자 정의 uniform 변수
uniform float noiseScale; // 노이즈 스케일
uniform float noiseThreshold; // 노이즈 알갱이를 표현할 지 말 지를 결정하는 threshold 값
uniform float normalizedMoveX; // 0.0 ~ 1.0 사이의 값으로 정규화된 마우스(터치) x좌표값
uniform float devicePixelRatio;
uniform vec2 resolution; // 리사이징될 때마다 업데이트되는 윈도우 해상도 값. -> gl_FragCoord 를 이 값으로 나눠서 2D 스크린 좌표계를 0.0 ~ 1.0 사이의 좌표값으로 맵핑시킬 것임.

// Simplex noise 함수 가져오기 
// 참고로 snoise2 은 vec2 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // grain effect (노이즈 색상값) 계산
  vec2 uv = gl_FragCoord.xy / (noiseScale * devicePixelRatio); // gl_FragColor, noiseScale, devicePixelRatio 에 대한 자세한 설명 statue.fs 참고
  float noise = snoise2(uv) * 0.5 + 0.5; // snoise2 함수는 -1 ~ 1 사이의 값을 반환하는데, 음수값은 조명값을 전체적으로 어둡게 만드므로, 0 ~ 1 사이의 값으로 맵핑함.
  if(noise > noiseThreshold) {
    // 배경색은 노이즈 알갱이가 빼곡하게 다닥다닥 박히기보다는,
    // 좀 듬성듬성 박히게 하고싶기 때문에, 일정 threshold 를 넘어가는 노이즈값은 전부 1.0 으로 끌어올림.
    // -> 결과적으로, noiseColor 값이 vec3(1.0, 1.0, 1.0) 이 되면서, 배경색과 곱했을때, 노이즈 색상이 아닌 배경색이 나오도록 하려는 것!
    noise = 1.0;
  }
  vec3 noiseColor = vec3(noise); // 노이즈 색상값 계산

  // 물체의 원색상 계산
  vec3 originalColor = hsvToRgb(vec3(0.119, 0.67, 0.99));

  // 최종 색상 계산
  vec3 finalColor = originalColor;
  float normalizedX = gl_FragCoord.x / (resolution.x * devicePixelRatio); // 늘어난 gl_FragCoord.x 범위만큼 장치 픽셀의 개수로 한번 더 나눠 줌
  if(normalizedX > normalizedMoveX) {
    // 현재 정규화된 마우스(터치) x좌표값과 비교해서, 더 큰 영역은 grain noise 를 적용하고,
    // 더 작은 영역은 적용하지 않음 -> 마우스 움직임에 따라 화면이 분할될것임!
    finalColor *= noiseColor;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}