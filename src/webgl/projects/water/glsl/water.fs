precision highp float;

// built-in uniforms
uniform vec3 cameraPosition; // 월드공간 카메라 좌표

// 사용자 정의 uniforms
uniform float time;
uniform vec3 lightDir; // 디렉셔널 라이트 조명벡터 방향
uniform vec3 lightCol; // 디렉셔널 라이트 색상
uniform samplerCube envMap;

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스 좌표를 구해서 프래그먼트 셰이더로 보간할 것임. (조명계산, 반사 및 굴절 샘플링 계산에 사용)
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임. (조명계산, 반사 및 굴절 샘플링 계산에 사용)

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition); // 각 프래그먼트 -> 카메라 방향벡터. 즉, 뷰 벡터!
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 보간과정에서 길이가 1로 유지되지 않으므로, 다시 normalize() 하여 길이를 1로 맞춤.

  // envMap term (반사 & 굴절에 의한 환경맵 샘플링)
  // 반사벡터 계산 (큐브맵 반사 샘플링에 사용)
  vec3 reflectionDir = reflect(-viewDir, normal); // reflect() 내장함수는 첫 번째 인자인 조명벡터(여기서는 뷰벡터)를 음수화하여 뒤집어줘야 함. 이유는 하단 필기 참고.

  // 굴절벡터 계산 (큐브맵 굴절 샘플링에 사용)
  float ratio = 1.00 / 1.33; // 굴절률(refractive index) 계산 (공기의 절대굴절률(1.00)과 물의 절대굴절률(1.33)을 나눠줘서 계산함.)
  vec3 refractionDir = refract(-viewDir, normal, ratio); // refraction() 내장함수도 첫 번쨰 인자인 조명벡터(뷰벡터)를 음수화하여 뒤집어줘야 함. 이유는 하단 필기 참고.

  // 반사색상 계산
  vec4 reflectionCol = textureCube(envMap, reflectionDir);

  // 굴절색상 계산
  vec4 refractionCol = textureCube(envMap, refractionDir);

  // rim 계산 (rim 값이 0에 가까울수록 시야(카메라)에서 가까우므로 굴절이 많아지고, 1에 가까울수록 시야(카메라)에서 멀어질수록 반사가 많아지도록 계산하기 위해 필요한 값.)
  // 원래 내적값 자체는 카메라에서 가까울수록 1에 가깝지만, rim(테두리) 영역으로 갈수록 1에 가까워야 변수명을 rim 으로 지은 의미가 있으므로, 1에서 내적값을 빼서 뒤집어준 것임.
  float rim = 1.0 - max(0.0, dot(normal, viewDir)); // max() 함수를 이용해서 음수인 내적값은 제거함.
  rim = pow(rim, 2.0); // rim 영역 테두리 두께를 얇게 하려고 rim값을 거듭제곱해줌. -> rim 그래프가 지수함수 그래프처럼 곡선으로 그려짐.

  // rim 값 비율에 따라 굴절색상과 반사색상을 적절히 섞은 (투명하게 비치는)배경색상 계산
  vec3 envMapCol = (reflectionCol.rgb * rim) + (refractionCol.rgb * (1.0 - rim)); // rim 영역(테두리)으로 갈수록 반사가, 안쪽으로 들어올수록 굴절이 많아지도록 색상을 섞음.

  // specular term (Blinn-Phong)
  vec3 halfVec = normalize(viewDir + lightDir); // 뷰 벡터와 조명벡터 사이의 하프벡터를 구함.
  float specAmt = max(0.0, dot(halfVec, normal)); // 하프벡터와 노말벡터 사이의 내적값을 구한 뒤, max() 함수로 음수값 제거.
  float specBright = pow(specAmt, 512.0); // 물 재질은 거울처럼 반사가 아주 세므로, 스펙큘러 계산 시 광택지수(shininess)를 512 처럼 높게 잡아줘야 함.
  vec3 specCol = lightCol * specBright; // 조명색상과 스펙큘러 라이팅 값을 최종적으로 곱해줌.

  // final term (최종 색상 계산)
  vec3 finalCol = envMapCol + specCol;

  gl_FragColor = vec4(finalCol, 1.0);
}

/*
  구체에서 굴절 샘플링(refractionCol) 적용 시, 
  위아래가 뒤집어져 보이는 이유

  일단 뒤집어져 보이는 게 정상이고 제대로 계산된 게 맞음.

  구체는 원래 굴절이 발생하면
  위쪽으로 들어온 빛이 아래쪽으로 굴절되서 나가고,
  아래쪽으로 들어온 빛이 위쪽으로 굴절되서 나가기 때문에
  
  구체에 맻힌 상이 위아래가 뒤집어져 보이는 게 
  정상적인 거라고 보면 됨.

  [참고]: https://stackoverflow.com/questions/13386003/glsl-refraction-getting-mapped-upside-down
*/

/*
  굴절벡터 계산 시 유의점.

  원래 굴절벡터는 빛이 들어올 때 한번,
  빛이 나갈 때 한 번, 총 2번 계산되어야 하는 게
  물리적으로 더 정확한 계산이라고 할 수 있음.

  그러나 1번만 굴절벡터를 계산해줘도
  대부분의 경우 굴절 샘플링의 결과물이 
  잘 나타나기 때문에, 
  
  LearnOpenGL 예제에서도
  1번만 해줘도 충분하다고 설명하고 있음.

  [참고]: https://learnopengl.com/Advanced-OpenGL/Cubemaps
*/

/*
  reflect(조명벡터(뷰벡터), 노멀벡터) 

  reflect() 함수는 복잡한 반사벡터 계산 공식을
  GLSL 내장함수로 쉽게 처리할 수 있게 해줌.

  단, 주의할 점은, 첫 번째 인자로 들어가는 조명벡터는
  reflect() 함수가 이미 '광원 -> 메쉬표면 방향으로 향하는 벡터' 가
  들어오는 것으로 인지하고 있음.

  그런데, 우리가 뷰 벡터를 만들 때,
  '각 프래그먼트 -> 카메라 방향' 벡터로 만들었기 때문에,
  reflect() 함수가 예상하는 방향의 벡터로 한 번 뒤집어준 뒤에
  인자로 넣어줘야 함.

  따라서 -를 곱해 음수화하여
  '카메라 -> 각 프래그먼트 방향' 벡터로 뒤집어준 뒤에 넣어줘야 
  제대로 된 방향벡터를 구할 수 있을거임.

  ***참고로, LearnOpenGL 튜토리얼에서는
  refraction() 함수도 위와 같이 뒤집어진 뷰벡터,
  즉, '카메라 -> 각 프래그먼트 방향' 벡터를 받아야
  제대로 된 굴절벡터가 계산되는 것으로 설명하고 있음.

  사실 반사벡터랑 동일한 말인 게,
  빛이 반사가 되건 굴절이 되건
  '광원 -> 각 프래그먼트 방향' 으로 빛이 들어오는 게 맞으니까
  실제 물리 현상에서의 빛의 방향에 맞게 
  내장함수들도 설계된 것 같음.
*/
