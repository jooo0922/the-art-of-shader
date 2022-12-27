import * as THREE from "three";

export default class Drag {
  resolution: THREE.Vector2;

  vTouchStart: THREE.Vector2;

  vPrev: THREE.Vector2;

  vCur: THREE.Vector2;

  vAdd: THREE.Vector2;

  anchor: THREE.Vector2;

  isTouched: boolean;

  constructor(resolution: THREE.Vector2) {
    this.resolution = resolution; // 리사이징되는 window 사이즈
    this.vTouchStart = new THREE.Vector2(); // 터치(클릭) 시작 지점 좌표값
    this.vPrev = new THREE.Vector2(); // 이전 좌표값 (touch(click)이 발생하기 직전의 좌표값)
    this.vCur = new THREE.Vector2(); // 현재 좌표값
    this.vAdd = new THREE.Vector2(); // 업데이트 루프에서 목표 좌표값을 향해 더해주는 Vector2 좌표값. 즉, 좌표의 '변화량'
    this.anchor = new THREE.Vector2(); // 목표 좌표값 (anchor: 닻, 정박지): touchmove 가 발생할 때마다, 닻을 고정시키고 해당 지점을 향해 update 루프에서 vCur 을 계속 움직이는 거 같음.
    this.isTouched = false; // 터치(클릭) 발생 여부 flag
  }

  touchStart(e: TouchEvent | MouseEvent) {
    // pc 를 사용하고 있을 경우, (즉, MouseEvent 인 경우) e.preventDefault() 로 이벤트 기본동작 실행 방지
    if (e instanceof MouseEvent) e.preventDefault();

    this.vPrev.copy(this.vCur); // 이전 좌표값을 현재 좌표값으로 overwirte
    this.vAdd.set(0, 0); // 현재 좌표값에 더해주는 좌표값을 (0, 0)으로 초기화시킴
    this.vTouchStart.set(
      e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    ); // 터치(클릭) 시작 지점 좌표값을 지정
    this.isTouched = true;
  }

  touchMove(e: TouchEvent | MouseEvent) {
    // 이번에는 반대로 모바일을 사용하고 있을 경우, (즉, TouchEvent 일 경우) 이벤트 기본동작 실행 방지
    if (!(e instanceof MouseEvent)) e.preventDefault();

    // touch(mouse)move 이벤트가 발생한 x, y 좌표값을 구함
    const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    if (this.isTouched === false) return; // move 이벤트가 발생했어도, touch(click)이 없었다면 이벤트핸들러를 종료함.

    /**
     * 목표 좌표값 계산
     *
     * 1. (x - this.vTouchStart.x)
     * (현재 move한 지점 - touch(click) 시작 지점) => 즉, 움직인 거리
     *
     * 2. (this.resolution.x / 200)
     * (브라우저 window 해상도 / 200) => 즉, 해상도가 커질수록 움직인 거리에 나눠주는 값이 더 커짐.
     * 이로 인해, 해상도가 커질수록 vPrev 좌표에 더해주는 값이 작아지겠군
     *
     * 3. vPrev
     * touch(click)이 발생하기 직전의 좌표값
     *
     * 결론적으로, touch(click) 이 발생하기 직전의 좌표값에
     * move 로 움직인 만큼의 거리를 더해주되,
     * 브라우저 해상도가 커지면 그 더해주는 거리가 더 짧아지게 하는 식으로
     * 목표 좌표값을 계산함.
     *
     * 참고로, y좌표값의 경우
     * AuraBall 에서 공을 수직방향으로 회전시킬 때 사용하는 값이므로,
     * OrbitControls 처럼 수직방향 회전 각도 범위에 제한을 두려고
     * -90 ~ 90 사이의 좌표값으로만 범위를 한정한 거 같음.
     */
    this.anchor.set(
      (x - this.vTouchStart.x) / (this.resolution.x / 200) + this.vPrev.x,
      THREE.MathUtils.clamp(
        (y - this.vTouchStart.y) / (this.resolution.y / 200) + this.vPrev.y,
        -90,
        90
      )
    );
  }

  touchEnd(e: TouchEvent | MouseEvent) {
    this.isTouched = false; // 터치(클릭) 발생 여부 flag 를 비활성화함.
  }

  resize(resolution: THREE.Vector2) {
    this.resolution = resolution; // 리사이징되는 window 사이즈
  }

  update() {
    // 현재 좌표값에 더해주는 좌표값 계산
    // 현재의 업데이트 루프에서 목표좌표값(anchor)과 현재좌표값(vCur)의 차이에서 10%, 즉, 0.1의 속도만큼 변화량을 구함.
    // 이렇게 하면 vAdd 로 더해줬을 때 감속운동이 되겠지. 곱해주는 0.1 이 커질수록 더 가파르게 감속할거임. 즉, 변화량의 '속도'를 의미함.
    this.vAdd.set(
      (this.anchor.x - this.vCur.x) * 0.1,
      (this.anchor.y - this.vCur.y) * 0.1
    );
    this.vCur.add(this.vAdd); // 현재 좌표값에 변화량을 더해줌.
  }
}
