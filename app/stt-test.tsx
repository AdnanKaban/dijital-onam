// =============================================================================
// SES TANIMA (STT) TEST EKRANI
// expo-speech-recognition paketinin Türkçe ses tanımayı yapıp yapamadığını test
// Beklenen senaryo: Hasta "evet", "hayır", "10", "1" gibi kelimeler söyler
// =============================================================================

import { useRouter } from 'expo-router';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SttTestScreen() {
  const router = useRouter();
  const [dinleniyor, setDinleniyor] = useState(false);
  const [canliMetin, setCanliMetin] = useState('');
  const [sonMetin, setSonMetin] = useState('');
  const [tumSonuclar, setTumSonuclar] = useState<string[]>([]);
  const [loglar, setLoglar] = useState<string[]>([]);
  const [izinDurumu, setIzinDurumu] = useState<string>('Kontrol ediliyor...');

  const log = (mesaj: string) => {
    const zaman = new Date().toLocaleTimeString('tr-TR');
    setLoglar((prev) => [`[${zaman}] ${mesaj}`, ...prev].slice(0, 30));
    console.log(`[STT-TEST] ${mesaj}`);
  };

  // Sayfa açıldığında izin durumunu kontrol et
  useEffect(() => {
    (async () => {
      try {
        log('İzin kontrolü başlıyor...');
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        log(`İzin sonucu: ${JSON.stringify(result)}`);
        if (result.granted) {
          setIzinDurumu('✅ İzinler verildi');
        } else {
          setIzinDurumu('❌ İzin reddedildi');
        }
      } catch (e: any) {
        log(`İzin hatası: ${e?.message ?? e}`);
        setIzinDurumu('⚠️ Hata: ' + (e?.message ?? 'bilinmiyor'));
      }
    })();
  }, []);

  // Ses tanıma event'leri
  useSpeechRecognitionEvent('start', () => {
    log('🟢 Dinleme başladı');
    setDinleniyor(true);
  });

  useSpeechRecognitionEvent('end', () => {
    log('🔴 Dinleme sonlandı');
    setDinleniyor(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const sonuc = event.results[0]?.transcript ?? '';
    log(`📝 Sonuç: "${sonuc}" (final: ${event.isFinal})`);
    
    if (event.isFinal) {
      setSonMetin(sonuc);
      setTumSonuclar((prev) => [...prev, sonuc].slice(-10));
      setCanliMetin('');
    } else {
      setCanliMetin(sonuc);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    log(`❌ HATA - Kod: ${event.error}, Mesaj: ${event.message}`);
    Alert.alert('Hata', `${event.error}: ${event.message}`);
    setDinleniyor(false);
  });

  const dinlemeyiBaslat = async () => {
    try {
      log('Dinleme başlatılıyor...');
      setCanliMetin('');
      
      // Önce izin kontrolü
      const izin = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      if (!izin.granted) {
        log('İzin yok, yeniden istiyor...');
        const yeniIzin = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!yeniIzin.granted) {
          Alert.alert('İzin Gerekli', 'Mikrofon ve ses tanıma izinleri gerekiyor');
          return;
        }
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'tr-TR',
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: ['evet', 'hayır', 'onaylıyorum', 'reddediyorum'],
      });
      log('start() çağrıldı, parametre: lang=tr-TR');
    } catch (e: any) {
      log(`HATA - başlatma: ${e?.message ?? e}`);
      Alert.alert('Başlatma Hatası', e?.message ?? String(e));
    }
  };

  const dinlemeyiDurdur = () => {
    log('Dinleme durduruluyor...');
    ExpoSpeechRecognitionModule.stop();
  };

  const sonuclariTemizle = () => {
    setTumSonuclar([]);
    setSonMetin('');
    setCanliMetin('');
    setLoglar([]);
  };

  // Anahtar kelime tespiti
  const anahtarKelime = (metin: string): string | null => {
    const m = metin.toLowerCase().trim();
    if (m.includes('evet')) return '✅ EVET';
    if (m.includes('hayır') || m.includes('hayir')) return '❌ HAYIR';
    if (m.includes('onaylıyorum') || m.includes('onayliyorum')) return '✅ ONAYLA';
    if (m.includes('reddediyorum')) return '❌ REDDET';
    // Sayı kontrolü
    const sayi = m.match(/\d+/);
    if (sayi) return `🔢 ${sayi[0]}`;
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ Ses Tanıma Testi</Text>
      <Text style={styles.subtitle}>
        Türkçe ses tanıma (STT) testi
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>İzin Durumu</Text>
        <Text style={styles.value}>{izinDurumu}</Text>
      </View>

      <View style={[styles.card, dinleniyor && styles.cardActive]}>
        <Text style={styles.label}>Dinleme Durumu</Text>
        <Text style={styles.value}>
          {dinleniyor ? '🔴 Dinleniyor...' : '⏸️ Hazır'}
        </Text>
        {canliMetin !== '' && (
          <View style={styles.canliBox}>
            <Text style={styles.canliLabel}>Canlı:</Text>
            <Text style={styles.canliText}>{canliMetin}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary, dinleniyor && styles.btnDisabled]}
        disabled={dinleniyor}
        onPress={dinlemeyiBaslat}>
        <Text style={styles.btnText}>🎤 Dinlemeyi Başlat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnDanger, !dinleniyor && styles.btnDisabled]}
        disabled={!dinleniyor}
        onPress={dinlemeyiDurdur}>
        <Text style={styles.btnText}>⏹️ Durdur</Text>
      </TouchableOpacity>

      {sonMetin !== '' && (
        <View style={styles.sonucCard}>
          <Text style={styles.sonucLabel}>Son Tanınan:</Text>
          <Text style={styles.sonucText}>"{sonMetin}"</Text>
          {anahtarKelime(sonMetin) && (
            <Text style={styles.anahtar}>{anahtarKelime(sonMetin)}</Text>
          )}
        </View>
      )}

      {tumSonuclar.length > 0 && (
        <View style={styles.gecmisCard}>
          <Text style={styles.gecmisTitle}>📜 Geçmiş</Text>
          {tumSonuclar.slice().reverse().map((s, i) => (
            <View key={i} style={styles.gecmisRow}>
              <Text style={styles.gecmisText}>"{s}"</Text>
              {anahtarKelime(s) && (
                <Text style={styles.gecmisAnahtar}>{anahtarKelime(s)}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.temizleBtn} onPress={sonuclariTemizle}>
        <Text style={styles.temizleBtnText}>🗑️ Temizle</Text>
      </TouchableOpacity>

      <View style={styles.logBox}>
        <Text style={styles.logTitle}>📋 Loglar</Text>
        {loglar.length === 0 && <Text style={styles.logEmpty}>Henüz log yok</Text>}
        {loglar.map((l, i) => (
          <Text key={i} style={styles.logLine}>{l}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.geriBtn} onPress={() => router.back()}>
        <Text style={styles.geriBtnText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.aciklama}>
        <Text style={styles.aciklamaTitle}>📝 Nasıl Test Ederim?</Text>
        <Text style={styles.aciklamaText}>
          1. "Dinlemeyi Başlat" butonuna bas{'\n'}
          2. Net bir şekilde söyle: "evet", "hayır", "on", "iki"{'\n'}
          3. Tanınan metin "Son Tanınan" kutusunda görünmeli{'\n\n'}
          ✅ Türkçe yazıyorsa: STT çalışıyor!{'\n'}
          ⚠️ İngilizce yazıyorsa: Telefonda Türkçe dil paketi eksik{'\n'}
          ❌ Hata veriyorsa: Logları paylaş
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#C62828', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#F5F5F5', padding: 14, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#1976D2',
  },
  cardActive: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#D32F2F',
  },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#222' },
  canliBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  canliLabel: { fontSize: 10, color: '#999' },
  canliText: { fontSize: 16, color: '#D32F2F', fontStyle: 'italic' },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  btnPrimary: { backgroundColor: '#1976D2' },
  btnDanger: { backgroundColor: '#D32F2F' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sonucCard: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  sonucLabel: { fontSize: 12, color: '#666' },
  sonucText: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20', marginVertical: 4 },
  anahtar: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },
  gecmisCard: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  gecmisTitle: { fontSize: 13, fontWeight: 'bold', color: '#E65100', marginBottom: 6 },
  gecmisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  gecmisText: { fontSize: 13, color: '#5D4037', flex: 1 },
  gecmisAnahtar: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  temizleBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
  temizleBtnText: { color: '#666', fontSize: 12 },
  logBox: {
    backgroundColor: '#212121', padding: 12, borderRadius: 8,
    marginTop: 16, marginBottom: 16, minHeight: 120,
  },
  logTitle: { color: '#4FC3F7', fontWeight: 'bold', marginBottom: 8 },
  logEmpty: { color: '#999', fontStyle: 'italic', fontSize: 12 },
  logLine: { color: '#fff', fontSize: 10, fontFamily: 'monospace', marginBottom: 3 },
  geriBtn: { padding: 12, alignItems: 'center', marginTop: 8 },
  geriBtnText: { color: '#1976D2', fontWeight: '600' },
  aciklama: {
    backgroundColor: '#FFF3E0', padding: 14, borderRadius: 10, marginTop: 16,
    borderLeftWidth: 4, borderLeftColor: '#FB8C00',
  },
  aciklamaTitle: { fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  aciklamaText: { color: '#5D4037', fontSize: 12, lineHeight: 20 },
});