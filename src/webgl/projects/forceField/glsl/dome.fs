precision highp float;

// built-in uniform 변수
uniform vec3 cameraPosition; // 월드공간 카메라 좌표

// 사용자 정의 uniform 변수
uniform float time; // 시간 변수
uniform float cutoff; // opacity 를 숨길지 말지를 결정할 기준값
uniform float outlineThickness; // cutoff 값을 키워서 그려주는 경계선의 두께를 결정하는 값
uniform sampler2D noiseTex; // 노이즈 텍스쳐

varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임. (노이즈 텍스쳐 샘플링 및 rim 계산에 사용) 
varying vec3 vPosition; // 월드공간 버텍스 좌표를 구해서 프래그먼트 셰이더로 보간할 것임. (뷰벡터 및 rim 계산에 사용)
varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition); // 각 프래그먼트 -> 카메라 방향벡터. 즉, 뷰 벡터!
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤

  // 노이즈 텍스쳐로부터 샘플링한 값의 r, g, b 컴포넌트를 각각 가져온 뒤, 0 ~ 1 사이의 텍셀값의 범위를 -1 ~ 1 사이의 범위로 맵핑시킴
  // time 유니폼 변수를 사용하는걸 보면 시간의 흐름에 따라 샘플링되는 컴포넌트의 값이 달라지갰군
  // uv scrolling 으로 애니메이션을 적용한 샘플링 및 노이즈값 계산
  float animNoiseR = texture2D(noiseTex, normal.yz * 0.2 + vec2(time * 0.02, 0.0)).r * 2.0 - 1.0;
  float animNoiseG = texture2D(noiseTex, normal.zx * 0.2 + vec2(0.0, time * 0.02)).g * 2.0 - 1.0;
  float animNoiseB = texture2D(noiseTex, normal.xy * 0.2 - vec2(time * 0.02, time * 0.02)).b * 2.0 - 1.0;
  float animNoise = length(vec3(animNoiseR, animNoiseG, animNoiseB)); // 샘플링한 노이즈값의 r, g, b로부터 하나의 vec3 를 만들고, 그것의 길이값으로 노이즈를 계산함.

  // uv scrolling 을 적용하지 않은 정적인 샘플링 및 노이즈값 계산 
  float imageNoiseR = texture2D(noiseTex, normal.yz * 0.2).r * 2.0 - 1.0;
  float imageNoiseG = texture2D(noiseTex, normal.zx * 0.2).g * 2.0 - 1.0;
  float imageNoiseB = texture2D(noiseTex, normal.xy * 0.2).b * 2.0 - 1.0;
  float imageNoise = length(vec3(imageNoiseR, imageNoiseG, imageNoiseB)); // 샘플링한 노이즈값의 r, g, b로부터 하나의 vec3 를 만들고, 그것의 길이값으로 노이즈를 계산함.

  float opacity = 0.0; // 기본 투명도는 0.0 으로 시작함. 
  vec3 color = vec3(0.0, 0.0, 0.0); // 기본 색상값은 검정색으로 시작함.

  float finalCutoff = (animNoise * 0.07) + cutoff; // 애니메이션 노이즈값이 적용된 최종 cutoff 기준값 

  // 경계선 투명도 및 색상 계산
  if(imageNoise > finalCutoff) {
    // 정적인 노이즈값을 최종 기준값과 비교 후, 
    // 더 크면 투명도를 1.0으로 올려서 프래그먼트를 보여주고, 작으면 원래의 기본 투명도를 0.0 을 유지하여 숨김.
    opacity = 1.0 - (animNoise * 0.5); // animNoise 를 빼줌으로써, 경계선 투명도에도 노이즈와 시간에 따른 무작위성을 더해준 것. 

    // rim 계산 (rim 값이 0에 가까울수록 시야(카메라)에서 가까우므로 경계선이 밝고 선명하게, 1에 가까울수록 시야(카메라)에서 멀어질수록 경계선을 어둡고 탁하게 렌더링하기 위해 필요한 값.)
    float rim = 1.0 - max(0.0, dot(normal, viewDir)); // max() 함수를 이용해서 음수인 내적값은 제거함.
    rim = pow(rim, 2.0); // rim 영역의 앞부분에 위치한 outline 들은 대체로 밝게 칠해주려고 rim값을 거듭제곱함. -> rim 그래프가 지수함수 그래프처럼 곡선으로 그려짐.

    float saturation = 0.68 - (rim * 0.15); // 경계선 채도 (뒤로 갈수록 채도가 탁해짐. 0 ~ 0.15 사이의 값을 빼주니까)
    float value = 1.0 - (rim * 0.72); // 경계선 명도 (뒤로 갈수록 명도가 어두워짐. 0 ~ 0.72 사이의 값을 빼주니까)
    color = hsvToRgb(vec3(0.05, saturation, value)); // 경계선 색상
  }

  // 경계선 안쪽 투명도 및 색상 계산
  if(imageNoise > finalCutoff * outlineThickness) {
    // 정적인 노이즈값을 (최종 기준값 * 경계선 굵기값)과 비교 후, 
    // 더 크면 애니메이션 노이즈값을 적용한 투명도를 지정하고, 작으면 원래의 기본 투명도를 0을 유지함.
    opacity = animNoise * 0.23; // 애니메이션 노이즈값을 0.23배 줄여서 투명도를 설정함.
    color = hsvToRgb(vec3(0.05, 0.81, 1.0)); // 경계선 안쪽 색상
  }

  gl_FragColor = vec4(color, opacity);
}

/*
  outlineThickness 가 일정해도 
  경계선 굵기가 자연스럽게 자글자글해지는 이유

  동일한 outlineThickness 로 알파테스팅을 한다면,
  경계선 굵기가 일정해야 할 것 같지만,
  
  샘플링한 imageNoise 자체가 일정하지 않기 때문에
  imageNoise 의 불규칙한 패턴을 따라 알파테스팅이 적용되면서
  opacity 가 1.0 으로 적용되는 경계선 영역 또한
  불규칙하게 나올 수밖에 없음.
*/

/*
  경계선 색상 설정 시, 
  후처리를 적용하지 않으면, 경계선이 선명한 오렌지색이지만, 
  
  Bloom 을 적용하면 
  원색과 후처리 색이 더해져서 흰색에 가깝게 보일 것임.
*/