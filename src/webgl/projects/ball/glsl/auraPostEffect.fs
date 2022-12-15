precision highp float;

// 사용자 정의 uniform 변수
uniform vec2 resolution; // 렌더타겟 텍스쳐 해상도 (512 * 512)
uniform vec2 direction;  // 가우시안 블러 효과 적용 방향 (수직 / 수평)
uniform float radius; // 가우시안 블러 적용 반경 -> 값이 클수록 더 뿌옇게 blur 처리됨.
uniform sampler2D texture; // 렌더타겟 텍스쳐

varying vec2 vUv;

// 가우시안 블러 함수
vec4 gaussianBlur(sampler2D texture, vec2 uv, float radius, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);

  // direction 이 (1, 0) 또는 (0, 1) 로 들어오기 때문에, 샘플링할 uv 값에 더해지더라도, u, v 컴포넌트 둘 중 하나는 변화가 없음 
  // -> 즉, 가우시안 블러를 적용하기 위해, 주변반경 픽셀을 샘플링하고자 하는 방향에 1을 넣어줘야 한다는 뜻.
  // ex> 예를들어, 원래 샘플링하고자 하는 픽셀에서 u축 방향의 주변반경 픽셀들을 샘플링해서 반영하고자 한다면, direction 이 (1, 0)으로 들어와야 함.
  // 또한, radius 가 클수록 원래 샘플링되었어야 할 픽셀로부터 더 넓은 주변반경까지 샘플링되고(즉, blur 가 더 뭉개지고), 
  // resolution 이 클수록 원래 샘플링되었어야 할 픽셀로부터 더 좁은 주변반경까지 샘플링됨(즉, blur 가 덜 뭉개짐)
  vec2 step = radius / resolution * direction;

  // 아래를 보면, step 에 0을 곱하는 blur 의 중심점을 기점으로, 30과 -30으로 갈수록(blur 의 중심점에서 멀어질수록)
  // 샘플링된 텍셀값에 점점 더 작은 크기의 동일한 절댓값을 음수/양수 각각 대칭 방향으로 곱해주고 있음. 
  // -> 중심점에서 멀어진 곳에서 샘플링할수록 최종 색상값에 더 적은 비율로 반영(누적계산)되도록 함.
  color += texture2D(texture, uv + -30.0 * step) * 0.000044463576696752694;
  color += texture2D(texture, uv + -29.0 * step) * 0.00007045416494915056;
  color += texture2D(texture, uv + -28.0 * step) * 0.0001099096126906708;
  color += texture2D(texture, uv + -27.0 * step) * 0.00016880723998699519;
  color += texture2D(texture, uv + -26.0 * step) * 0.00025525396029412817;
  color += texture2D(texture, uv + -25.0 * step) * 0.0003799964739478872;
  color += texture2D(texture, uv + -24.0 * step) * 0.0005569445069582366;
  color += texture2D(texture, uv + -23.0 * step) * 0.0008036541345232365;
  color += texture2D(texture, uv + -22.0 * step) * 0.0011416972770451463;
  color += texture2D(texture, uv + -21.0 * step) * 0.001596823459247415;
  color += texture2D(texture, uv + -20.0 * step) * 0.002198804676697693;
  color += texture2D(texture, uv + -19.0 * step) * 0.0029808483791945177;
  color += texture2D(texture, uv + -18.0 * step) * 0.003978472126807061;
  color += texture2D(texture, uv + -17.0 * step) * 0.005227760816555183;
  color += texture2D(texture, uv + -16.0 * step) * 0.006762976274064666;
  color += texture2D(texture, uv + -15.0 * step) * 0.008613559380852844;
  color += texture2D(texture, uv + -14.0 * step) * 0.010800652851120281;
  color += texture2D(texture, uv + -13.0 * step) * 0.013333369986564198;
  color += texture2D(texture, uv + -12.0 * step) * 0.016205128746770582;
  color += texture2D(texture, uv + -11.0 * step) * 0.01939044575559005;
  color += texture2D(texture, uv + -10.0 * step) * 0.022842624955526088;
  color += texture2D(texture, uv + -9.0 * step) * 0.02649276597348318;
  color += texture2D(texture, uv + -8.0 * step) * 0.030250448423666733;
  color += texture2D(texture, uv + -7.0 * step) * 0.03400631888443281;
  color += texture2D(texture, uv + -6.0 * step) * 0.037636625557126956;
  color += texture2D(texture, uv + -5.0 * step) * 0.0410095302098648;
  color += texture2D(texture, uv + -4.0 * step) * 0.04399280495100364;
  color += texture2D(texture, uv + -3.0 * step) * 0.04646232452009806;
  color += texture2D(texture, uv + -2.0 * step) * 0.048310624731385546;
  color += texture2D(texture, uv + -1.0 * step) * 0.04945474015528432;
  color += texture2D(texture, uv + 0.0 * step) * 0.049842336475142184; // 여기가 원래 샘플링되었어야 할 픽셀 자리이고, 그 텍셀값은 0.0498 정도의 비율로 반영되고 있군.
  color += texture2D(texture, uv + 1.0 * step) * 0.04945474015528432;
  color += texture2D(texture, uv + 2.0 * step) * 0.048310624731385546;
  color += texture2D(texture, uv + 3.0 * step) * 0.04646232452009806;
  color += texture2D(texture, uv + 4.0 * step) * 0.04399280495100364;
  color += texture2D(texture, uv + 5.0 * step) * 0.0410095302098648;
  color += texture2D(texture, uv + 6.0 * step) * 0.037636625557126956;
  color += texture2D(texture, uv + 7.0 * step) * 0.03400631888443281;
  color += texture2D(texture, uv + 8.0 * step) * 0.030250448423666733;
  color += texture2D(texture, uv + 9.0 * step) * 0.02649276597348318;
  color += texture2D(texture, uv + 10.0 * step) * 0.022842624955526088;
  color += texture2D(texture, uv + 11.0 * step) * 0.01939044575559005;
  color += texture2D(texture, uv + 12.0 * step) * 0.016205128746770582;
  color += texture2D(texture, uv + 13.0 * step) * 0.013333369986564198;
  color += texture2D(texture, uv + 14.0 * step) * 0.010800652851120281;
  color += texture2D(texture, uv + 15.0 * step) * 0.008613559380852844;
  color += texture2D(texture, uv + 16.0 * step) * 0.006762976274064666;
  color += texture2D(texture, uv + 17.0 * step) * 0.005227760816555183;
  color += texture2D(texture, uv + 18.0 * step) * 0.003978472126807061;
  color += texture2D(texture, uv + 19.0 * step) * 0.0029808483791945177;
  color += texture2D(texture, uv + 20.0 * step) * 0.002198804676697693;
  color += texture2D(texture, uv + 21.0 * step) * 0.001596823459247415;
  color += texture2D(texture, uv + 22.0 * step) * 0.0011416972770451463;
  color += texture2D(texture, uv + 23.0 * step) * 0.0008036541345232365;
  color += texture2D(texture, uv + 24.0 * step) * 0.0005569445069582366;
  color += texture2D(texture, uv + 25.0 * step) * 0.0003799964739478872;
  color += texture2D(texture, uv + 26.0 * step) * 0.00025525396029412817;
  color += texture2D(texture, uv + 27.0 * step) * 0.00016880723998699519;
  color += texture2D(texture, uv + 28.0 * step) * 0.0001099096126906708;
  color += texture2D(texture, uv + 29.0 * step) * 0.00007045416494915056;
  color += texture2D(texture, uv + 30.0 * step) * 0.000044463576696752694;

  // 최종색상값에는 원래 샘플링되었어야 할 픽셀의 텍셀값을 중심으로, 
  // 그 주변부 픽셀들을 거리에 따라 더 적은 비율로 반영해서 최종 색상값에 누적계산함.
  // 아마도 옆에 곱해주는 값들을 모두 더하면 1이 나오게 될것임. 
  return color;
}

void main() {
  vec4 color = gaussianBlur(texture, vUv, radius, resolution, direction);
  gl_FragColor = color;
}