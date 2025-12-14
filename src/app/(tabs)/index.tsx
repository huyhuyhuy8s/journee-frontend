import {StyleSheet} from "react-native";
import {useTheme} from "@/theme";
import SafeAreaView from '@/components/global/SafeAreaView'
import Text from "@/components/global/Text";

const Map = () => {
  const {colors} = useTheme()
  const styles = StyleSheet.create({})

  return (
    <SafeAreaView>
      <Text>
        Open up app/index.tsx to start working app!
      </Text>
    </SafeAreaView>
  )
}

export default Map;