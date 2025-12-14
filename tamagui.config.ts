import {defaultConfig} from "@tamagui/config/v4";
import {createTamagui} from "tamagui";
import {themes} from "@/utils/old-themes";

const tamaguiConfig = createTamagui({...defaultConfig, themes});

type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {
  }
}

export default tamaguiConfig;
