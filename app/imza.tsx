import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignatureScreen from "react-native-signature-canvas";

import { useImzaAsistani } from "../hooks/useImzaAsistani";

export default function Imza() {
  const {
    lang,
    ad,
    soyad,
    protokolNo,
    dogumTarihi,
    cinsiyet,
    bilgilendirmeOkundu,
    hastaKarari,
  } = useLocalSearchParams();

  const router = useRouter();
  const tr = lang !== "en";
  const ref = useRef<any>(null);

  const [imzaVar, setImzaVar] = useState(false);

  const okunduMu = bilgilendirmeOkundu === "true";
  const karar = hastaKarari === "red" ? "red" : "onay";

  const beyanMetni = useMemo(() => {
    if (okunduMu && karar === "onay") {
      return tr
        ? "Bilgilendirme metnini okuduğunuzu veya dinlediğinizi, bilgilendirildiğinizi ve işlemi onaylamayı tercih ettiniz."
        : "You read or listened to the information text and chose to consent.";
    }

    if (okunduMu && karar === "red") {
      return tr
        ? "Bilgilendirme metnini okuduğunuzu veya dinlediğinizi, bilgilendirildiğinizi ancak işlemi reddetmeyi tercih ettiniz."
        : "You read or listened to the information text and chose to refuse.";
    }

    if (!okunduMu && karar === "onay") {
      return tr
        ? "Bilgilendirme metnini okumadan onaylamayı tercih ettiniz."
        : "You chose to consent without reading the information text.";
    }

    return tr
      ? "Bilgilendirme metnini okumadan reddetmeyi tercih ettiniz."
      : "You chose to refuse without reading the information text.";
  }, [okunduMu, karar, tr]);

  const yonlendirmeMetni = tr
    ? "Lütfen ortadaki beyaz alana imzanızı atınız. İmzanızı tamamladıktan sonra devam diyebilir veya İmzayı Kaydet ve Devam Et butonuna basabilirsiniz."
    : "Please sign in the white area. Press Save and Continue when finished.";

  const temizle = () => {
    ref.current?.clearSignature();
    setImzaVar(false);
  };

  const imzayiKaydet = () => {
    ref.current?.readSignature();
  };

  const imzaYokUyar = () => {
    Speech.stop();

    if (tr) {
      Speech.speak(
        "Henüz bir imza algılanmadı. Lütfen ortadaki beyaz alana imzanızı atınız.",
        {
          language: "tr-TR",
          rate: 0.9,
        }
      );
    }

    Alert.alert(
      tr ? "İmza Gerekli" : "Signature Required",
      tr
        ? "Lütfen ortadaki beyaz alana imzanızı atınız."
        : "Please sign in the white area."
    );
  };

  const onOK = (signature: string) => {
    setImzaVar(true);

    router.push({
      pathname: "/tamamlandi" as any,
      params: {
        lang,
        ad,
        soyad,
        protokolNo,
        dogumTarihi,
        cinsiyet,
        bilgilendirmeOkundu,
        hastaKarari,
        imza: signature,
      },
    });
  };

  const onEmpty = () => {
    setImzaVar(false);
    imzaYokUyar();
  };

  const imzaAsistani = useImzaAsistani({
    aktif: tr,
    tr,
    imzaVar,
    onKaydet: imzayiKaydet,
    onImzaYok: imzaYokUyar,
  });

  useEffect(() => {
    if (!tr) {
      return;
    }

    const timer = setTimeout(() => {
      Speech.stop();

      Speech.speak(`${beyanMetni} ${yonlendirmeMetni}`, {
        language: "tr-TR",
        rate: 0.88,
        pitch: 1.0,
        onDone: () => {
          setTimeout(() => {
            imzaAsistani.dinlemeyiBaslat();
          }, 400);
        },
        onError: () => {
          setTimeout(() => {
            imzaAsistani.dinlemeyiBaslat();
          }, 400);
        },
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      Speech.stop();
      imzaAsistani.durdur();
    };
  }, [tr]);

  return (
    <LinearGradient colors={["#ff6b6b", "#c0392b"]} style={styles.gradyan}>
      <View style={styles.container}>
        <Text style={styles.baslik}>✍️</Text>

        <Text style={styles.title}>{tr ? "İmza" : "Signature"}</Text>

        <Text style={styles.subtitle}>{beyanMetni}</Text>

        <Text style={styles.instructionText}>
          {tr
            ? "Ortadaki beyaz alana imzanızı atınız. Bitirdiğinizde “devam” diyebilir veya butona basabilirsiniz."
            : "Sign in the white area. Press the button when finished."}
        </Text>

        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
          style={styles.hastaKart}
        >
          <Text style={styles.hastaText}>
            👤 {ad} {soyad}
          </Text>

          <Text style={styles.hastaText}>📅 {dogumTarihi}</Text>

          <Text style={styles.hastaText}>
            📄{" "}
            {okunduMu
              ? tr
                ? "Bilgilendirme: Okundu/Dinlendi"
                : "Information: Read/Listened"
              : tr
              ? "Bilgilendirme: Okunmadan işlem yapıldı"
              : "Information: Decision without reading"}
          </Text>

          <Text style={styles.hastaText}>
            🩺{" "}
            {karar === "onay"
              ? tr
                ? "Karar: Onay"
                : "Decision: Consent"
              : tr
              ? "Karar: Red"
              : "Decision: Refusal"}
          </Text>
        </LinearGradient>

        {tr && (
          <View style={styles.voiceBox}>
            <Text style={styles.voiceText}>
              {imzaAsistani.dinleniyor
                ? "🎤 Dinleniyor..."
                : imzaAsistani.sonAlinanMetin
                ? `Son algılanan: ${imzaAsistani.sonAlinanMetin}`
                : "İmzayı tamamladıktan sonra “devam” diyebilirsiniz."}
            </Text>

            {imzaAsistani.hataMesaji ? (
              <Text style={styles.errorText}>{imzaAsistani.hataMesaji}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.imzaKutu}>
          <SignatureScreen
            ref={ref}
            onOK={onOK}
            onEmpty={onEmpty}
            onBegin={() => setImzaVar(true)}
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
              <Text style={styles.temizleText}>
                {tr ? "🗑 Temizle" : "🗑 Clear"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={imzayiKaydet} activeOpacity={0.8} style={{ flex: 1 }}>
            <LinearGradient
              colors={["#fff", "rgba(255,255,255,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.onaylaButton}
            >
              <Text style={styles.onaylaText}>
                {tr ? "✓ İmzayı Kaydet ve Devam Et" : "✓ Save and Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradyan: { flex: 1 },

  container: {
    flex: 1,
    padding: 24,
    paddingTop: 44,
  },

  baslik: {
    fontSize: 44,
    textAlign: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 6,
    lineHeight: 20,
  },

  instructionText: {
    fontSize: 13,
    color: "white",
    textAlign: "center",
    marginBottom: 14,
    fontWeight: "600",
  },

  hastaKart: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },

  hastaText: {
    fontSize: 13,
    color: "white",
    marginBottom: 4,
  },

  voiceBox: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  voiceText: {
    color: "white",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },

  errorText: {
    color: "#FFE0E0",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  imzaKutu: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
    marginBottom: 16,
  },

  butonlar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  temizleButton: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  temizleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  onaylaButton: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  onaylaText: {
    color: "#c0392b",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
});