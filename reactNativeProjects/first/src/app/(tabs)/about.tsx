import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function About() {
  return (
    <View style={styles.container}>
      <Text>This is the about page of the app</Text>
       <Link href={"/"}>Go to home page</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
