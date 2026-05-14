import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SECTIONS, Section } from '../data/bilgilendirmeMetinleri';
import { useBilgilendirmeAsistani } from '../hooks/useBilgilendirmeAsistani';

export default function BilgilendirmeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tr = params.lang !== 'en';

  const scrollRef = useRef<ScrollView>(null);
  const sectionYMap = useRef<Record<string, number>>({});
  const finalBoxY = useRef<number>(0);

  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);
  const [sesliAkisAktif, setSesliAkisAktif] = useState(false);
  const [aktifSesliIndex, setAktifSesliIndex] = useState<number | null>(null);
  const [onayBeklenenBolum, setOnayBeklenenBolum] = useState<number | null>(null);
  const [finalKararBekleniyor, setFinalKararBekleniyor] = useState(false);

  const allSectionsRead = readSections.size === SECTIONS.length;

  const scrollToY = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(y - 20, 0),
        animated: true,
      });
    }, 250);
  };

  const scrollToSection = (sectionId: string) => {
    const y = sectionYMap.current[sectionId];
    if (typeof y === 'number') {
      scrollToY(y);
    }
  };

  const scrollToFinalBox = () => {
    scrollToY(finalBoxY.current);
  };

  const toggleRead = (id: string) => {
    setReadSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markSectionRead = (id: string) => {
    setReadSections((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const ttsMetniTemizle = (metin: string) => {
    return metin
      .replace(/EPİDURAL/g, 'Epidural')
      .replace(/EPIDURAL/g, 'Epidural')
      .replace(/SPİNAL/g, 'Spinal')
      .replace(/SPINAL/g, 'Spinal')
      .replace(/PLEKSUS/g, 'Pleksus')
      .replace(/PLEXUS/g, 'Plexus')
      .replace(/PERİFERİK/g, 'Periferik')
      .replace(/PERIFERIK/g, 'Periferik')
      .replace(/SANTRAL/g, 'Santral')
      .replace(/CENTRAL/g, 'Central')
      .replace(/ARTER/g, 'Arter')
      .replace(/KANÜLÜ/g, 'Kanülü')
      .replace(/KANULU/g, 'Kanülü')
      .replace(/UYGULAMASI/g, 'Uygulaması')
      .replace(/ALTERNATİF/g, 'Alternatif')
      .replace(/ALTERNATIVE/g, 'Alternative')
      .replace(/RİSKLERİ/g, 'Riskleri')
      .replace(/RISKS/g, 'Risks')
      .replace(/GEREKTİĞİNDE/g, 'Gerektiğinde')
      .replace(/GEREKTIGINDE/g, 'Gerektiğinde')
      .replace(/TIBBİ/g, 'Tıbbi')
      .replace(/TIBBI/g, 'Tıbbi')
      .replace(/ANESTEZİYE/g, 'Anesteziye')
      .replace(/ANESTEZIYE/g, 'Anesteziye')
      .replace(/ANESTEZİDEN/g, 'Anesteziden')
      .replace(/ANESTEZIDEN/g, 'Anesteziden')
      .replace(/ANESTEZİNİN/g, 'Anestezinin')
      .replace(/ANESTEZININ/g, 'Anestezinin')
      .replace(/ANESTEZİ/g, 'Anestezi')
      .replace(/ANESTEZI/g, 'Anestezi')
      .replace(/\bEKG\b/g, 'E K G')
      .replace(/\bECG\b/g, 'E C G')
      .replace(/\bIV\b/g, 'damar içi')
      .replace(/\bMR\b/g, 'Emar')
      .replace(/\bBT\b/g, 'Bilgisayarlı tomografi')
      .replace(/\bASA\b/g, 'A S A')
      .replace(/K\.B\.Ü\./g, 'Karabük Üniversitesi')
      .replace(/K\.B\.U\./g, 'Karabük Üniversitesi')
      .replace(/HB\.RB\.01/g, 'H B R B sıfır bir')
      .replace(/Rev\. No/g, 'Revizyon numarası')
      .replace(/1\/10\.000/g, 'on binde bir')
      .replace(/1\/250000/g, 'iki yüz elli binde bir')
      .replace(/1-4/g, 'bir ile dört')
      .replace(/2-6/g, 'iki ile altı')
      .replace(/\bI-/g, 'Birinci madde:')
      .replace(/\bII-/g, 'İkinci madde:')
      .replace(/\bIII-/g, 'Üçüncü madde:')
      .replace(/\bIV-/g, 'Dördüncü madde:')
      .replace(/\bV-/g, 'Beşinci madde:')
      .replace(/\bVI-/g, 'Altıncı madde:')
      .replace(/\bVII-/g, 'Yedinci madde:')
      .replace(/\bVIII-/g, 'Sekizinci madde:')
      .replace(/["“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getSectionFullText = (section: Section) => {
    const lang = tr ? 'tr' : 'en';
    const title = section.title[lang];
    const paragraphs = section.paragraphs.map((p) => p[lang]).join(' ');
    return ttsMetniTemizle(`${title}. ${paragraphs}`);
  };

  const speakSectionManual = async (section: Section) => {
    if (!tr) return;

    if (speakingSection === section.id) {
      Speech.stop();
      setSpeakingSection(null);
      return;
    }

    bilgilendirmeAsistani.durdur();
    Speech.stop();
    setSpeakingSection(section.id);

    Speech.speak(getSectionFullText(section), {
      language: 'tr-TR',
      rate: 0.84,
      pitch: 1.0,
      onDone: () => setSpeakingSection(null),
      onStopped: () => setSpeakingSection(null),
      onError: () => setSpeakingSection(null),
    });
  };

  const tamamlaSesliBilgilendirme = () => {
    setAktifSesliIndex(null);
    setOnayBeklenenBolum(null);
    setSpeakingSection(null);
    setFinalKararBekleniyor(true);

    setTimeout(() => {
      scrollToFinalBox();
    }, 400);
  };

  const sesliBolumuOku = (index: number) => {
    if (!tr) return;

    if (index < 0 || index >= SECTIONS.length) {
      tamamlaSesliBilgilendirme();
      return;
    }

    const section = SECTIONS[index];

    setSesliAkisAktif(true);
    setFinalKararBekleniyor(false);
    setOnayBeklenenBolum(null);
    setAktifSesliIndex(index);
    setSpeakingSection(section.id);

    bilgilendirmeAsistani.durdur();
    Speech.stop();
    scrollToSection(section.id);

    setTimeout(() => {
      Speech.speak(getSectionFullText(section), {
        language: 'tr-TR',
        rate: 0.84,
        pitch: 1.0,
        onDone: () => {
          setSpeakingSection(null);
          setOnayBeklenenBolum(index);
        },
        onStopped: () => {
          setSpeakingSection(null);
        },
        onError: () => {
          setSpeakingSection(null);
          setOnayBeklenenBolum(index);
        },
      });
    }, 600);
  };

  const bolumuOnaylaVeSonrakineGec = () => {
    if (onayBeklenenBolum === null) return;

    const section = SECTIONS[onayBeklenenBolum];
    markSectionRead(section.id);

    const nextIndex = onayBeklenenBolum + 1;
    setOnayBeklenenBolum(null);

    if (nextIndex < SECTIONS.length) {
      setTimeout(() => {
        sesliBolumuOku(nextIndex);
      }, 700);
    } else {
      setTimeout(() => {
        tamamlaSesliBilgilendirme();
      }, 700);
    }
  };

  const bolumuTekrarDinle = () => {
    if (onayBeklenenBolum === null) return;

    const tekrarIndex = onayBeklenenBolum;
    setOnayBeklenenBolum(null);

    setTimeout(() => {
      sesliBolumuOku(tekrarIndex);
    }, 300);
  };

  const sesliAkisiBaslat = () => {
    if (!tr) return;

    Speech.stop();
    bilgilendirmeAsistani.durdur();

    const ilkOkunmayanIndex = SECTIONS.findIndex(
      (section) => !readSections.has(section.id)
    );

    if (ilkOkunmayanIndex === -1) {
      tamamlaSesliBilgilendirme();
      return;
    }

    setSesliAkisAktif(true);
    setFinalKararBekleniyor(false);
    setOnayBeklenenBolum(null);

    sesliBolumuOku(ilkOkunmayanIndex);
  };

  const sesliAkisiDurdur = () => {
    Speech.stop();
    bilgilendirmeAsistani.durdur();

    setSesliAkisAktif(false);
    setAktifSesliIndex(null);
    setOnayBeklenenBolum(null);
    setFinalKararBekleniyor(false);
    setSpeakingSection(null);
  };

  const handleKarar = (karar: 'onay' | 'red') => {
    if (!allSectionsRead) {
      Alert.alert(
        tr ? 'Eksik Bilgilendirme' : 'Incomplete Information',
        tr
          ? 'Lütfen tüm bölümleri okuduğunuzu veya dinlediğinizi işaretleyiniz.'
          : 'Please mark all sections as read.'
      );
      return;
    }

    Speech.stop();
    bilgilendirmeAsistani.durdur();

    router.push({
      pathname: '/imza',
      params: {
        ...params,
        bilgilendirmeOkundu: 'true',
        hastaKarari: karar,
      },
    });
  };

  const bilgilendirmeAsistani = useBilgilendirmeAsistani({
    aktif: tr && sesliAkisAktif,
    tr,

    onayBekleniyor: onayBeklenenBolum !== null,
    kararBekleniyor: finalKararBekleniyor,

    onBolumOnayla: bolumuOnaylaVeSonrakineGec,
    onBolumTekrar: bolumuTekrarDinle,

    onKararOnay: () => handleKarar('onay'),
    onKararRed: () => handleKarar('red'),
  });

  useEffect(() => {
    return () => {
      Speech.stop();
      bilgilendirmeAsistani.durdur();
    };
  }, []);

  useEffect(() => {
    setReadSections(new Set());
    setSpeakingSection(null);
    setSesliAkisAktif(false);
    setAktifSesliIndex(null);
    setOnayBeklenenBolum(null);
    setFinalKararBekleniyor(false);
  }, [params.lang]);

  useEffect(() => {
    if (!tr) return;

    const timer = setTimeout(() => {
      sesliAkisiBaslat();
    }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, [tr]);

  useEffect(() => {
    if (!tr) return;
    if (!sesliAkisAktif) return;
    if (onayBeklenenBolum === null && !finalKararBekleniyor) return;

    const timer = setTimeout(() => {
      bilgilendirmeAsistani.baslat();
    }, 500);

    return () => clearTimeout(timer);
  }, [tr, onayBeklenenBolum, finalKararBekleniyor, sesliAkisAktif]);

  return (
    <LinearGradient colors={['#E57373', '#C62828']} style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
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

          {!tr && (
            <View style={styles.translationWarning}>
              <Text style={styles.translationWarningText}>
                ⚠️ This English translation has been prepared for interface design purposes
                and has not received medical or legal approval. For actual clinical use, the
                hospital&apos;s officially approved English version should be used.
              </Text>
            </View>
          )}

          {tr && (
            <View style={styles.voiceFlowBox}>
              <Text style={styles.voiceFlowTitle}>
                🎤 Sesli Bilgilendirme Asistanı
              </Text>

              <Text style={styles.voiceFlowText}>
                Sistem tüm bölümleri sırayla sesli okuyacaktır. Her bölümden sonra
                “okudum” diyerek ilerleyebilir veya “tekrar” diyerek aynı bölümü
                yeniden dinleyebilirsiniz.
              </Text>

              <TouchableOpacity
                style={sesliAkisAktif ? styles.voiceStopBtn : styles.voiceStartBtn}
                onPress={sesliAkisAktif ? sesliAkisiDurdur : sesliAkisiBaslat}
              >
                <Text style={styles.voiceBtnText}>
                  {sesliAkisAktif
                    ? '⏹ Sesli Akışı Durdur'
                    : '▶ Sesli Bilgilendirmeyi Başlat'}
                </Text>
              </TouchableOpacity>

              {sesliAkisAktif && (
                <Text style={styles.voiceStatusText}>
                  {speakingSection
                    ? '🔊 Bölüm okunuyor...'
                    : bilgilendirmeAsistani.dinleniyor
                    ? '🎤 Dinleniyor...'
                    : onayBeklenenBolum !== null
                    ? 'Cevabınız bekleniyor: “okudum” veya “tekrar”'
                    : finalKararBekleniyor
                    ? 'Kararınız bekleniyor.'
                    : ''}
                </Text>
              )}

              {bilgilendirmeAsistani.sonAlinanMetin ? (
                <Text style={styles.detectedText}>
                  Algılanan ifade: {bilgilendirmeAsistani.sonAlinanMetin}
                </Text>
              ) : null}

              {bilgilendirmeAsistani.hataMesaji ? (
                <Text style={styles.errorText}>{bilgilendirmeAsistani.hataMesaji}</Text>
              ) : null}
            </View>
          )}

          <View style={styles.progressBox}>
            <Text style={styles.progressText}>
              {tr ? 'Tamamlanan bölüm' : 'Completed sections'}: {readSections.size} / {SECTIONS.length}
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
              ? 'Aşağıda anestezi uygulamaları hakkında detaylı bilgilendirme metni yer almaktadır. Her bölümü dikkatlice okuyunuz. Sesli asistan metni otomatik olarak okuyacaktır. Her bölümün altındaki kutucuğu işaretleyerek veya sesli olarak “okudum” diyerek okuduğunuzu veya dinlediğinizi beyan etmeniz gerekmektedir.'
              : 'Detailed information about anesthesia procedures is provided below. Please read each section carefully. You must check each section to declare that you have read and understood it.'}
          </Text>

          {SECTIONS.map((section, idx) => {
            const lang = tr ? 'tr' : 'en';
            const aktif = aktifSesliIndex === idx;
            const okunmus = readSections.has(section.id);

            return (
              <View
                key={section.id}
                style={[
                  styles.section,
                  aktif && styles.sectionActive,
                  okunmus && styles.sectionCompleted,
                ]}
                onLayout={(event) => {
                  sectionYMap.current[section.id] = event.nativeEvent.layout.y;
                }}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionNumber, okunmus && styles.sectionNumberDone]}>
                    {okunmus ? '✓' : idx + 1}
                  </Text>

                  <Text style={styles.sectionTitle}>{section.title[lang]}</Text>
                </View>

                {tr && (
                  <TouchableOpacity
                    style={[
                      styles.speakBtn,
                      speakingSection === section.id && styles.speakBtnActive,
                    ]}
                    onPress={() => speakSectionManual(section)}
                  >
                    <Text style={styles.speakBtnText}>
                      {speakingSection === section.id ? '⏸ Durdur' : '🔊 Sesli Dinle'}
                    </Text>
                  </TouchableOpacity>
                )}

                {section.paragraphs.map((p, i) => (
                  <Text key={i} style={styles.paragraph}>
                    {p[lang]}
                  </Text>
                ))}

                <TouchableOpacity
                  style={[styles.readCheck, okunmus && styles.readCheckActive]}
                  onPress={() => toggleRead(section.id)}
                >
                  <View style={[styles.checkbox, okunmus && styles.checkboxActive]}>
                    {okunmus && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>

                  <Text style={styles.readCheckText}>
                    {tr
                      ? 'Bu bölümü okudum/dinledim ve anladım'
                      : 'I have read and understood this section'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View
            style={[
              styles.finalConfirmBox,
              allSectionsRead && styles.finalConfirmBoxActive,
            ]}
            onLayout={(event) => {
              finalBoxY.current = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.finalConfirmTitle}>
              {tr ? 'Genel Beyan' : 'General Statement'}
            </Text>

            <Text style={styles.finalConfirmText}>
              {tr
                ? 'Tüm bilgilendirme bölümlerini okuduğumu/dinlediğimi ve anladığımı beyan ederim.\n\nKararım:'
                : 'I declare that I have read and understood all information sections.\n\nMy decision:'}
            </Text>

            {!allSectionsRead && (
              <Text style={styles.finalWarningText}>
                {tr
                  ? 'Karar verebilmek için önce tüm bölümleri tamamlamanız gerekmektedir.'
                  : 'You must complete all sections before making a decision.'}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.confirmDecisionBtn,
                !allSectionsRead && styles.decisionBtnDisabled,
              ]}
              disabled={!allSectionsRead}
              onPress={() => handleKarar('onay')}
            >
              <Text style={styles.decisionBtnText}>
                ✅ {tr
                  ? 'Bilgilendirildim ve Onaylıyorum'
                  : 'I Am Informed and I Consent'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.refuseDecisionBtn,
                !allSectionsRead && styles.decisionBtnDisabled,
              ]}
              disabled={!allSectionsRead}
              onPress={() => handleKarar('red')}
            >
              <Text style={styles.decisionBtnText}>
                ❌ {tr
                  ? 'Bilgilendirildim ve Reddediyorum'
                  : 'I Am Informed and I Refuse'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
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
  voiceFlowBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  voiceFlowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 8,
  },
  voiceFlowText: {
    fontSize: 13,
    color: '#263238',
    lineHeight: 20,
    marginBottom: 12,
  },
  voiceStartBtn: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  voiceStopBtn: {
    backgroundColor: '#B71C1C',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  voiceBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  voiceStatusText: {
    marginTop: 10,
    color: '#0D47A1',
    fontSize: 13,
    fontWeight: '600',
  },
  detectedText: {
    marginTop: 6,
    color: '#1565C0',
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: 6,
    color: '#B71C1C',
    fontSize: 12,
    fontWeight: '600',
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
  sectionActive: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: '#1976D2',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  sectionCompleted: {
    backgroundColor: '#F1F8E9',
    borderLeftColor: '#4CAF50',
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
  sectionNumberDone: {
    backgroundColor: '#4CAF50',
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
  finalConfirmBoxActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  finalConfirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  finalConfirmText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 21,
    marginBottom: 12,
  },
  finalWarningText: {
    fontSize: 13,
    color: '#B71C1C',
    fontWeight: '600',
    marginBottom: 12,
  },
  confirmDecisionBtn: {
    marginTop: 10,
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  refuseDecisionBtn: {
    marginTop: 12,
    backgroundColor: '#B71C1C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  decisionBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  decisionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});