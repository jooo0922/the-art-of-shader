import React from "react";
import "./App.css";
import Main from "./pages/Main/Main";
import Work from "./pages/Work/Work";
import About from "./pages/About/About";
import { Route, Routes, useLocation } from "react-router-dom";

const App: React.FC = () => {
  const location = useLocation();
  return (
    <div className="App">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Main />}></Route>
        <Route path="/work" element={<Work />}></Route>
        <Route path="/about" element={<About />}></Route>
      </Routes>
    </div>
  );
};

export default App;
