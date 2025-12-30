import {useTheme} from "@/theme";
import {StyleSheet, View} from "react-native";
import {IBadgeProps} from "@/components/global/Badge/types";
import Text from "@/components/global/Text";

const Badge = (props: IBadgeProps) => {
  const {style, text, variant, size} = props;
  const {colors} = useTheme()
  const styles = StyleSheet.create({
    badge: {
      padding: 4,
      borderRadius: 8,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    }
  })

  return (
    <View style={[styles.badge, style]}>
      <Text>{text}</Text>
    </View>
  )
}

export default Badge;