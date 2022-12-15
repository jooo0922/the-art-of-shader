precision highp float;

// 사용자 정의 uniforms
uniform float time;
uniform float renderOutline;
uniform sampler2D noiseTex;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 light = normalize(vec3(-1.0, 1.0, 0.2)); // 디렉셔널 라이트 벡터
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤
  float diffuse = dot(normal, light); // 디퓨즈 라이팅 계산

  // 노이즈 텍스쳐로부터 샘플링한 값의 r, g, b 컴포넌트를 각각 가져온 뒤, 0 ~ 1 사이의 텍셀값의 범위을 -1 ~ 1 사이의 범위로 맵핑시킴
  // time 유니폼 변수를 사용하는걸 보면 시간의 흐름에 따라 샘플링되는 컴포넌트의 값이 달라지갰군
  float noiseR = texture2D(noiseTex, normal.yz * 0.2 + vec2(time * 0.02, 0.0)).r * 2.0 - 1.0;
  float noiseG = texture2D(noiseTex, normal.zx * 0.2 + vec2(0.0, time * 0.02)).g * 2.0 - 1.0;
  float noiseB = texture2D(noiseTex, normal.xy * 0.2 - vec2(time * 0.02, time * 0.02)).b * 2.0 - 1.0;
  float noise = length(vec3(noiseR, noiseG, noiseB)); // 샘플링한 노이즈값의 r, g, b로부터 하나의 vec3 를 만들고, 그것의 길이값을 구함.

  vec3 hsvNoise = vec3(noise * 0.1, noise * 0.1, -noise * 0.1); // 아래에 정의된 hsv1, hsv2 값에 샘플링된 텍셀값으로부터 구한 길이값을 사용해 약간의 보정을 주려고 만든 vec3 값.
  vec3 hsv1 = vec3(0.51, 0.55, 0.14) + hsvNoise; // 안쪽 영역의 어두운 디퓨즈 라이팅 색상
  vec3 hsv2 = vec3(0.51, 0.83, 0.91) + hsvNoise; // 안쪽 영역의 밝은 디퓨즈 라이팅 색상
  vec3 rgb = mix(hsvToRgb(hsv1), hsvToRgb(hsv2), diffuse); // 디퓨즈 라이팅이 밝을수록 hsv2 색에 가까워지고, 어두울수록 hsv1 색에 가까워지겠군!

  vec3 hsv3 = vec3(0.5, 0.05, 0.95);
  // vColor 가 밝을수록(rimLight 영역) hsv3 색에 가까워지고, vColor 가 어두워질수록(안쪽 영역) rgb 색에 가까워지겠군. -> 즉, hsv3 는 rimLight 색상이구나!
  vec3 color = mix(rgb, hsvToRgb(hsv3), vColor) * (1.0 - renderOutline); // renderOutline 이 작을수록 원색이 나올거고, 클수록 전체적으로 어두워진 색상이 나오겠군
  vec3 colorOutline = vec3(1.0) * renderOutline; // 이번에는 renderOutline 이 클수록 톤업되겠고, 작을수록 톤다운되겠군. -> 위에 (1.0 - renderOutline) 과 보정되는 거 같음.

  gl_FragColor = vec4(color + colorOutline, 1.0);
}