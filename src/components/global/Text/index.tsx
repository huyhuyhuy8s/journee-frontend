import React from "react";
import {useTheme} from "@/theme";
import {StyleSheet, Text as T} from "react-native";
import {ITextProps} from "@/components/global/Text/types";

const Text = (props: ITextProps) => {
  const {colors} = useTheme()
  const {style, ...restProps} = props

  const styles = StyleSheet.create({
    text: {
      color: colors.text,
    }
  })

  return (
    <T style={[
      styles.text,
      style
    ]}
       {...restProps}>
      {props.children}
    </T>
  )
}

export default Text;