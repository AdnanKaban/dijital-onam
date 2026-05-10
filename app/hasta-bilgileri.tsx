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
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 800);
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

  useEffect(() => {
    if (asistanAdim === 'tamam') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(devamPulse, { toValue: 1.05, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(devamPulse, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      devamPulse.setValue(1);
    }
  }, [asistanAdim, devamPulse]);

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
      pathname: '/bilgilendirme',
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
      case 'tamam': return '✓ Bilgileriniz alındı, devam edebilirsiniz';
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

            {/* ALIŞKANLIKLAR — Sesli asistan bu kısmı dolduracak */}
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

            <Animated.View style={{ transform: [{ scale: devamPulse }] }}>
              <TouchableOpacity
                style={[styles.continueBtn, asistanAdim === 'tamam' && styles.continueBtnHighlight]}
                onPress={handleContinue}>
                <Text style={styles.continueBtnText}>{tr ? 'Devam Et →' : 'Continue →'}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#C62828', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20 },
  asistanStatusBar: { backgroundColor: '#1976D2', padding: 12, borderRadius: 10, marginBottom: 16 },
  asistanStatusText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  asistanLastSpeech: { color: '#BBDEFB', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  asistanError: { color: '#FFEBEE', fontSize: 12, marginTop: 4 },
  eDevletBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#2E7D32',
    padding: 12, borderRadius: 8, marginBottom: 16,
  },
  eDevletBannerIcon: { fontSize: 22, color: '#2E7D32', fontWeight: 'bold', marginRight: 10 },
  eDevletBannerText: { flex: 1, fontSize: 12, color: '#1B5E20', lineHeight: 18 },
  sectionHeader: {
    fontSize: 16, fontWeight: '700', color: '#C62828',
    marginTop: 16, marginBottom: 10, paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#FFCDD2',
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aktifBadge: { fontSize: 11, color: '#1976D2', fontWeight: '600' },
  aliskanliklarBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, marginTop: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 13, color: '#333', fontWeight: '500' },
  checkMark: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold', marginLeft: 6 },
  input: {
    borderWidth: 1, borderColor: '#FFCDD2', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#FFF8F8', color: '#222',
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  inputLocked: { backgroundColor: '#F0F0F0', color: '#555', borderColor: '#DDD' },
  row: { flexDirection: 'row', marginBottom: 8 },
  choiceBtn: {
    flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFCDD2',
    backgroundColor: '#FFF8F8', alignItems: 'center', marginHorizontal: 4,
  },
  choiceBtnActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  choiceBtnDisabled: { opacity: 0.7 },
  choiceBtnText: { color: '#C62828', fontWeight: '600' },
  choiceBtnTextActive: { color: '#fff' },
  staffNotice: {
    marginTop: 24, padding: 14, borderRadius: 10,
    backgroundColor: '#FFF3E0', borderLeftWidth: 4, borderLeftColor: '#FB8C00',
  },
  staffNoticeTitle: { fontWeight: 'bold', color: '#E65100', marginBottom: 6, fontSize: 14 },
  staffNoticeText: { color: '#5D4037', fontSize: 12, lineHeight: 18 },
  continueBtn: { marginTop: 24, backgroundColor: '#C62828', padding: 16, borderRadius: 12, alignItems: 'center' },
  continueBtnHighlight: {
    backgroundColor: '#2E7D32', shadowColor: '#2E7D32', shadowOpacity: 0.5,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  continueBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  mikButton: {
    position: 'absolute', bottom: 24, right: 24,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  mikButtonInner: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1976D2',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff',
  },
  mikButtonDinleniyor: { backgroundColor: '#D32F2F' },
  mikButtonTamam: { backgroundColor: '#2E7D32' },
  mikButtonIcon: { fontSize: 28 },
});