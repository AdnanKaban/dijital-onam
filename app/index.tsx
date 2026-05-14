import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { eDevletGirisYap } from '../data/mockHastaDatabase';
import { useGirisAsistani } from '../hooks/useGirisAsistani';

type Durum = 'bekliyor' | 'dogrulaniyor' | 'karsilamaEkrani';

export default function GirisEkrani() {
  const router = useRouter();
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [hastaAdi, setHastaAdi] = useState<string>('');

  const handleEDevletGiris = useCallback(async () => {
    girisAsistani.durdur();
    Speech.stop();

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
  }, [router]);

  const girisAsistani = useGirisAsistani({
    aktif: durum === 'bekliyor',
    onGiris: handleEDevletGiris,
  });

  useEffect(() => {
    if (durum !== 'bekliyor') return;

    const timer = setTimeout(() => {
      girisAsistani.baslat();
    }, 700);

    return () => {
      clearTimeout(timer);
      girisAsistani.durdur();
      Speech.stop();
    };
  }, [durum, girisAsistani]);

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

            <View style={styles.voiceBox}>
              <Text style={styles.voiceText}>
                {girisAsistani.dinleniyor
                  ? '🎤 Dinleniyor...'
                  : girisAsistani.sonAlinanMetin
                  ? `Son algılanan: ${girisAsistani.sonAlinanMetin}`
                  : 'e-Devlet ile giriş yapmak için “giriş” diyebilirsiniz.'}
              </Text>

              {girisAsistani.hataMesaji ? (
                <Text style={styles.errorText}>{girisAsistani.hataMesaji}</Text>
              ) : null}
            </View>

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

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  headerBox: {
    alignItems: 'center',
    marginBottom: 48,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    color: '#FFE0E0',
    textAlign: 'center',
  },

  cardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },

  welcomeText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },

  voiceBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  voiceText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 19,
  },

  errorText: {
    color: '#FFE0E0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  loginButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },

  loginButtonText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 16,
  },

  helperText: {
    fontSize: 12,
    color: '#FFE0E0',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },

  statusSubText: {
    fontSize: 13,
    color: '#FFE0E0',
    marginTop: 6,
    textAlign: 'center',
  },

  checkIcon: {
    fontSize: 64,
    color: '#fff',
    marginBottom: 8,
  },

  welcomeBig: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 4,
  },

  welcomeName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});