import { StyleSheet, Text } from "react-native";

export const PasswordStrength = () => {
  return <Text style={styles.text}>Shared Text</Text>;
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#2BE044",
  },
  text: {
    fontSize: 16,
    color: "#E03F2B",
  },
});
