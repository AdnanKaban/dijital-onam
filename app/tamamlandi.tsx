import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTamamlandiAsistani } from "../hooks/useTamamlandiAsistani";

export default function Tamamlandi() {
  const {
    lang,
    ad,
    soyad,
    protokolNo,
    dogumTarihi,
    cinsiyet,
    imza,
    bilgilendirmeOkundu,
    hastaKarari,
  } = useLocalSearchParams();

  const router = useRouter();
  const tr = lang !== "en";

  useTamamlandiAsistani({
    aktif: true,
    tr,
  });

  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfHazirlaniyor, setPdfHazirlaniyor] = useState(false);

  const okunduMu = bilgilendirmeOkundu === "true";
  const karar = hastaKarari === "red" ? "red" : "onay";

  const bilgilendirmeDurumu = okunduMu
    ? tr
      ? "Bilgilendirme metni okundu/dinlendi"
      : "Information text was read/listened to"
    : tr
    ? "Bilgilendirme metni okunmadan işlem yapıldı"
    : "Decision was made without reading the information text";

  const kararMetni =
    karar === "onay"
      ? tr
        ? "Hasta işlemi onayladı"
        : "Patient consented"
      : tr
      ? "Hasta işlemi reddetti"
      : "Patient refused";

  const sonucBaslik =
    karar === "onay"
      ? tr
        ? "Dijital Onam Kaydı Oluşturuldu"
        : "Digital Consent Record Created"
      : tr
      ? "Dijital Reddetme Kaydı Oluşturuldu"
      : "Digital Refusal Record Created";

  const htmlOlustur = () => {
    const tarih = new Date().toLocaleDateString("tr-TR");
    const saat = new Date().toLocaleTimeString("tr-TR");

    const kararAciklama =
      karar === "onay"
        ? okunduMu
          ? "Hasta, bilgilendirme metnini okuduğunu/dinlediğini, bilgilendirildiğini ve işlemi onayladığını beyan etmiştir."
          : "Hasta, bilgilendirme metnini okumadan işlemi onayladığını beyan etmiştir."
        : okunduMu
        ? "Hasta, bilgilendirme metnini okuduğunu/dinlediğini, bilgilendirildiğini ancak işlemi reddettiğini beyan etmiştir."
        : "Hasta, bilgilendirme metnini okumadan işlemi reddettiğini beyan etmiştir.";

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #222;
            }
            h1 {
              color: #B71C1C;
              text-align: center;
              margin-bottom: 6px;
            }
            h2 {
              color: #C62828;
              border-bottom: 1px solid #ddd;
              padding-bottom: 6px;
              margin-top: 28px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-bottom: 24px;
            }
            .box {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 14px;
              margin-bottom: 14px;
              background: #fafafa;
            }
            .row {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .label {
              font-weight: bold;
            }
            .decision {
              padding: 14px;
              background: ${karar === "onay" ? "#E8F5E9" : "#FFEBEE"};
              border-left: 5px solid ${karar === "onay" ? "#2E7D32" : "#B71C1C"};
              margin-top: 12px;
              line-height: 1.5;
            }
            .signature {
              margin-top: 18px;
              border: 1px solid #ccc;
              min-height: 160px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .signature img {
              max-width: 100%;
              max-height: 190px;
            }
            .note {
              margin-top: 28px;
              font-size: 12px;
              color: #555;
              line-height: 1.5;
              border-top: 1px solid #ddd;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Anestezi Dijital Onam Sistemi</h1>
          <div class="subtitle">
            K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi<br/>
            Dijital Onam / Reddetme Prototip Belgesi
          </div>

          <h2>Hasta Bilgileri</h2>
          <div class="box">
            <div class="row"><span class="label">Hasta:</span> ${ad ?? ""} ${soyad ?? ""}</div>
            <div class="row"><span class="label">Protokol No:</span> ${protokolNo ?? "-"}</div>
            <div class="row"><span class="label">Doğum Tarihi:</span> ${dogumTarihi ?? "-"}</div>
            <div class="row"><span class="label">Cinsiyet:</span> ${cinsiyet ?? "-"}</div>
            <div class="row"><span class="label">Tarih:</span> ${tarih}</div>
            <div class="row"><span class="label">Saat:</span> ${saat}</div>
          </div>

          <h2>Bilgilendirme ve Karar Özeti</h2>
          <div class="box">
            <div class="row"><span class="label">Bilgilendirme Durumu:</span> ${bilgilendirmeDurumu}</div>
            <div class="row"><span class="label">Hasta Kararı:</span> ${kararMetni}</div>
            <div class="decision">${kararAciklama}</div>
          </div>

          <h2>Dijital İmza</h2>
          <div class="box">
            <div class="row">
              Hasta yukarıdaki beyanı dijital imza ile onaylamıştır.
            </div>

            <div class="signature">
              ${
                imza
                  ? `<img src="${imza}" />`
                  : `<span>İmza verisi bulunamadı.</span>`
              }
            </div>
          </div>

          <div class="note">
            Bu belge yüksek lisans tezi kapsamında geliştirilen dijital onam prototipi tarafından oluşturulmuştur.
            Gerçek kullanım senaryosunda belge, hastane personeline güvenli şekilde iletilerek
            kurumsal panel üzerinden yönetilebilir ve hastane bilgi sistemine entegre edilebilir.
          </div>
        </body>
      </html>
    `;
  };

  const pdfOlustur = async () => {
    try {
      setPdfHazirlaniyor(true);

      const result = await Print.printToFileAsync({
        html: htmlOlustur(),
        base64: false,
      });

      setPdfUri(result.uri);

      Alert.alert(
        tr ? "PDF Oluşturuldu" : "PDF Created",
        tr
          ? "Dijital onam belgesi PDF olarak oluşturuldu."
          : "The digital consent document has been created as a PDF."
      );
    } catch (error: any) {
      Alert.alert(
        tr ? "PDF Hatası" : "PDF Error",
        error?.message ?? "PDF oluşturulamadı."
      );
    } finally {
      setPdfHazirlaniyor(false);
    }
  };

  const pdfPaylas = async () => {
    try {
      let uri = pdfUri;

      if (!uri) {
        const result = await Print.printToFileAsync({
          html: htmlOlustur(),
          base64: false,
        });

        uri = result.uri;
        setPdfUri(uri);
      }

      const uygunMu = await Sharing.isAvailableAsync();

      if (!uygunMu) {
        Alert.alert(
          tr ? "Paylaşım Kullanılamıyor" : "Sharing Unavailable",
          tr
            ? "Bu cihazda paylaşım özelliği kullanılamıyor."
            : "Sharing is not available on this device."
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: tr ? "PDF Belgesini Paylaş" : "Share PDF Document",
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      Alert.alert(
        tr ? "Paylaşım Hatası" : "Sharing Error",
        error?.message ?? "PDF paylaşılamadı."
      );
    }
  };

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.gradyan}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.ikonKutu}>
          <Text style={styles.ikon}>✅</Text>
        </View>

        <Text style={styles.title}>{sonucBaslik}</Text>

        <Text style={styles.subtitle}>
          {tr
            ? "İmza başarıyla kaydedildi. Dijital kayıt oluşturuldu."
            : "The signature has been saved successfully. A digital record has been created."}
        </Text>

        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
          style={styles.bilgiKart}
        >
          <Text style={styles.bilgiBaslik}>
            {tr ? "📋 Kayıt Özeti" : "📋 Record Summary"}
          </Text>

          <View style={styles.ayrac} />

          <Text style={styles.bilgiText}>
            👤 {tr ? "Hasta" : "Patient"}: {ad} {soyad}
          </Text>

          {protokolNo ? (
            <Text style={styles.bilgiText}>🔢 Protokol No: {protokolNo}</Text>
          ) : null}

          {dogumTarihi ? (
            <Text style={styles.bilgiText}>
              📅 {tr ? "Doğum Tarihi" : "Date of Birth"}: {dogumTarihi}
            </Text>
          ) : null}

          <Text style={styles.bilgiText}>
            📄 {tr ? "Bilgilendirme" : "Information"}: {bilgilendirmeDurumu}
          </Text>

          <Text style={styles.bilgiText}>
            🩺 {tr ? "Hasta Kararı" : "Patient Decision"}: {kararMetni}
          </Text>

          <Text style={styles.bilgiText}>
            🗓 {tr ? "Tarih" : "Date"}: {new Date().toLocaleDateString("tr-TR")}
          </Text>

          <Text style={styles.bilgiText}>
            🕐 {tr ? "Saat" : "Time"}: {new Date().toLocaleTimeString("tr-TR")}
          </Text>

          <Text style={styles.bilgiText}>
            ✅ {tr ? "Dijital imza kaydedildi" : "Digital signature saved"}
          </Text>
        </LinearGradient>

        <View style={styles.aciklamaKart}>
          <Text style={styles.aciklamaText}>
            {tr
              ? "Bu prototipte oluşturulan dijital onam belgesi PDF olarak görüntülenebilmektedir.\n\nGerçek kullanım senaryosunda belge, hastane personeline iletilerek kurumsal panel üzerinden yönetilecektir."
              : "In this prototype, the generated digital consent document can be viewed as a PDF.\n\nIn a real usage scenario, the document would be forwarded to hospital staff and managed through an institutional panel."}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={pdfOlustur}>
          <LinearGradient
            colors={["#fff", "rgba(255,255,255,0.85)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pdfButton}
          >
            <Text style={styles.pdfText}>
              {pdfHazirlaniyor
                ? tr
                  ? "PDF Hazırlanıyor..."
                  : "Preparing PDF..."
                : tr
                ? "📄 PDF Oluştur"
                : "📄 Create PDF"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={pdfPaylas}>
          <View style={styles.paylasButton}>
            <Text style={styles.paylasText}>
              {tr ? "📤 PDF Paylaş / Görüntüle" : "📤 Share / View PDF"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace("/")}>
          <View style={styles.yeniButton}>
            <Text style={styles.yeniText}>
              {tr ? "🔄 Yeni Form Başlat" : "🔄 Start New Form"}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradyan: { flex: 1 },

  container: {
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
  },

  ikonKutu: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  ikon: { fontSize: 55 },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  bilgiKart: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 18,
  },

  bilgiBaslik: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },

  ayrac: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },

  bilgiText: {
    fontSize: 14,
    color: "white",
    marginBottom: 8,
    lineHeight: 20,
  },

  aciklamaKart: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  aciklamaText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  pdfButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  pdfText: {
    color: "#c0392b",
    fontSize: 17,
    fontWeight: "bold",
  },

  paylasButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    marginBottom: 12,
  },

  paylasText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  yeniButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    marginBottom: 20,
  },

  yeniText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});