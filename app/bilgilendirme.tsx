import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SECTIONS, Section } from '../data/bilgilendirmeMetinleri';

// =============================================================================
// BİLGİLENDİRME EKRANI (İKİ DİLLİ)
// Anestezi Hasta Bilgilendirme ve Rıza Belgesi (HB.RB.01)
//
// AKIŞ:
// 1. Hastaya 10 bölümlük bilgilendirme metni gösterilir (TR/EN)
// 2. Her bölümün altındaki "Okudum" kutusu işaretlenir
// 3. TTS ile sesli dinleme (dil seçimine göre tr-TR veya en-US)
// 4. Tüm bölümler okunduktan sonra Genel Onay Beyanı işaretlenir
// 5. İmza ekranına geçilir (paramlar taşınır)
//
// AKADEMİK NOT:
// İngilizce metin onaysız çeviridir, klinik kullanım için tıbbi onay gerekir.
// Detay için data/bilgilendirmeMetinleri.ts içindeki başlık yorumuna bakınız.
// =============================================================================

export default function BilgilendirmeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tr = params.lang !== 'en';

  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Dil değiştiğinde okunan bölümleri sıfırla (kullanıcı yeni dilde tekrar okumalı)
  // ama params.lang muhtemelen sabit kalacağı için bu effect pratikte çalışmaz
  // sadece güvenlik için ekledim
  useEffect(() => {
    setReadSections(new Set());
    setConfirmed(false);
  }, [params.lang]);

  const toggleRead = (id: string) => {
    setReadSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const speakSection = async (section: Section) => {
    if (speakingSection === section.id) {
      Speech.stop();
      setSpeakingSection(null);
      return;
    }

    Speech.stop();
    const lang = tr ? 'tr' : 'en';
    const title = section.title[lang];
    const paragraphs = section.paragraphs.map((p) => p[lang]).join(' ');
    const fullText = title + '. ' + paragraphs;
    setSpeakingSection(section.id);

    Speech.speak(fullText, {
      language: tr ? 'tr-TR' : 'en-US',
      rate: 0.95,
      onDone: () => setSpeakingSection(null),
      onStopped: () => setSpeakingSection(null),
      onError: () => setSpeakingSection(null),
    });
  };

  const allSectionsRead = readSections.size === SECTIONS.length;

  const handleContinue = () => {
    if (!allSectionsRead) {
      Alert.alert(
        tr ? 'Eksik Onay' : 'Incomplete Confirmation',
        tr
          ? 'Lütfen tüm bölümleri okuduğunuzu işaretleyiniz. Her bölümün sonundaki "Bu bölümü okudum ve anladım" kutusunu işaretlemeniz gerekmektedir.'
          : 'Please mark that you have read all sections. You must check the "I have read and understood this section" box at the end of each section.'
      );
      return;
    }
    if (!confirmed) {
      Alert.alert(
        tr ? 'Genel Onay Gerekli' : 'General Consent Required',
        tr
          ? 'Lütfen "Aydınlatılmış onam formunun içeriğini okudum, anladım ve onay veriyorum" beyanını onaylayınız.'
          : 'Please confirm the statement "I have read, understood, and consent to the content of the informed consent form".'
      );
      return;
    }
    Speech.stop();
    router.push({ pathname: '/imza', params });
  };

  return (
    <LinearGradient colors={['#E57373', '#C62828']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {tr ? 'Anestezi Hasta Bilgilendirme' : 'Anesthesia Patient Information'}
          </Text>
          <Text style={styles.subtitle}>
            {tr
              ? 'K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi'
              : 'K.B.U. Karabük Training and Research Hospital'}
            {'\n'}
            {tr ? 'Doküman Kodu' : 'Document Code'}: HB.RB.01 | Rev. No: 05
          </Text>

          {/* İngilizce uyarısı: çeviri klinik onay almamıştır */}
          {!tr && (
            <View style={styles.translationWarning}>
              <Text style={styles.translationWarningText}>
                ⚠️ This English translation has been prepared for interface design purposes
                and has not received medical or legal approval. For actual clinical use, the
                hospital&apos;s officially approved English version should be used.
              </Text>
            </View>
          )}

          <View style={styles.progressBox}>
            <Text style={styles.progressText}>
              {tr ? 'Okunan bölüm' : 'Sections read'}: {readSections.size} / {SECTIONS.length}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(readSections.size / SECTIONS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.intro}>
            {tr
              ? 'Aşağıda anestezi uygulamaları hakkında detaylı bilgilendirme metni yer almaktadır. Her bölümü dikkatlice okuyunuz. Dilerseniz "🔊 Sesli Dinle" butonu ile metni sesli olarak da dinleyebilirsiniz. Her bölümün altındaki kutucuğu işaretleyerek okuduğunuzu beyan etmeniz gerekmektedir.'
              : 'Detailed information about anesthesia procedures is provided below. Please read each section carefully. You may also use the "🔊 Listen" button to hear the text. You must check the box at the end of each section to confirm you have read it.'}
          </Text>

          {SECTIONS.map((section, idx) => {
            const lang = tr ? 'tr' : 'en';
            return (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionNumber}>{idx + 1}</Text>
                  <Text style={styles.sectionTitle}>{section.title[lang]}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.speakBtn,
                    speakingSection === section.id && styles.speakBtnActive,
                  ]}
                  onPress={() => speakSection(section)}
                >
                  <Text style={styles.speakBtnText}>
                    {speakingSection === section.id
                      ? tr
                        ? '⏸ Durdur'
                        : '⏸ Stop'
                      : tr
                      ? '🔊 Sesli Dinle'
                      : '🔊 Listen'}
                  </Text>
                </TouchableOpacity>

                {section.paragraphs.map((p, i) => (
                  <Text key={i} style={styles.paragraph}>
                    {p[lang]}
                  </Text>
                ))}

                <TouchableOpacity
                  style={[
                    styles.readCheck,
                    readSections.has(section.id) && styles.readCheckActive,
                  ]}
                  onPress={() => toggleRead(section.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      readSections.has(section.id) && styles.checkboxActive,
                    ]}
                  >
                    {readSections.has(section.id) && (
                      <Text style={styles.checkboxTick}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.readCheckText}>
                    {tr
                      ? 'Bu bölümü okudum ve anladım'
                      : 'I have read and understood this section'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.finalConfirmBox}>
            <Text style={styles.finalConfirmTitle}>
              {tr ? 'Genel Onay Beyanı' : 'General Consent Statement'}
            </Text>
            <Text style={styles.finalConfirmText}>
              {tr
                ? 'Aşağıdaki kutuyu işaretleyerek beyan ediyorum:\n\n"Aydınlatılmış onam formunun içeriğini okudum, anladım ve onay veriyorum."'
                : 'By checking the box below, I declare:\n\n"I have read, understood, and consent to the content of the informed consent form."'}
            </Text>
            <TouchableOpacity
              style={[styles.readCheck, confirmed && styles.readCheckActive]}
              onPress={() => setConfirmed(!confirmed)}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
                {confirmed && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.readCheckText}>
                {tr ? 'Onay veriyorum' : 'I consent'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.continueBtn,
              (!allSectionsRead || !confirmed) && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>
              {tr ? 'İmzaya Geç →' : 'Proceed to Signature →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  translationWarning: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#F57F17',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  translationWarningText: {
    fontSize: 11,
    color: '#5D4037',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  progressBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  progressText: {
    color: '#E65100',
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FFE0B2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FB8C00',
    borderRadius: 4,
  },
  intro: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    padding: 14,
    backgroundColor: '#FFF8F8',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionNumber: {
    backgroundColor: '#C62828',
    color: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 13,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
    lineHeight: 20,
  },
  speakBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C62828',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  speakBtnActive: {
    backgroundColor: '#FFE0B2',
    borderColor: '#FB8C00',
  },
  speakBtnText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },
  paragraph: {
    fontSize: 14,
    color: '#222',
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  readCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
  },
  readCheckActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C62828',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxTick: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  readCheckText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  finalConfirmBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FB8C00',
  },
  finalConfirmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  finalConfirmText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 12,
  },
  continueBtn: {
    marginTop: 24,
    backgroundColor: '#C62828',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  continueBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});