precision highp float;

// 사용자 정의 uniforms
uniform float time; // 시간변수
uniform sampler2D noiseTexList[2]; // 2개의 노이즈 텍스쳐가 담긴 배열

// 보간변수
varying vec2 vUv; // 보간된 버텍스 uv 좌표값

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

// 시간의 흐름에 따라, 인자로 넣은 노이즈 텍스쳐에 따라 달라지는 노이즈 값을 반환하는 함수
float getNoise(sampler2D noiseTex) {
  // uv의 u좌표 범위가 0 ~ 1 사이이다 보니, tubeGeometry 에 씌워지는 텍스쳐가 u축 방향으로 길게 늘어지게 됨. 
  // -> u축 좌표값 범위를 20배 늘려서 텍스쳐가 u축 방향으로 반복되도록 함으로써, 텍스쳐가 덜 늘어지게 함.
  vec2 coord = vec2(vUv.x * 20.0, vUv.y);

  // 노이즈 텍스쳐로부터 샘플링한 값의 r, g, b 컴포넌트를 각각 가져온 뒤,
  // time 유니폼 변수를 사용하는걸 보면 시간의 흐름에 따라 샘플링되는 컴포넌트의 값이 달라지갰군
  float noiseR = texture2D(noiseTex, coord + vec2(time * 0.05, 0.0)).r;
  float noiseG = texture2D(noiseTex, coord + vec2(0.0, time * 0.05)).g;
  float noiseB = texture2D(noiseTex, coord - vec2(time * 0.05, time * 0.05)).b;
  float noise = noiseR * noiseG * noiseB;

  return noise;
}

void main() {
  float noise1 = getNoise(noiseTexList[0]);
  float noise2 = getNoise(noiseTexList[1]);

  vec3 backgroundColor = hsvToRgb(vec3(0.0, 0.0, 0.0)); // 볼텍스의 검정색 배경
  vec3 effectColor1 = hsvToRgb(vec3(0.561, 0.95, 0.8)); // 볼텍스의 이펙트 색상1
  vec3 effectColor2 = hsvToRgb(vec3(0.78, 0.90, 0.8)); // 볼텍스의 이펙트 색상2
  vec3 brightColor = hsvToRgb(vec3(0.0, 0.0, 1.0)); // 각 볼텍스 이펙트의 가장 밝은 영역 색상 (흰색)

  // 배경색과 각 이펙트 색상을 smoothstep 으로 보간된 노이즈값에 따라 섞어줌
  // 이때, edge0 값이 작을수록, 노이즈값이 작은 영역이라도, 배경색과 섞인 어두운 색으로라도 칠해주고, (즉, 순수한 검정색 배경이 덜 나오게 되고)
  // edge1 값이 작을수록, 노이즈값이 작은 영역이라도, edge1 보다만 크다면 이펙트 색상이 나오게 됨으로써, 전체적으로 밝은 색(이펙트 색)이 더 많이 칠해지도록 함.
  vec3 noiseColor1 = mix(backgroundColor, effectColor1, smoothstep(0.12, 0.25, noise1));
  vec3 noiseColor2 = mix(backgroundColor, effectColor2, smoothstep(0.12, 0.25, noise2));

  // 위에서 배경색과 섞어준 이펙트 색상을 smoothstep 으로 보간된 노이즈값에 따라 brightColor(가장 밝은 영역 색상)과 다시 섞어줌
  // 이때, edge0 값이 작을수록, 위에서 섞어준 색상에서 덜 밝은 영역까지도 brightColor 와 섞이게 되고,
  // edge1 값이 작을수록, brightColor(순수 흰색. 하이라이트 색상) 가 칠해지는 영역이 더 넓어지게 됨. 
  // -> 왜냐? smoothstep 의 결과값이 1로 나오는 영역이 더 넒어지니, 당연히 brightColor 의 영역도 더 넓어지겠지!
  noiseColor1 = mix(noiseColor1, brightColor, smoothstep(0.2, 0.35, noise1));
  noiseColor2 = mix(noiseColor2, brightColor, smoothstep(0.2, 0.35, noise2));

  // 최종 색상 계산 
  // -> 두 노이즈 색상을 더해줌. 곱해주면 배경색(0, 0, 0)과 곱했을 때 검정색이 되기 때문에, 그냥 더해줘서 두 색상 모두 나오도록 한 것.
  vec3 finalColor = vec3(noiseColor1 + noiseColor2);

  gl_FragColor = vec4(finalColor, 1.0);
}