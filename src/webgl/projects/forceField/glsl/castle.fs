precision highp float;

// 사용자 정의 uniforms
uniform float time;

varying vec3 vNormal;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 light = normalize(vec3(-1.0, 1.0, 0.2)); // 디렉셔널 라이트 벡터
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤
  float diffuse = dot(normal, light); // 디퓨즈 라이팅 계산

  vec3 rgb = hsvToRgb(vec3(0.05, 0.01, 0.03));
  vec4 finalCol = vec4(rgb * diffuse, 1.0);

  gl_FragColor = finalCol;
}
