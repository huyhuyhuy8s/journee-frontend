import React from "react";
import {useTheme} from "@/theme";
import {Text as T} from "react-native";
import {ITextProps} from "@/components/global/Text/types";

const Text = (props: ITextProps) => {
  const {colors} = useTheme()
  const {style, ...restProps} = props

  const styles = {
    text: {
      color: colors.text,
    }
  }

  return (
    <T style={[
      styles.text,
      style
    ]}>
      {props.children}
    </T>
  )
}

export default Text;