import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { eDevletGirisYap } from '../data/mockHastaDatabase';

type Durum = 'bekliyor' | 'dogrulaniyor' | 'karsilamaEkrani';

export default function GirisEkrani() {
  const router = useRouter();
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [hastaAdi, setHastaAdi] = useState<string>('');

  const handleEDevletGiris = async () => {
    setDurum('dogrulaniyor');
    try {
      const hasta = await eDevletGirisYap();
      const ilkAd = hasta.adSoyad.split(' ')[0];
      const unvan = hasta.cinsiyet === 'kadin' ? 'Hanım' : 'Bey';
      setHastaAdi(`${ilkAd} ${unvan}`);
      setDurum('karsilamaEkrani');
      setTimeout(() => {
        router.push({
          pathname: '/dil-secimi',
          params: {
            tcKimlik: hasta.tcKimlik,
            adSoyad: hasta.adSoyad,
            dogumTarihi: hasta.dogumTarihi,
            cinsiyet: hasta.cinsiyet,
            kilo: hasta.kilo,
            boy: hasta.boy,
            alerji: hasta.alerji,
            kullandigiIlaclar: hasta.kullandigiIlaclar,
            bilinenHastaliklar: hasta.bilinenHastaliklar,
          },
        });
      }, 2000);
    } catch (err) {
      setDurum('bekliyor');
    }
  };

  return (
    <LinearGradient colors={['#E57373', '#C62828']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>Anestezi Dijital Onam Sistemi</Text>
          <Text style={styles.subtitle}>
            K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi
          </Text>
        </View>

        {durum === 'bekliyor' && (
          <View style={styles.cardWrapper}>
            <Text style={styles.welcomeText}>
              Onam sürecine başlamak için kimliğinizi doğrulayınız.
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEDevletGiris}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonIcon}>🔐</Text>
              <Text style={styles.loginButtonText}>e-Devlet ile Giriş Yap</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Bilgileriniz kimlik doğrulama sonrasında sistem üzerinden otomatik
              olarak alınacaktır.
            </Text>

            {/* GEÇİCİ — Test butonları (tezde kaldırılacak) */}
            <View style={styles.testGrup}>
              <Text style={styles.testGrupLabel}>🔧 Geliştirici Testleri</Text>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#FFA000' }]}
                onPress={() => router.push('/mikrofon-test')}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonText}>🎤 Mikrofon Kayıt Testi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#7B1FA2' }]}
                onPress={() => router.push('/stt-test')}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonText}>🎙️ Ses Tanıma (STT) Testi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {durum === 'dogrulaniyor' && (
          <View style={styles.cardWrapper}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.statusText}>
              e-Devlet ile giriş yapılıyor...
            </Text>
            <Text style={styles.statusSubText}>
              T.C. Kimlik doğrulanıyor
            </Text>
          </View>
        )}

        {durum === 'karsilamaEkrani' && (
          <View style={styles.cardWrapper}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.welcomeBig}>Hoş geldiniz</Text>
            <Text style={styles.welcomeName}>{hastaAdi}</Text>
            <Text style={styles.statusSubText}>
              Bilgileriniz başarıyla alındı
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  headerBox: { alignItems: 'center', marginBottom: 48 },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#fff',
    textAlign: 'center', marginBottom: 8,
  },
  subtitle: { fontSize: 13, color: '#FFE0E0', textAlign: 'center' },
  cardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16,
    padding: 24, alignItems: 'center', minHeight: 220, justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 15, color: '#fff', textAlign: 'center',
    marginBottom: 24, lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', width: '100%',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  loginButtonIcon: { fontSize: 22, marginRight: 10 },
  loginButtonText: { color: '#C62828', fontWeight: 'bold', fontSize: 16 },
  helperText: {
    fontSize: 12, color: '#FFE0E0', textAlign: 'center',
    marginTop: 16, lineHeight: 18, fontStyle: 'italic',
  },
  testGrup: {
    marginTop: 24,
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  testGrupLabel: {
    color: '#FFE0E0',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  testButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  testButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  statusText: {
    fontSize: 16, color: '#fff', fontWeight: '600',
    marginTop: 20, textAlign: 'center',
  },
  statusSubText: {
    fontSize: 13, color: '#FFE0E0', marginTop: 6, textAlign: 'center',
  },
  checkIcon: { fontSize: 64, color: '#fff', marginBottom: 8 },
  welcomeBig: { fontSize: 22, color: '#fff', marginBottom: 4 },
  welcomeName: { fontSize: 26, color: '#fff', fontWeight: 'bold', marginBottom: 16 },
});