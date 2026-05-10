import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignatureScreen from "react-native-signature-canvas";

export default function Imza() {
  const { lang, ad, soyad, protokolNo, dogumTarihi, cinsiyet } = useLocalSearchParams();
  const router = useRouter();
  const tr = lang === "tr";
  const ref = useRef<any>(null);

  const temizle = () => {
    ref.current?.clearSignature();
  };

  const onayla = () => {
    ref.current?.readSignature();
  };

  const onOK = (signature: string) => {
    router.push({
      pathname: "/tamamlandi" as any,
      params: { lang, ad, soyad, protokolNo, dogumTarihi, cinsiyet, imza: signature }
    });
  };

  const onEmpty = () => {
    Alert.alert(
      tr ? "Uyarı" : "Warning",
      tr ? "Lütfen imzanızı atınız." : "Please sign the form."
    );
  };

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.gradyan}>
      <View style={styles.container}>
        <Text style={styles.baslik}>✍️</Text>
        <Text style={styles.title}>{tr ? "İmza" : "Signature"}</Text>
        <Text style={styles.subtitle}>
          {tr
            ? "Bilgilendirme metnini okudum ve anladım."
            : "I have read and understood the information text."}
        </Text>

        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
          style={styles.hastaKart}
        >
          <Text style={styles.hastaText}>👤 {ad} {soyad}</Text>
          <Text style={styles.hastaText}>📅 {dogumTarihi}</Text>
        </LinearGradient>

        <View style={styles.imzaKutu}>
          <SignatureScreen
            ref={ref}
            onOK={onOK}
            onEmpty={onEmpty}
            autoClear={false}
            descriptionText={tr ? "İmzanızı buraya atınız" : "Sign here"}
            clearText={tr ? "Temizle" : "Clear"}
            confirmText={tr ? "Onayla" : "Confirm"}
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; }
              .m-signature-pad--body { border: none; }
              .m-signature-pad--footer { display: none; }
              body, html { height: 100%; }
            `}
          />
        </View>

        <View style={styles.butonlar}>
          <TouchableOpacity onPress={temizle} activeOpacity={0.8} style={{ flex: 1 }}>
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
              style={styles.temizleButton}
            >
              <Text style={styles.temizleText}>{tr ? "🗑 Temizle" : "🗑 Clear"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onayla} activeOpacity={0.8} style={{ flex: 1 }}>
            <LinearGradient
              colors={["#fff", "rgba(255,255,255,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.onaylaButton}
            >
              <Text style={styles.onaylaText}>{tr ? "✓ Onayla" : "✓ Confirm"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradyan: { flex: 1 },
  container: { flex: 1, padding: 24, paddingTop: 60 },
  baslik: { fontSize: 50, textAlign: "center", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", marginBottom: 16, marginTop: 6 },
  hastaKart: { borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", marginBottom: 16 },
  hastaText: { fontSize: 14, color: "white", marginBottom: 4 },
  imzaKutu: { flex: 1, borderRadius: 14, overflow: "hidden", backgroundColor: "white", marginBottom: 16 },
  butonlar: { flexDirection: "row", gap: 10, marginBottom: 20 },
  temizleButton: { padding: 15, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  temizleText: { color: "white", fontSize: 16, fontWeight: "bold" },
  onaylaButton: { padding: 15, borderRadius: 14, alignItems: "center" },
  onaylaText: { color: "#c0392b", fontSize: 16, fontWeight: "bold" },
});