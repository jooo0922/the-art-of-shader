precision highp float;

// 사용자 정의 uniform 변수
uniform float noiseScale; // 노이즈 스케일
uniform float lightIntensity; // 조명 강도
uniform float lightContrast; // 조명 대비 강도 (기본 라이팅에 노이즈값을 적용하면, 음영대비가 약해서 효과가 잘 안나타나므로, 라이팅값에 constrast 를 강하게 줘서 grain 효과가 더 잘 보이도록 하려는 것)
uniform float normalizedMoveX; // 0.0 ~ 1.0 사이의 값으로 정규화된 마우스(터치) x좌표값
uniform float devicePixelRatio;  // css 픽셀 하나를 그리기 위한 장치 픽셀의 개수. 해상도가 클수록 비례해서 커짐. -> 각 디바이스 해상도에 따른 uv좌표, moveX 값 정규화를 정확하게 계산하기 위함.
uniform vec2 resolution; // 리사이징될 때마다 업데이트되는 윈도우 해상도 값. -> gl_FragCoord 를 이 값으로 나눠서 2D 스크린 좌표계를 0.0 ~ 1.0 사이의 좌표값으로 맵핑시킬 것임.

// 보간 변수
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간되어 들어옴.

// Simplex noise 함수 가져오기 
// 참고로 snoise2 은 vec2 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // 디퓨즈 라이팅 계산
  vec3 light = normalize(vec3(0.5, 0.6, 0.9)); // 디렉셔널 라이트 벡터
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤
  float diffuse = max(0.0, dot(normal, light)); // 디퓨즈 라이팅 값 계산 -> 음수인 내적값은 제거해야 곱하는 색상이 지나치게 어두워지는 것을 방지

  // 앰비언트 라이팅 계산
  vec3 ambientCol = hsvToRgb(vec3(0.0, 0.0, 0.15));

  // 최종 조명값 계산 (디퓨즈 라이팅 * 앰비언트 색상값)
  vec3 finalLight = diffuse + ambientCol;
  finalLight *= lightIntensity; // 최종 조명값에 사용자가 설정한 조명강도를 곱함.
  finalLight = pow(finalLight, vec3(lightContrast)); // 기본 라이팅값(디퓨즈 + 앰비언트)에 contrast 값만큼 거듭제곱해서 음영 대비를 강조함 (하단 설명 참고)

  // grain effect (노이즈 색상값) 계산 
  vec2 uv = gl_FragCoord.xy / (noiseScale * devicePixelRatio); // gl_FragColor, noiseScale, devicePixelRatio 에 대한 자세한 필기 하단 참고. 
  float noise = snoise2(uv) * 0.5 + 0.5; // snoise2 함수는 -1 ~ 1 사이의 값을 반환하는데, 음수값은 조명값을 전체적으로 어둡게 만드므로, 0 ~ 1 사이의 값으로 맵핑함.
  vec3 noiseColor = vec3(noise); // 노이즈 색상값 계산

  // 물체의 원색상 계산
  vec3 originalColor = hsvToRgb(vec3(0.119, 0.67, 0.3)); // background 색상에서 명도만 낮춤.

  // 최종 색상 계산
  /*
    아래쪽 세 줄은 뭐냐면, 노이즈 알갱이 있는 부분(finalColor)만 
    물체의 원색상으로 칠하기 위해 적용한 거임.
    
    좀 더 자세히 설명하자면, 저 max() 함수를 사용한 의미를 해석하자면
    "기본적으로 originalColor 로 칠해주시되, finalColor(노이즈 알갱이 색깔)보다는 어두우면 안돼요" 라는 뜻임.
    
    즉,
    1. 노이즈 알갱이가 칠해지지 않은 흰색 영역일 경우, 
    originalColor 가 어떤 색이라도 무조건 더 어두울 것이기 때문에,
    그냥 흰색이 찍힐 것임.

    2. 또, 노이즈 알갱이가 칠해지긴 했는데, 
    originalColor 자체가 워낙 어두워서 노이즈 알갱이보다 더 어두운 경우,
    노이즈 알갱이는 기본 조명값을 포함하고 있기 때문에, 이것보다 어두운 originalColor 가 들어가면
    기본 조명값에 따라 칠해지지 않게 되므로, 노이즈 알갱이 색상을 찍도록 함.

    3. 마지막으로, 노이즈 알갱이가 칠해졌는데, originalColor 가 더 밝은 색상이라면
    당연히 originalColor 가 우선적으로 찍힐 것임.

    -> 이런 식으로, 전체적인 노이즈 알갱이들이 originalColor 에 가깝게 찍히도록 한 것임.
    다만, originalColor 가 너무 어두운 경우, 2번에서 설명했듯이 originalColor 와
    노이즈 알갱이 색상 둘 다 골고루 분포되서 찍히는 경우도 존재함. 조명값을 유지해야 하니까!
  */
  vec3 finalColor = finalLight; // grain 노이즈값과 최종 조명값을 곱해서 최종 색상값을 얻어냄. -> grain effect 의 가장 핵심원리: "조명값과 노이즈값을 곱한다!"
  float normalizedX = gl_FragCoord.x / (resolution.x * devicePixelRatio); // gl_FragCoord 를 캔버스 해상도 값으로 나눠서 2D 스크린 좌표계를 0.0 ~ 1.0 사이의 좌표값으로 정규화함. (늘어난 gl_FragCoord.x 범위만큼 장치 픽셀의 개수로 한번 더 나눠 줌)
  if(normalizedX > normalizedMoveX) {
    // 현재 정규화된 마우스(터치) x좌표값과 비교해서, 더 큰 영역은 grain noise 를 적용하고,
    // 더 작은 영역은 적용하지 않음 -> 마우스 움직임에 따라 화면이 분할될것임!
    finalColor *= noiseColor;
  }
  finalColor.r = max(finalColor.r, originalColor.r);
  finalColor.g = max(finalColor.g, originalColor.g);
  finalColor.b = max(finalColor.b, originalColor.b);

  gl_FragColor = vec4(finalColor, 1.0);
}

/*
  gl_FragCoord

  예전에 셰이더 강좌 들었을 때에도 배웠던 내장변수임.
  이 값은 화면상에 존재하는 각 픽셀들의 2D screen coordinate(2D 화면 좌표계)
  를 전달해주는 변수라고 보면 됨.

  이 값을 2d simplex noise 함수에 인자로 넣어서
  노이즈값을 반환받고, 그걸로 grain 효과를 만드는 원리인 것!

  -> 다만, 현재 픽셀의 2d 화면좌표계이기 때문에,
  물체를 변환하거나, 카메라를 이동시킨다고 해서 해당 픽셀의
  화면좌표계가 변하는 것은 아님.

  즉, 물체나 카메라가 아무리 변환된다고 하더라도, 
  동일한 uv좌표가 적용되므로, 해당 픽셀에도 
  동일한 노이즈값이 계산되서 적용된다는 뜻!
*/

/*
  gl_FragColor / noiseScale / devicePixelRatio 

  지금 2D 화면 좌표계를 noiseScale 이라는 값으로 나눠주고 있음.
  이걸 왜 하는걸까? 그리고 나눠주는 값의 변수명은 왜 'noiseScale' 이라고 지은걸까?
  이에 대해 아래와 같이 정리할 수 있음.


  1. 노이즈의 패턴(반복성)을 피하고자 함.
  만약에, 현재 셰이더가 계산되는 디스플레이 화면이 1920*1080 정도의 해상도를 갖고있다면,
  캔버스도 1920*1090 해상도를 갖게 되겠지? 

  그렇다면, gl_FragColor.xy 는
  (0, 0) ~ (1920, 1080) 사이의 2D 좌표값들이
  snoise2() 함수의 인자값으로 들어가게 되는 것임.

  저 정도로 넓은 좌표값 범위를 사용해서 simplex noise 를 계산하다보면
  마치 텍스쳐가 REPEAT_WRAPPING 되듯이 반복되면서
  패턴처럼 보이게 되고, noise 알갱이도 오밀조밀 작아보이게(high frequency) 되는 것임.

  terrain.vs 코드에서
  단계별로 노이즈값의 frequency 를 조절하기 위해
  3.0, 10.0, 20.0 순으로 coord(uv좌표) 값에 곱해줬었지?

  이 케이스에서는 그 uv좌표값에 vec2(1920, 1080) 정도를 곱해서
  노이즈값의 엄청나게 오밀조밀하게 만들어버렸다고 보면 됨. (very very high frequency) 

  -> 근데 노이즈값이 오밀조밀한 것 까지는 좋아. 
  그런데, 그게 막 반복되면서 부자연스러운 패턴처럼 보이는 수준까지 가면 안되는 거잖아?
  그래서 (0, 0) ~ (1920, 1080) 정도의 uv좌표범위를
  1.0 이상의 어떤 실수값으로 나눠줌으로써, 
  노이즈값을 덜 오밀조밀하게 (즉, 노이즈 패턴의 일부분으로 확대되도록)
  만들려고 하는 것임.

  예를 들어, 저 범위에 2.0 을 나눠준다고 하면
  (0, 0) ~ (960, 540) 정도의 uv좌표범위로 노이즈값을 구하게 될테니
  반복이 적고, 덜 오밀조밀하고(low frequency), 노이즈 알갱이도 더 커져서(노이즈 패턴이 일부분으로 확대)
  보이는 거겠지


  2. 노이즈 알갱이를 키우기 때문에 noiseScale 이라고 변수명을 지음.
  1번의 마지막 부분에서도 언급했듯이, 노이즈값의 범위를 줄이기 위해서
  나눠주는 값이 커지면 커질수록, 마치 노이즈 패턴의 일부분으로 확대되는 느낌이 들기 때문에

  노이즈의 알갱이들이 더 확대되어 커져보이는 부수적인 효과가 발생함.
  그래서 나눠주는 값의 변수명을 noiseScale 이라고 한 것임.


  3. devicePixelRatio 만큼 더 나눠주는 이유 
  장치 픽셀의 개수가 많아질수록 gl_FragCoord 값의 범위가 많아지기 때문에, 
  어떤 디바이스에서도 일정한 비율의 frequency 를 얻기 위해 
  늘어난 gl_FragCoord 값의 범위만큼을 장치 픽셀 개수로 나눠준 것임.
*/

/*
  lightContrast

  원래 기본 라이팅값은
  (디퓨즈 라이팅 + 앰비언트 색상) * 조명 강도
  정도로 계산할 수 있음.

  그러나, 이렇게 계산된 라이팅값에
  grain noise 값을 곱해서 적용해보면,
  
  밝은 영역임에도 노이즈 알갱이가 많이 보이다보니
  grain 효과가 밝기에 따른 강약조절 없이
  죄다 grain 알갱이들이 빼곡하게 박혀있는 느낌이 듬.

  grain 효과가 더 이쁘게 보이려면,
  밝은 곳은 노이즈 알갱이가 적게 표시되고,
  어두운 곳일수록 노이즈 알갱이가 많이 표시되어야 함.

  이렇게 하려면, 노이즈값에 곱해주는
  조명값의 대비를 극명하게 해줌으로써 (밝은 곳은 더 밝게, 어두운 곳은 더 어둡게)
  조명값에 따른 노이즈 알갱이 차이를 확 늘려주는 수밖에 없음.

  그래서, 일반적으로 저렇게 기본 라이팅에
  거듭제곱을 해줘서 음영대비를 주는 경우는 거의 없지만,

  grain noise 효과의 음영대비를 확실하게 주기 위해
  조명값을 pow() 함수로 lightContrast 만큼 거듭제곱하여 
  지수함수 그래프로 만들려는 것임.
*/