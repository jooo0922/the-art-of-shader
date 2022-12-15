import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/**
 * <React.StrictMode>
 *
 * StrictMode 는 개발 도중 발생하는 문제를 감지하기 위한 설정으로,
 * 해당 설정 시 개발모드일 때에만 렌더링이 2번 발생하게 됨.
 *
 * 이로 인해, useEffect() 의 콜백함수도 2번 호출됨에 따라
 * Work 페이지에서 WebGL 렌더링도 2번 중복되어 문제가 발생했음.
 *
 * 따라서, 해당 엘레먼트를 임시 코멘트 처리함.
 */
