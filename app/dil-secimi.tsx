import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useDilSecimiAsistani } from "../hooks/useDilSecimiAsistani";

function AnimatedLangButton({
  onPress,
  selected,
  flag,
  label,
}: {
  onPress: () => void;
  selected: boolean;
  flag: string;
  label: string;
}) {
  const animVal = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(animVal, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animVal, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onPress();
  };

  const translateX = animVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ marginBottom: 12 }}
    >
      <LinearGradient
        colors={
          selected
            ? ["#e74c3c", "#922b21"]
            : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, selected && styles.selectedButton]}
      >
        <Animated.Text
          style={[styles.buttonText, { transform: [{ translateX }] }]}
        >
          {flag} {label}
        </Animated.Text>

        {selected && <Text style={styles.checkmark}>✓</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function DilSecimi() {
  const [selectedLang, setSelectedLang] = useState<"tr" | "en" | "">("");

  const router = useRouter();
  const params = useLocalSearchParams();

  const secTurkce = () => {
    setSelectedLang("tr");
    Speech.stop();

    Speech.speak("Türkçe seçildi. Devam etmek için devam diyebilirsiniz.", {
      language: "tr-TR",
      rate: 0.9,
    });
  };

  const secIngilizce = () => {
    setSelectedLang("en");
    Speech.stop();

    Speech.speak("English selected. Say continue to proceed.", {
      language: "en-US",
      rate: 0.9,
    });
  };

  const devamEt = () => {
    if (!selectedLang) {
      Alert.alert(
        "Dil Seçimi",
        "Lütfen önce Türkçe veya İngilizce dil seçiniz."
      );

      Speech.stop();
      Speech.speak(
        "Lütfen önce Türkçe veya İngilizce dil seçiniz.",
        {
          language: "tr-TR",
          rate: 0.9,
        }
      );

      return;
    }

    dilAsistani.durdur();
    Speech.stop();

    router.push({
      pathname: "/hasta-bilgileri",
      params: {
        ...params,
        lang: selectedLang,
      },
    });
  };

  const dilAsistani = useDilSecimiAsistani({
    aktif: true,
    onTurkce: secTurkce,
    onIngilizce: secIngilizce,
    onDevam: devamEt,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dilAsistani.baslat();
    }, 700);

    return () => {
      clearTimeout(timer);
      dilAsistani.durdur();
      Speech.stop();
    };
  }, []);

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.container}>
      <Text style={styles.logo}>🏥</Text>

      <Text style={styles.title}>Dijital Onam Sistemi</Text>

      <Text style={styles.subtitle}>
        Lütfen dil seçiniz{"\n"}Please select language
      </Text>

      <View style={styles.voiceBox}>
        <Text style={styles.voiceText}>
          {dilAsistani.dinleniyor
            ? "🎤 Dinleniyor..."
            : dilAsistani.sonAlinanMetin
            ? `Son algılanan: ${dilAsistani.sonAlinanMetin}`
            : "Türkçe için “Türkçe”, İngilizce için “English” diyebilirsiniz."}
        </Text>

        {dilAsistani.hataMesaji ? (
          <Text style={styles.errorText}>{dilAsistani.hataMesaji}</Text>
        ) : null}
      </View>

      <LinearGradient
        colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
        style={styles.kartKutu}
      >
        <AnimatedLangButton
          selected={selectedLang === "tr"}
          onPress={secTurkce}
          flag="🇹🇷"
          label="Türkçe"
        />

        <AnimatedLangButton
          selected={selectedLang === "en"}
          onPress={secIngilizce}
          flag="🇬🇧"
          label="English"
        />

        {selectedLang !== "" && (
          <TouchableOpacity activeOpacity={0.8} onPress={devamEt}>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  logo: {
    fontSize: 70,
    marginBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 22,
  },

  voiceBox: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  voiceText: {
    color: "white",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 19,
  },

  errorText: {
    color: "#FFE0E0",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    fontWeight: "600",
  },

  kartKutu: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  button: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedButton: {
    borderColor: "rgba(255,255,255,0.6)",
  },

  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },

  checkmark: {
    color: "white",
    fontSize: 18,
    marginLeft: 8,
  },

  continueButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },

  continueText: {
    color: "#c0392b",
    fontSize: 18,
    fontWeight: "bold",
  },
});