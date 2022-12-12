import { useRoutes } from "react-router-dom";
import "./App.css";
import Main from "./pages/Main/Main";
import Work from "./pages/Work/Work";
import About from "./pages/About/About";
import THUMBNAIL_DATA from "./pages/Main/thumbnailData";

const App = () => {
  const workPageRouteObjects = THUMBNAIL_DATA.map((data) => {
    return { path: data.pathName, element: <Work /> };
  });
  const routes = useRoutes([
    { path: "/", element: <Main /> },
    { path: "/about", element: <About /> },
    ...workPageRouteObjects,
  ]);

  return <div className="App">{routes}</div>;
};

export default App;
