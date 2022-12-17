import BallManager from "../projects/ball/BallManager";
import GalaxyManager from "../projects/galaxy/GalaxyManager";
import WaterManager from "../projects/water/WaterManager";
import ForceFieldManager from "../projects/forceField/ForceFieldManager";
import TerrainManager from "../projects/terrain/TerrainManager";
import TypoWarpManager from "../projects/typoWarp/TypoWarpManager";
import StatueManager from "../projects/statue/StatueManager";
import VortexManager from "../projects/vortex/VortexManager";
import MagicCircleManager from "../projects/magicCircle/MagicCircleManager";
import ShieldManager from "../projects/shield/ShieldManager";

export type ManagerType =
  | BallManager
  | GalaxyManager
  | WaterManager
  | ForceFieldManager
  | TerrainManager
  | TypoWarpManager
  | StatueManager
  | VortexManager
  | MagicCircleManager
  | ShieldManager;
