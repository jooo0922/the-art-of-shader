// 사용자 정의 attribute 변수
attribute vec3 position; // 각 포인트 위치 좌표값
attribute float delay; // 각 포인트 투명도 지속시간 (0.0 ~ 4.0 사이의 랜덤한 지속시간)

// built-in uniforms 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform 변수
uniform float time; // 시간변수
uniform float duration; // 각 포인트의 투명도 최대 지속시간(4.0)
uniform vec2 resolution; // 리사이징될 때마다 갱신되는 브라우저 window 사이즈
uniform float maxY; // 각 Point 들이 y축 방향으로 최대한 올라갈 수 있는 높이값 
uniform sampler2D noiseTex; // 노이즈 텍스쳐

// 보간변수
/*
  그러나, 이 셰이더는 Points 객체에 사용되는 셰이더이므로,
  Points 의 각 버텍스에만 적용이 되고 있음. 
  따라서, 이 경우에는 버텍스 사이의 프래그먼트들 각각에 실제 보간이 이뤄지는 건 아니고, 
  '해당 버텍스의 투명도값을 계산해주는 프래그먼트 셰이더로 넘겨준다' 는 표현이 더 정확함. 
*/
varying float vAlpha;

void main() {
  // 시간의 흐름에 따른 각 point 들의 높이값 계산에 사용될 moveY 를 계산함.
  // 이때, mod(time - delay, duration) 는 duration(= 4.0) 에 대한 나머지 연산이므로,
  // 0.0 ~ 4.0 사이의 값이 나올거고, 
  // 이 값은 시간의 흐름(time)에 따라, 각 point 버텍스들에 주어진 랜덤 delay 값(0.0 ~ 4.0 사이)에 따라 약간씩 달라지겠지!
  // delay 값이 크면 클수록, time - delay 값은 동일한 시간이 흘러도 더 작아질 것이고, mod(time - delay, duration) 0 -> 4 까지 도달하는 시간이 더 오래걸리는 원리임!
  // 그런데, 투명도는 0 ~ 1 사이의 값만 가능하므로, 각 버텍스마다 약간씩 다른 0 ~ 4 사이의 값을 0 ~ 1로 맵핑시켜주려고 다시 duration 으로 나눈 것임.
  // 결과적으로 moveY 값은 시간의 흐름에 따라, 각 point 버텍스들의 delay 에 따라 0 ~ 1 사이를 주기적으로 반복할거임.
  float moveY = mod(time - delay, duration) / duration;

  // 프래그먼트 셰이더로 넘겨줄 투명도값 계산
  float alpha = moveY; // 일단 0 ~ 1 사이의 moveY 값을 투명도 값으로 그대로 넣어줌.
  if(moveY > 0.5) {
    // 만약 moveY 가 절반 지점(0.5) 를 넘어섰다면, 다시 0.5, 0.4, 0.3,... 이렇게 내림차순으로 계산되도록 해줌.
    alpha = 1.0 - moveY;
  }
  alpha = alpha * 2.0; // 위의 조건절에 의해 alpha 값의 범위가 0 ~ 0.5 사이가 됬으므로, 이를 다시 0 ~ 1 사이로 맵핑시킨 것!

  // 시간의 흐름(time)에 따라, 각 버텍스마다 랜덤하게(delay) 달라지는 moveY 값에 의해 보정되는 각 point 버텍스별 높이값을 계산하는 vec3 데이터.
  // 0.0 ~ 1.0 사이의 moveY 값을 0.0 ~ maxY(Point들이 올라갈 수 있는 최대 y좌표값) 사이의 값으로 맵핑하여 y좌표값(높이)에 넣고 있음. 
  vec3 risePosition = vec3(0.0, moveY * maxY, 0.0);

  // 노이즈 텍스쳐로부터 샘플링한 값의 r, g, b 컴포넌트를 각각 가져온 뒤, 0 ~ 1 사이의 텍셀값의 범위을 -1 ~ 1 사이의 범위로 맵핑시킴
  // 이런 유형의 공식들은, "각 Points 버텍스 위치에 따라, 시간의 흐름에 따라 각 채널의 노이즈값이 -1 ~ 1 사이로 계산되겠군!" 정도로만 이해하면 됨.
  float noiseR = texture2D(noiseTex, position.yz * 0.4 + vec2(time * 0.02, 0.0)).r * 2.0 - 1.0;
  float noiseG = texture2D(noiseTex, position.zx * 0.4 + vec2(0.0, time * 0.02)).g * 2.0 - 1.0;
  float noiseB = texture2D(noiseTex, position.xy * 0.4 + vec2(time * 0.02, time * 0.02)).b * 2.0 - 1.0;

  // 노이즈 텍스쳐를 사용한 Points 의 보정좌표값을 계산함 (각 버텍스마다 xyz축 방향으로 왔다갔다할 수 있게 해주는 보정값임).
  // 공식을 보아하니, 보정좌표값은 샘플링한 -1 ~ 1 사이의 노이즈값과, 0 ~ 1 사이의 moveY 값에 의해서 결정되겠군!
  // 또, 마지막에 곱해준 값이 3인걸 보니, 보정 좌표값들은 (-4, -4. -4) ~ (4, 4, 4) 사이의 좌표값이 나오겠군!
  vec3 noisePosition = vec3(noiseR, noiseG, noiseB) * moveY * 4.0;

  // Points.ts 에서 계산해주는 position 값에 vec3 보정값들인 risePosition 을 더한 뒤,
  // 눈 좌표계(= 뷰 좌표계. 카메라가 원점인 좌표계)까지 우선 변환해 줌.
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(position + risePosition + noisePosition, 1.0);

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
  float pointSize = 3.0 * (40.0 / distanceFromCamera) * (resolution.y / 1024.0);
  // pointSize 계산 시, Ball 과 다르게 pixelRatio 를 곱해주지 않음.
  // Ball 에서는 pixelRatio 를 곱해주지 않으면, 맥북같은 레티나 디스플레이에서는 Point 가 너무 작아져서 곱해줘야 하지만,
  // Galaxy, MagicCircle 등에서는 pixelRatio 를 곱해주면 레티나에서 오히려 사이즈가 비정상적으로 커짐. 
  // 아마 PointSize 를 계산하는 과정, 또는 렌더링하는 방식이 달라서 그런 것 같음...

  // 각 버텍스 point 들에서 계산된 투명도 값을 프래그먼트 셰이더로 전달
  vAlpha = alpha;

  gl_Position = projectionMatrix * mvPosition; // 나머지 투영행렬을 곱해서 클립좌표로 저장
  gl_PointSize = pointSize;
}