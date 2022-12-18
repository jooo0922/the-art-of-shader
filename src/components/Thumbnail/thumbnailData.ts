import { ThumbnailDataType } from "../../types/ThumbnailDataType";
import ball from "../../assets/images/ball.png";
import forceField from "../../assets/images/forceField.png";
import magicCircle from "../../assets/images/magicCircle.png";
import vortex from "../../assets/images/vortex.png";
import terrain from "../../assets/images/terrain.png";
import shield from "../../assets/images/shield.png";
import typoWarp from "../../assets/images/typoWarp.png";
import water from "../../assets/images/water.png";
import statue from "../../assets/images/statue.png";
import galaxy from "../../assets/images/galaxy.png";

const THUMBNAIL_DATA: ThumbnailDataType[] = [
  {
    title: "BURNING BALL",
    imageUrl: ball,
    pathName: "/burning-ball",
  },
  {
    title: "FORCE FIELD",
    imageUrl: forceField,
    pathName: "/force-field",
  },
  {
    title: "MAGIC CIRCLE",
    imageUrl: magicCircle,
    pathName: "/magic-circle",
  },
  {
    title: "VORTEX",
    imageUrl: vortex,
    pathName: "/vortex",
  },
  {
    title: "TERRAIN",
    imageUrl: terrain,
    pathName: "/terrain",
  },
  {
    title: "SCI-FI SHIELD",
    imageUrl: shield,
    pathName: "/shield",
  },
  {
    title: "TYPO WARP",
    imageUrl: typoWarp,
    pathName: "/typo-warp",
  },
  {
    title: "WATER BLOB",
    imageUrl: water,
    pathName: "/water-blob",
  },
  {
    title: "GRAIN STATUE",
    imageUrl: statue,
    pathName: "/grain-statue",
  },
  {
    title: "GALAXY",
    imageUrl: galaxy,
    pathName: "/galaxy",
  },
];

export default THUMBNAIL_DATA;
