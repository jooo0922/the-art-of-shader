precision highp float;

// 사용자 정의 uniforms
uniform float time;
uniform sampler2D postEffectTex; // 렌더타겟 텍스쳐
uniform sampler2D noiseTex; // 노이즈 텍스쳐

varying vec3 vPosition;
varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // 렌더타겟 텍스쳐 샘플링. 각각 uv에 서로 다른 임의의 vec2 를 곱하거나 더해줌으로써,
  // 원본 텍스쳐를 각각 다른 방식으로 offset 하여 샘플링해옴. -> texColor1, 2, 3 이 샘플링된 모습이 서로 다를거임.
  // 이처럼 셰이더는 무슨 특별난 공식이 있다기 보다는, 그럴싸해 보일때까지 값을 계속 임의로 조정하는 과정을 거침.  
  vec4 texColor1 = texture2D(postEffectTex, vUv * vec2(1.05, 1.05) - vec2(0.025, 0.025));
  vec4 texColor2 = texture2D(postEffectTex, vUv * vec2(0.8, 0.75) + vec2(0.1, 0.075));
  vec4 texColor3 = texture2D(postEffectTex, vUv * vec2(0.6, 0.55) + vec2(0.2, 0.175));

  // 노이즈 텍스쳐를 시간의 흐름에 따라 y축(v컴포넌트 방향)으로 스크롤링하여 샘플링함.
  // 이때, 각 샘플링마다 가져오는 컴포넌트가 다르며, r 컴포넌트는 0.6배속, g는 0.7배속, b는 0.8배속으로 가져옴.
  // 또한, 각 샘플링마다 uv 범위도 다르게 해서 r 컴포넌트는 0.0 ~ 1.0, g는 0.0 ~ 2.0, b는 0.0 ~ 3.0 으로 세팅함. 
  float noise1 = texture2D(noiseTex, vUv - vec2(0.0, time * 0.6)).r;
  float noise2 = texture2D(noiseTex, vUv * 2.0 - vec2(0.0, time * 0.7)).g;
  float noise3 = texture2D(noiseTex, vUv * 3.0 - vec2(0.0, time * 0.8)).b;

  // 위에서 샘플링한 노이즈 텍스쳐의 각 r, g, b 컴포넌트 값을 65 : 30 : 5 비율로 섞음.
  // r, g 값이 모두 강한 영역일수록(노란색?) noise 값이 커지겠군
  // 참고로, 현재 noise 값의 범위는 별도의 맵핑이 없었으므로, 0 ~ 1 사이겠지
  float noise = noise1 * 0.65 + noise2 * 0.3 + noise3 * 0.05;

  // 0 ~ 1 사이의 두 샘플링값을 더한 뒤, 2로 나눔. 
  // -> 렌더타겟 텍스쳐의 r값이 강하고, 노이즈 텍스쳐의 노란색, 흰색에 가까워질수록 mask1 값은 커질거임
  float mask1 = (texColor1.r + noise) / 2.0;

  // noise 값을 -1 ~ 1 사이로 맵핑한 뒤 더해줌으로써, mask2 는 음수도 나올 수 있게 됨.
  // mask1 과 마찬가지로, 렌더타겟 텍스쳐의 r값이 강하고, 노이즈 텍스쳐의 노란색, 흰색에 가까워질수록 값이 커지지만,
  // 반대로 mask1 값이 커질수록 0에 가까운 값을 곱하게 되므로, 값이 약간 조정됨.
  float mask2 = (texColor2.r + (noise * 2.0 - 1.0)) * (1.0 - mask1);

  // texColor3.r + noise * 0.5 값의 범위는 렌더타겟 텍스쳐의 r값 및 노이즈 텍스쳐의 노란색, 흰색이 가까운 영역일수록 0 ~ 1.5 사이의 값이 리턴될거임.
  // 이 값이 0.5보다 작으면 0을, 0.5 ~ 1.0 사이이면 0 ~ 1 사이로 보간을, 1.0보다 크면 1.0을 리턴해 줌.
  float mask3 = smoothstep(0.5, 1.0, texColor3.r + noise * 0.5);

  // mask1, 2, 3 을 가지고서 최종적인 mask 값을 만듦.
  float mask = (mask1 * 2.0 + mask2) / 3.0 * mask3;

  // mask 를 세 제곱 했을때, 0.05보다 작으면 0, 0.05 와 0.17 사이면 0 ~ 1 사이 보간, 0.17 보다 크면 1로 리턴함
  float strength = smoothstep(0.05, 0.17, pow(mask, 3.0));
  vec3 hsv1 = vec3(0.54, 0.8, 0.85);
  vec3 hsv2 = vec3(0.53, 0.05, 0.95);
  vec3 rgb = hsvToRgb(mix(hsv1, hsv2, strength)); // strength 값이 클수록 hsv2, 작을수록 hsv1 색상이 더 강하게 섞이겠군

  // 마찬가지로 mask 를 세 제곱한 값이 0.05 보다 작은 영역은 투명도를 0으로 떨궈놓고,
  // 0.05 와 0.055 사이면 0 ~ 1 사이 보간, 0.055 보다 크면 투명도를 1로 찍어버림.
  float opacity = smoothstep(0.05, 0.055, pow(mask, 3.0));

  if(opacity < 0.01) {
    discard; // 투명도값이 0.01 보다 작은 영역은 픽셀에 색상을 그리지 않음.
  }

  gl_FragColor = vec4(rgb, opacity);
}