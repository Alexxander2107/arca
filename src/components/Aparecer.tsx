import { ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";

interface Props {
  children: ReactNode;
  delay?: number;
  desde?: number; // píxeles que sube al aparecer
  style?: StyleProp<ViewStyle>;
}

// Hace que su contenido aparezca con fundido y un pequeño deslizamiento
export default function Aparecer({ children, delay = 0, desde = 24, style }: Props) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [desde, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
