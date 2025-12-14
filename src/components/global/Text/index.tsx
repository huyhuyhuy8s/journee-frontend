import React from "react";
import {useTheme} from "@/theme";
import {Text as T} from "react-native";
import {ITextProps} from "@/components/global/Text/types";

const Text = (props: ITextProps) => {
  const {colors} = useTheme()

  return (
    <T style={{
      color: colors.text,
      ...props.style
    }}>
      {props.children}
    </T>
  )
}

export default Text;