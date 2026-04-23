import { StyleSheet, Text, View } from "react-native";
import type { PasswordStrengthIndicatorProps } from "./PasswordStrengthIndicator.types";
import { passwordStrengthEval } from "@repo/validators";

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  let strengthMessage = "Enter a password";
  let strengthColor = "#999999";

  const results = passwordStrengthEval(password);
  if (results.score === 5) {
    strengthMessage = "Very Strong";
    strengthColor = "#28a745"; // Green
  } else if (results.score >= 3) {
    strengthMessage = "Strong";
    strengthColor = "#ffc107"; // Yellow
  } else if (results.score >= 1) {
    strengthMessage = "Weak";
    strengthColor = "#dc3545"; // Red  //"#fd7e14"; // Orange
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={[styles.text, { color: strengthColor }]}>
        {strengthMessage} ({password.length}/9+)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
});

export { PasswordStrengthIndicator };
