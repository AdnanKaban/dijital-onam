import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Tamamlandi() {
  const { lang, ad, soyad, protokolNo, dogumTarihi } = useLocalSearchParams();
  const router = useRouter();
  const tr = lang === "tr";

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.gradyan}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.ikonKutu}>
          <Text style={styles.ikon}>✅</Text>
        </View>

        <Text style={styles.title}>
          {tr ? "Form Tamamlandı" : "Form Completed"}
        </Text>

        <Text style={styles.subtitle}>
          {tr
            ? "Bilgilendirilmiş onam formunuz başarıyla tamamlandı."
            : "Your informed consent form has been successfully completed."}
        </Text>

        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
          style={styles.bilgiKart}
        >
          <Text style={styles.bilgiBaslik}>
            {tr ? "📋 Form Bilgileri" : "📋 Form Details"}
          </Text>
          <View style={styles.ayrac} />
          <Text style={styles.bilgiText}>👤 {tr ? "Hasta" : "Patient"}: {ad} {soyad}</Text>
          {protokolNo ? <Text style={styles.bilgiText}>🔢 Protokol No: {protokolNo}</Text> : null}
          {dogumTarihi ? <Text style={styles.bilgiText}>📅 {tr ? "Doğum Tarihi" : "Date of Birth"}: {dogumTarihi}</Text> : null}
          <Text style={styles.bilgiText}>🗓 {tr ? "Tarih" : "Date"}: {new Date().toLocaleDateString("tr-TR")}</Text>
          <Text style={styles.bilgiText}>🕐 {tr ? "Saat" : "Time"}: {new Date().toLocaleTimeString("tr-TR")}</Text>
        </LinearGradient>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace("/")}
        >
          <LinearGradient
            colors={["#fff", "rgba(255,255,255,0.85)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.yeniButton}
          >
            <Text style={styles.yeniText}>
              {tr ? "🔄 Yeni Form Başlat" : "🔄 Start New Form"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradyan: { flex: 1 },
  container: { padding: 24, paddingTop: 60, alignItems: "center" },
  ikonKutu: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  ikon: { fontSize: 55 },
  title: { fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", marginBottom: 30 },
  bilgiKart: { width: "100%", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", marginBottom: 24 },
  bilgiBaslik: { fontSize: 16, fontWeight: "bold", color: "white", marginBottom: 12 },
  ayrac: { height: 1, backgroundColor: "rgba(255,255,255,0.3)", marginBottom: 12 },
  bilgiText: { fontSize: 14, color: "white", marginBottom: 8 },
  yeniButton: { width: "100%", padding: 16, borderRadius: 14, alignItems: "center" },
  yeniText: { color: "#c0392b", fontSize: 18, fontWeight: "bold" },
});