// 사용자 정의 attribute 변수
attribute vec3 position; // 각 포인트 위치 좌표값
attribute float delay; // 각 포인트 투명도 지속시간 (0.0 ~ 4.0 사이의 실수)

// built-in uniforms 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniforms 변수
uniform float time; // 시간 변수
uniform float duration; // 각 포인트의 투명도 최대 지속시간(4.0)
uniform vec2 resolution; // 리사이징될 때마다 갱신되는 브라우저 window 사이즈
uniform float pixelRatio; // css 픽셀 1개 당 디바이스의 물리적 픽셀 개수 비율
uniform sampler2D noiseTex; // 노이즈 텍스쳐

// 프래그먼트로 보간할 변수들
// 그러나, 이 셰이더는 Points 객체에 사용되는 셰이더이므로,
// Points 의 각 버텍스에만 적용이 되고 있음. 
// 따라서, 이 경우에는 버텍스 사이의 프래그먼트들 각각에 실제 보간이 이뤄지는 건 아니고, 
// '해당 버텍스의 색상을 계산해주는 프래그먼트 셰이더로 넘겨준다' 는 표현이 더 정확함. 
varying vec3 vColor;
varying float vAlpha;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // 버텍스 셰이더로 넘겨줄 각 point 들의 투명도를 계산함.
  // 이때, mod(time - delay, duration) 는 duration(= 4.0) 에 대한 나머지 연산이므로,
  // 0.0 ~ 4.0 사이의 값이 나올거고, 
  // 이 값은 시간의 흐름(time)에 따라, 각 point 버텍스들에 주어진 랜덤 delay 값(0.0 ~ 4.0 사이)에 따라 약간씩 달라지겠지!
  // 그런데, 투명도는 0 ~ 1 사이의 값만 가능하므로, 각 버텍스마다 약간씩 다른 0 ~ 4 사이의 값을 0 ~ 1로 맵핑시켜주려고 다시 duration 으로 나눈 것임.
  // 결과적으로 alpha 값은 시간의 흐름에 따라, 각 point 버텍스들의 delay 에 따라 0 ~ 1 사이를 왔다갔다 할거임.
  float alpha = mod(time - delay, duration) / duration;

  // 시간의 흐름(time)에 따라, 각 버텍스마다 랜덤하게(delay) 달라지는 alpha 값에 의해 보정되는 각 point 버텍스별 높이값을 계산하는 vec3 데이터.
  // 0.0 ~ 1.0 사이의 alpha 값을 -4.0 ~ 6.0 사이의 값으로 맵핑하여 y좌표값(높이)에 넣고 있음.
  vec3 risePosition = vec3(0.0, alpha * 10.0 - 4.0, 0.0);

  // 노이즈 텍스쳐로부터 샘플링한 값의 r, g, b 컴포넌트를 각각 가져온 뒤, 0 ~ 1 사이의 텍셀값의 범위을 -1 ~ 1 사이의 범위로 맵핑시킴
  /*
    1. position.xyz 에서 y는 일단 0으로 넘어오고 있고, xz 는 반지름이 1 ~ 5 사이인 원의 좌표상에 존재하므로, 
    여기에 0.4를 곱한다면, 0.4 ~ 2.0 사이의 맵핑된 값으로 구성된 vec2 값이 나오겠지.

    2. 1번의 vec2 값에 시간의 흐름에 따라 변하는 time 변수에 0.02 를 곱한 값 또는 0.0 을 컴포넌트로 갖는
    vec2 값을 더해줌으로써, 최종적으로 0.4 ~ 2.0 + time * 0.02 사이의 값으로 구성된 vec2 값이 나올거임.
    이 값을 이용해서 노이즈 텍스쳐를 샘플링하게 됨.

    3. 2번의 uv좌표값의 범위가 1을 넘어가고 있지만 괜찮음.
    왜냐면 noiseTex 는 WebGLContent.ts 에서 wrap 모드를 THREE.RepeatWrapping 으로 설정해줬으므로
    1을 넘어가면 처음부터 다시 반복적인 샘플링을 진행함. 
  */
  float noiseR = texture2D(noiseTex, position.yz * 0.4 + vec2(time * 0.02, 0.0)).r * 2.0 - 1.0;
  float noiseG = texture2D(noiseTex, position.zx * 0.4 + vec2(0.0, time * 0.02)).g * 2.0 - 1.0;
  float noiseB = texture2D(noiseTex, position.xy * 0.4 + vec2(time * 0.02, time * 0.02)).b * 2.0 - 1.0;

  // 노이즈 텍스쳐에서 샘플링한 값에 따라 각 point 버텍스의 위치값을 보정해줄 수 있는 vec3 값 계산.
  // noiseR,G,B 값은 각각 샘플링한 텍셀값, time 변수에 의해서도 달라지고, 
  // alpha 가 곱해짐으로써 각 버텍스마다 랜덤하게 할당받는 delay 값에도 영향을 받아서 보정되겠군.
  // 각 noiseR,G,B 값은 -1 ~ 1 사이의 값이고, 0 ~ 1 사이의 alpha 값과 곱해주면 이 역시 -1 ~ 1 사이의 값이 나올거고,
  // 마지막으로 12.0 을 곱해주면 -12 ~ 12 범위로 맵핑된 값으로 구성된 vec3 보정값이 나오겠군.
  vec3 noisePosition = vec3(noiseR, noiseG, noiseB) * alpha * 12.0;

  // Points.ts 에서 계산해주는 position 값에 vec3 보정값들인 risePosition, noisePosition 을 더한 뒤,
  // 눈 좌표계(= 뷰 좌표계. 카메라가 원점인 좌표계)까지 우선 변환해 줌.
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(position + noisePosition + risePosition, 1.0);

  // 카메라에서 각 point 버텍스 사이의 거리를 계산함.
  // 눈좌표계는 카메라 위치가 원점이기 때문에, 눈좌표계 상의 vec3 좌표의 길이 자체가 카메라와 해당 버텍스와의 거리와 동일함.
  // 이걸 구하려고 먼저 눈좌표계 까지만 변환해줬나 봄.
  float distanceFromCamera = length(mvPosition.xyz);

  // gl_PointSize 에 넣어줄 버텍스 point 사이즈를 계산함
  /*
    1. 일단 pixelRatio 는 해상도가 클수록 css 픽셀 하나 당 물리적 픽셀 개수가 많아지므로,
    디바이스 해상도에 비례해서 point 사이즈가 커질 것이고,
    distanceFromCamera(각 버텍스와 카메라 사이의 거리)에는 당연히 반비례하게 사이즈가 계산될거임. 
    거리가 멀수록 작아지고, 거리가 가까울수록 커지겠지.

    2. 그리고 resolution.y / 1024.0 은 아마 
    브라우저 window 높이값이 1024.0 일 때를 기준으로 리사이징된 브라우저 사이즈가 몇이냐에 따라 
    point 사이즈를 결정하려고 하는거 같음. window 높이값이 1024.0 인 애는 원래의 사이즈대로 나올 것이고,
    1024.0 보다 크면 point 사이즈도 커질 것이고, 1024.0 보다 작으면 point 사이즈도 작아지겠군
  */
  float pointSize = 5.0 * (pixelRatio * 40.0 / distanceFromCamera) * (resolution.y / 1024.0);

  // 각 버텍스 point 들의 색상값을 계산하여 프래그먼트 셰이더로 전달
  // Hue 값을 각 버텍스마다 0 ~ 4 사이의 랜덤한 값으로 할당되는 delay 에 따라 달라지도록 함.
  // 채도와 명도는 각각 0.8, 0.4 로 고정
  vColor = hsvToRgb(vec3(0.25 + delay * 0.33, 0.8, 0.4));
  vAlpha = alpha; // 투명도는 위에서 계산한 alpha 를 그대로 프래그먼트 셰이더로 전달

  gl_Position = projectionMatrix * mvPosition; // 나머지 투영행렬을 곱해서 클립좌표로 저장
  gl_PointSize = pointSize;
}
