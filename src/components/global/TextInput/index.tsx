import React from "react";
import {useTheme} from "@/theme";
import {StyleSheet, TextInput as T} from "react-native";
import {ITextInputProps} from "@/components/global/TextInput/types";

const TextInput = (props: ITextInputProps) => {
  const {colors} = useTheme()
  const {style, ...restProps} = props

  const styles = StyleSheet.create({
    input: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background700,
    },
  })

  return (
    <T
      {...restProps}
      style={[
        styles.input,
        style
      ]}
      placeholderTextColor={colors.text700}
    />
  )
}

export default TextInput;