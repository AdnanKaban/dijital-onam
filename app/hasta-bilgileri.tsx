import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSesliAsistan } from '../hooks/useSesliAsistan';

// =============================================================================
// HASTA BİLGİLERİ FORMU + SESLİ ASİSTAN
// =============================================================================

type FormData = {
  adSoyad: string; tcKimlik: string; dogumTarihi: string;
  kilo: string; boy: string; cinsiyet: 'kadin' | 'erkek' | '';
  alerji: string; kullandigiIlaclar: string; bilinenHastaliklar: string;
  sigaraKullanimi: 'evet' | 'hayir' | '';
  sigaraYil: string; sigaraPaketGun: string; alkol: string;
  protokolNo: string; isteyenDoktor: string; preoperatifTani: string;
  tarih: string; saat: string; planlananOperasyon: string;
  medikalHikaye: string; kardiyovaskuler: string; diabet: string;
  solunum: string; renal: string; norolojik: string;
  hepatik: string; artritKas: string; digerHastalik: string;
};

const initialForm: FormData = {
  adSoyad: '', tcKimlik: '', dogumTarihi: '', kilo: '', boy: '', cinsiyet: '',
  alerji: '', kullandigiIlaclar: '', bilinenHastaliklar: '',
  sigaraKullanimi: '', sigaraYil: '', sigaraPaketGun: '', alkol: '',
  protokolNo: '', isteyenDoktor: '', preoperatifTani: '', tarih: '', saat: '',
  planlananOperasyon: '', medikalHikaye: '', kardiyovaskuler: '', diabet: '',
  solunum: '', renal: '', norolojik: '', hepatik: '', artritKas: '', digerHastalik: '',
};

export default function HastaBilgileriScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tr = params.lang !== 'en';
  const [form, setForm] = useState<FormData>(initialForm);
  const [eDevletAlanlari, setEDevletAlanlari] = useState<Set<keyof FormData>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  const {
    adim: asistanAdim,
    cevaplar,
    dinleniyor,
    sonAlinanMetin,
    hataMesaji,
    karsilamayiBaslat,
    asistaniBaslat,
    asistaniDurdur,
  } = useSesliAsistan({
    onTamamlandi: (cv) => {
      setForm((prev) => ({
        ...prev,
        sigaraKullanimi: cv.sigaraKullanimi,
        sigaraYil: cv.sigaraYil,
        sigaraPaketGun: cv.sigaraPaketGun,
        alkol: cv.alkol === 'evet' ? (tr ? 'Kullanıyor' : 'Yes') :
               cv.alkol === 'hayir' ? (tr ? 'Kullanmıyor' : 'No') : '',
      }));
      // Otomatik aşağı kaydır - hemen ve birkaç saniye sonra tekrar (animasyon bekler)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 1500);
    },
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      sigaraKullanimi: cevaplar.sigaraKullanimi || prev.sigaraKullanimi,
      sigaraYil: cevaplar.sigaraYil || prev.sigaraYil,
      sigaraPaketGun: cevaplar.sigaraPaketGun || prev.sigaraPaketGun,
      alkol: cevaplar.alkol === 'evet' ? (tr ? 'Kullanıyor' : 'Yes') :
             cevaplar.alkol === 'hayir' ? (tr ? 'Kullanmıyor' : 'No') : prev.alkol,
    }));
  }, [cevaplar, tr]);

  // Animasyonlar
  const mikYanip = useRef(new Animated.Value(1)).current;
  const dinlemePulse = useRef(new Animated.Value(1)).current;
  const devamPulse = useRef(new Animated.Value(1)).current;
  const devamOpacity = useRef(new Animated.Value(1)).current; // YENİ: kırmızı yanıp sönme

  useEffect(() => {
    if (asistanAdim === 'karsilama' || asistanAdim === 'kapali') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(mikYanip, { toValue: 0.5, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(mikYanip, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      mikYanip.setValue(1);
    }
  }, [asistanAdim, mikYanip]);

  useEffect(() => {
    if (dinleniyor) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(dinlemePulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(dinlemePulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      dinlemePulse.setValue(1);
    }
  }, [dinleniyor, dinlemePulse]);

  // Devam et butonu — asistan TAMAM olunca scale pulse + opacity blink
  useEffect(() => {
    if (asistanAdim === 'tamam') {
      // Scale pulse
      const scaleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(devamPulse, { toValue: 1.08, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(devamPulse, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      );
      // Opacity blink (daha yavaş, dikkat çekici)
      const opacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(devamOpacity, { toValue: 0.6, duration: 600, useNativeDriver: true }),
          Animated.timing(devamOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      scaleAnim.start();
      opacityAnim.start();
      return () => {
        scaleAnim.stop();
        opacityAnim.stop();
      };
    } else {
      devamPulse.setValue(1);
      devamOpacity.setValue(1);
    }
  }, [asistanAdim, devamPulse, devamOpacity]);

  // E-Devlet verilerini yükle
  useEffect(() => {
    if (params.tcKimlik) {
      const yeniForm = { ...initialForm };
      const dolanAlanlar = new Set<keyof FormData>();
      const eslesmeler: { param: string; alan: keyof FormData }[] = [
        { param: 'tcKimlik', alan: 'tcKimlik' },
        { param: 'adSoyad', alan: 'adSoyad' },
        { param: 'dogumTarihi', alan: 'dogumTarihi' },
        { param: 'cinsiyet', alan: 'cinsiyet' },
        { param: 'kilo', alan: 'kilo' },
        { param: 'boy', alan: 'boy' },
        { param: 'alerji', alan: 'alerji' },
        { param: 'kullandigiIlaclar', alan: 'kullandigiIlaclar' },
        { param: 'bilinenHastaliklar', alan: 'bilinenHastaliklar' },
      ];
      eslesmeler.forEach(({ param, alan }) => {
        const deger = params[param];
        if (deger && typeof deger === 'string' && deger.trim() !== '') {
          (yeniForm as any)[alan] = deger;
          dolanAlanlar.add(alan);
        }
      });
      setForm(yeniForm);
      setEDevletAlanlari(dolanAlanlar);
      if (tr) {
        setTimeout(() => karsilamayiBaslat(), 800);
      }
    }
  }, [params.tcKimlik]);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const isFromEDevlet = (field: keyof FormData) => eDevletAlanlari.has(field);
  const isLocked = (field: keyof FormData) => {
    const kilitliAlanlar: (keyof FormData)[] = ['adSoyad', 'tcKimlik', 'dogumTarihi', 'cinsiyet'];
    return kilitliAlanlar.includes(field) && isFromEDevlet(field);
  };

  const handleAsistanButton = () => {
    if (asistanAdim === 'kapali' || asistanAdim === 'karsilama') {
      asistaniBaslat();
    } else if (asistanAdim !== 'tamam') {
      asistaniDurdur();
    }
  };

  const handleContinue = () => {
    if (!form.adSoyad.trim()) {
      Alert.alert(tr ? 'Eksik Bilgi' : 'Missing', tr ? 'Ad soyad bilgisi alınamadı.' : 'Name missing.');
      return;
    }
    if (!form.tcKimlik.trim() || form.tcKimlik.length !== 11) {
      Alert.alert(tr ? 'Eksik Bilgi' : 'Missing', tr ? 'TC Kimlik bilgisi alınamadı.' : 'ID missing.');
      return;
    }
    if (!form.dogumTarihi.trim()) {
      Alert.alert(tr ? 'Eksik Bilgi' : 'Missing', tr ? 'Doğum tarihi alınamadı.' : 'DOB missing.');
      return;
    }
    if (!form.cinsiyet) {
      Alert.alert(tr ? 'Eksik Bilgi' : 'Missing', tr ? 'Cinsiyet alınamadı.' : 'Gender missing.');
      return;
    }
    asistaniDurdur();
    const isimParcalari = form.adSoyad.trim().split(' ');
    const ad = isimParcalari.slice(0, -1).join(' ') || isimParcalari[0];
    const soyad = isimParcalari.length > 1 ? isimParcalari[isimParcalari.length - 1] : '';
    router.push({
      pathname: '/bilgilendirme-secim',
      params: {
        lang: params.lang ?? 'tr', ad, soyad,
        adSoyad: form.adSoyad, tcKimlik: form.tcKimlik, protokolNo: form.tcKimlik,
        dogumTarihi: form.dogumTarihi, cinsiyet: form.cinsiyet,
        kilo: form.kilo, boy: form.boy, alerji: form.alerji,
        kullandigiIlaclar: form.kullandigiIlaclar, bilinenHastaliklar: form.bilinenHastaliklar,
        sigaraKullanimi: form.sigaraKullanimi, sigaraYil: form.sigaraYil,
        sigaraPaketGun: form.sigaraPaketGun, alkol: form.alkol,
      },
    });
  };

  const asistanDurumMetni = (): string => {
    if (!tr) return '';
    switch (asistanAdim) {
      case 'karsilama': return '🎤 Mikrofon butonuna basarak başlayın';
      case 'aktifBekle': return '🎤 Sesli asistan başlatılıyor...';
      case 'sigaraSoru': return dinleniyor ? '🔴 Dinleniyor: Sigara kullanıyor musunuz?' : '🔊 Soru soruluyor...';
      case 'sigaraYil': return dinleniyor ? '🔴 Dinleniyor: Kaç yıldır?' : '🔊 Soru soruluyor...';
      case 'sigaraPaket': return dinleniyor ? '🔴 Dinleniyor: Günde kaç paket?' : '🔊 Soru soruluyor...';
      case 'alkolSoru': return dinleniyor ? '🔴 Dinleniyor: Alkol kullanıyor musunuz?' : '🔊 Soru soruluyor...';
      case 'ozet': return '🔊 Özet okunuyor...';
      case 'tamam': return '✓ Bilgileriniz alındı, kırmızı butona basın';
      default: return '';
    }
  };

  return (
    <LinearGradient colors={['#E57373', '#C62828']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>{tr ? 'Hasta Bilgileri' : 'Patient Information'}</Text>
            <Text style={styles.subtitle}>
              {tr ? 'Anestezi Konsültasyon Formu — K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi'
                  : 'Anesthesia Consultation Form — K.B.U. Karabük Training and Research Hospital'}
            </Text>

            {tr && asistanAdim !== 'kapali' && (
              <View style={styles.asistanStatusBar}>
                <Text style={styles.asistanStatusText}>{asistanDurumMetni()}</Text>
                {sonAlinanMetin && (
                  <Text style={styles.asistanLastSpeech}>Duyduğum: "{sonAlinanMetin}"</Text>
                )}
                {hataMesaji && <Text style={styles.asistanError}>{hataMesaji}</Text>}
              </View>
            )}

            {eDevletAlanlari.size > 0 && (
              <View style={styles.eDevletBanner}>
                <Text style={styles.eDevletBannerIcon}>✓</Text>
                <Text style={styles.eDevletBannerText}>
                  {tr ? 'Bilgileriniz e-Devlet üzerinden otomatik alınmıştır. İşaretli (✓) alanları gerekirse güncelleyebilirsiniz.'
                      : 'Your information has been retrieved from e-Government. You can update marked (✓) fields.'}
                </Text>
              </View>
            )}

            <Text style={styles.sectionHeader}>{tr ? 'Kimlik Bilgileri' : 'Identity'}</Text>
            <Field label={tr ? 'Ad - Soyad *' : 'Full Name *'} value={form.adSoyad}
              onChange={(v) => updateField('adSoyad', v)} placeholder={tr ? 'Adınız ve soyadınız' : 'Your full name'}
              fromEDevlet={isFromEDevlet('adSoyad')} locked={isLocked('adSoyad')} />
            <Field label={tr ? 'T.C. Kimlik No *' : 'National ID *'} value={form.tcKimlik}
              onChange={(v) => { const c = v.replace(/[^0-9]/g, '').slice(0, 11); updateField('tcKimlik', c); }}
              keyboardType="numeric" placeholder={tr ? '11 haneli kimlik' : '11-digit ID'}
              fromEDevlet={isFromEDevlet('tcKimlik')} locked={isLocked('tcKimlik')} />
            <Field label={tr ? 'Doğum Tarihi *' : 'Date of Birth *'} value={form.dogumTarihi}
              onChange={(v) => updateField('dogumTarihi', v)} placeholder={tr ? 'GG/AA/YYYY' : 'DD/MM/YYYY'}
              fromEDevlet={isFromEDevlet('dogumTarihi')} locked={isLocked('dogumTarihi')} />

            <Text style={styles.sectionHeader}>{tr ? 'Fiziksel Bilgiler' : 'Physical'}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label={tr ? 'Kilo (kg)' : 'Weight (kg)'} value={form.kilo}
                  onChange={(v) => updateField('kilo', v)} keyboardType="numeric" fromEDevlet={isFromEDevlet('kilo')} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Field label={tr ? 'Boy (cm)' : 'Height (cm)'} value={form.boy}
                  onChange={(v) => updateField('boy', v)} keyboardType="numeric" fromEDevlet={isFromEDevlet('boy')} />
              </View>
            </View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{tr ? 'Cinsiyet *' : 'Gender *'}</Text>
              {isFromEDevlet('cinsiyet') && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.choiceBtn, form.cinsiyet === 'kadin' && styles.choiceBtnActive, isLocked('cinsiyet') && styles.choiceBtnDisabled]}
                disabled={isLocked('cinsiyet')} onPress={() => updateField('cinsiyet', 'kadin')}>
                <Text style={[styles.choiceBtnText, form.cinsiyet === 'kadin' && styles.choiceBtnTextActive]}>
                  {tr ? 'Kadın' : 'Female'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, form.cinsiyet === 'erkek' && styles.choiceBtnActive, isLocked('cinsiyet') && styles.choiceBtnDisabled]}
                disabled={isLocked('cinsiyet')} onPress={() => updateField('cinsiyet', 'erkek')}>
                <Text style={[styles.choiceBtnText, form.cinsiyet === 'erkek' && styles.choiceBtnTextActive]}>
                  {tr ? 'Erkek' : 'Male'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>{tr ? 'Alerji ve İlaçlar' : 'Allergies & Medications'}</Text>
            <Field label={tr ? 'Alerjileriniz' : 'Allergies'} value={form.alerji}
              onChange={(v) => updateField('alerji', v)} multiline
              placeholder={tr ? 'Varsa yazınız.' : 'List allergies.'} fromEDevlet={isFromEDevlet('alerji')} />
            <Field label={tr ? 'Kullandığınız İlaçlar' : 'Medications'} value={form.kullandigiIlaclar}
              onChange={(v) => updateField('kullandigiIlaclar', v)} multiline
              placeholder={tr ? 'İlaçları yazınız.' : 'List medications.'} fromEDevlet={isFromEDevlet('kullandigiIlaclar')} />

            <Text style={styles.sectionHeader}>{tr ? 'Bilinen Hastalıklarınız' : 'Known Conditions'}</Text>
            <Field label={tr ? 'Hastalıklarınız' : 'Conditions'} value={form.bilinenHastaliklar}
              onChange={(v) => updateField('bilinenHastaliklar', v)} multiline
              placeholder={tr ? 'Bildiğiniz hastalıklar.' : 'List conditions.'} fromEDevlet={isFromEDevlet('bilinenHastaliklar')} />

            <View style={styles.aliskanliklarBox}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeader, { marginTop: 0 }]}>{tr ? 'Alışkanlıklar' : 'Habits'}</Text>
                {asistanAdim !== 'kapali' && asistanAdim !== 'tamam' && (
                  <Text style={styles.aktifBadge}>{tr ? '🎤 Sesli asistan aktif' : '🎤 Active'}</Text>
                )}
              </View>

              <Text style={styles.label}>{tr ? 'Sigara Kullanıyor musunuz?' : 'Do you smoke?'}</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.choiceBtn, form.sigaraKullanimi === 'evet' && styles.choiceBtnActive]}
                  onPress={() => updateField('sigaraKullanimi', 'evet')}>
                  <Text style={[styles.choiceBtnText, form.sigaraKullanimi === 'evet' && styles.choiceBtnTextActive]}>
                    {tr ? 'Evet' : 'Yes'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceBtn, form.sigaraKullanimi === 'hayir' && styles.choiceBtnActive]}
                  onPress={() => updateField('sigaraKullanimi', 'hayir')}>
                  <Text style={[styles.choiceBtnText, form.sigaraKullanimi === 'hayir' && styles.choiceBtnTextActive]}>
                    {tr ? 'Hayır' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              {form.sigaraKullanimi === 'evet' && (
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label={tr ? 'Kaç yıldır?' : 'For years?'} value={form.sigaraYil}
                      onChange={(v) => updateField('sigaraYil', v)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Field label={tr ? 'Paket / gün' : 'Pack / day'} value={form.sigaraPaketGun}
                      onChange={(v) => updateField('sigaraPaketGun', v)} keyboardType="numeric" />
                  </View>
                </View>
              )}

              <Field label={tr ? 'Alkol Kullanımı' : 'Alcohol'} value={form.alkol}
                onChange={(v) => updateField('alkol', v)}
                placeholder={tr ? 'Sıklık ve miktar.' : 'Frequency.'} />
            </View>

            <View style={styles.staffNotice}>
              <Text style={styles.staffNoticeTitle}>{tr ? 'ℹ️ Bilgilendirme' : 'ℹ️ Info'}</Text>
              <Text style={styles.staffNoticeText}>
                {tr ? 'Klinik muayene ve anestezi planı, anestezi uzmanınız tarafından eklenecektir.'
                    : 'Clinical info will be added by your anesthesiologist.'}
              </Text>
            </View>

            {/* DEVAM ET BUTONU - asistan tamam olunca kırmızı yanıp söner */}
            <Animated.View style={{
              transform: [{ scale: devamPulse }],
              opacity: asistanAdim === 'tamam' ? devamOpacity : 1,
            }}>
              <TouchableOpacity
                style={[
                  styles.continueBtn,
                  asistanAdim === 'tamam' && styles.continueBtnHighlight,
                ]}
                onPress={handleContinue}>
                {asistanAdim === 'tamam' && (
                  <Text style={styles.continueBtnIcon}>👉</Text>
                )}
                <Text style={[
                  styles.continueBtnText,
                  asistanAdim === 'tamam' && styles.continueBtnTextHighlight,
                ]}>
                  {tr ? 'Devam Et →' : 'Continue →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sesli asistan mikrofon butonu */}
      {tr && (
        <Animated.View style={[styles.mikButton, { opacity: mikYanip, transform: [{ scale: dinlemePulse }] }]}>
          <TouchableOpacity
            onPress={handleAsistanButton}
            style={[
              styles.mikButtonInner,
              dinleniyor && styles.mikButtonDinleniyor,
              asistanAdim === 'tamam' && styles.mikButtonTamam,
            ]}>
            <Text style={styles.mikButtonIcon}>
              {dinleniyor ? '🔴' : asistanAdim === 'tamam' ? '✓' : '🎤'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

type FieldProps = {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  fromEDevlet?: boolean; locked?: boolean;
};

function Field({ label, value, onChange, placeholder, multiline, keyboardType, fromEDevlet, locked }: FieldProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {fromEDevlet && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, locked && styles.inputLocked]}
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor="#aaa" multiline={multiline}
        keyboardType={keyboardType ?? 'default'} editable={!locked}
      />
    </View>
  );
}

// =============================================================================
// STILLER
// =============================================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#C62828', textAlign: 'center' },
  subtitle: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4, marginBottom: 12 },
  asistanStatusBar: {
    backgroundColor: '#FFF8E1', padding: 10, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: '#FB8C00', marginBottom: 12,
  },
  asistanStatusText: { color: '#E65100', fontSize: 13, fontWeight: '600' },
  asistanLastSpeech: { color: '#5D4037', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  asistanError: { color: '#C62828', fontSize: 12, marginTop: 4 },
  eDevletBanner: {
    backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: '#2E7D32',
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
  },
  eDevletBannerIcon: { fontSize: 20, color: '#2E7D32', marginRight: 10, fontWeight: 'bold' },
  eDevletBannerText: { color: '#1B5E20', fontSize: 12, flex: 1, lineHeight: 17 },
  sectionHeader: {
    fontSize: 14, fontWeight: 'bold', color: '#C62828',
    marginTop: 14, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FFCDD2', paddingBottom: 4,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aktifBadge: {
    backgroundColor: '#C62828', color: '#fff', fontSize: 10, fontWeight: 'bold',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden',
  },
  aliskanliklarBox: {
    backgroundColor: '#FFFBF0', padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#FFE0B2', marginTop: 10,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 12, color: '#444', fontWeight: '600' },
  checkMark: { color: '#2E7D32', fontSize: 14, marginLeft: 6, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#222', backgroundColor: '#fff',
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  inputLocked: { backgroundColor: '#F5F5F5', color: '#666' },
  row: { flexDirection: 'row', marginBottom: 8 },
  choiceBtn: {
    flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', marginHorizontal: 4, backgroundColor: '#fff',
  },
  choiceBtnActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  choiceBtnDisabled: { opacity: 0.6 },
  choiceBtnText: { color: '#444', fontWeight: '600', fontSize: 13 },
  choiceBtnTextActive: { color: '#fff' },
  staffNotice: {
    backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: '#1976D2', marginTop: 14,
  },
  staffNoticeTitle: { fontWeight: 'bold', color: '#0D47A1', fontSize: 12, marginBottom: 4 },
  staffNoticeText: { color: '#1A237E', fontSize: 11, lineHeight: 16 },

  // DEVAM ET BUTONU - normal hali
  continueBtn: {
    backgroundColor: '#C62828', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 18, flexDirection: 'row', justifyContent: 'center',
  },
  // DEVAM ET BUTONU - asistan tamam olunca (vurgulu kırmızı)
  continueBtnHighlight: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#FFEB3B',
    shadowColor: '#FF0000',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    padding: 20,
  },
  continueBtnIcon: { fontSize: 22, marginRight: 8 },
  continueBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  continueBtnTextHighlight: { fontSize: 19 },

  // MIKROFON BUTONU
  mikButton: {
    position: 'absolute', bottom: 24, right: 24,
    width: 64, height: 64, borderRadius: 32,
  },
  mikButtonInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  mikButtonDinleniyor: { backgroundColor: '#D32F2F' },
  mikButtonTamam: { backgroundColor: '#2E7D32' },
  mikButtonIcon: { fontSize: 28 },
});