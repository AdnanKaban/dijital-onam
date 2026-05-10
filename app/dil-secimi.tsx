import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

function AnimatedLangButton({ onPress, selected, flag, label }: {
  onPress: () => void,
  selected: boolean,
  flag: string,
  label: string
}) {
  const animVal = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(animVal, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(animVal, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
    onPress();
  };

  const translateX = animVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={{ marginBottom: 12 }}>
      <LinearGradient
        colors={selected ? ["#e74c3c", "#922b21"] : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, selected && styles.selectedButton]}
      >
        <Animated.Text style={[styles.buttonText, { transform: [{ translateX }] }]}>
          {flag}  {label}
        </Animated.Text>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function Index() {
  const [selectedLang, setSelectedLang] = useState("");
  const router = useRouter();

  // E-Devlet'ten gelen hasta bilgilerini al ve bir sonraki ekrana aktar
  const params = useLocalSearchParams();

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.container}>
      <Text style={styles.logo}>🏥</Text>
      <Text style={styles.title}>Dijital Onam Sistemi</Text>
      <Text style={styles.subtitle}>Lütfen dil seçiniz{"\n"}Please select language</Text>

      <LinearGradient
        colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
        style={styles.kartKutu}
      >
        <AnimatedLangButton
          selected={selectedLang === "tr"}
          onPress={() => setSelectedLang("tr")}
          flag="🇹🇷"
          label="Türkçe"
        />

        <AnimatedLangButton
          selected={selectedLang === "en"}
          onPress={() => setSelectedLang("en")}
          flag="🇬🇧"
          label="English"
        />

        {selectedLang !== "" && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: "/hasta-bilgileri",
              params: {
                ...params,           // E-Devlet'ten gelen tüm hasta verileri
                lang: selectedLang,  // Seçilen dil
              }
            })}
          >
            <LinearGradient
              colors={["#fff", "rgba(255,255,255,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>
                {selectedLang === "tr" ? "Devam Et →" : "Continue →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { fontSize: 70, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: "white", textAlign: "center" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 8, textAlign: "center", marginBottom: 35 },
  kartKutu: { width: "100%", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  button: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  selectedButton: { borderColor: "rgba(255,255,255,0.6)" },
  buttonText: { fontSize: 18, color: "white", fontWeight: "600" },
  checkmark: { color: "white", fontSize: 18, marginLeft: 8 },
  continueButton: { padding: 16, borderRadius: 14, alignItems: "center", marginTop: 4 },
  continueText: { color: "#c0392b", fontSize: 18, fontWeight: "bold" },
});