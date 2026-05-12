// =============================================================================
// MIKROFON TEST EKRANI
// Amacı: Telefonun mikrofonu çalışıyor mu, izin alınabiliyor mu test etmek
// Kullanım: Tarayıcıdan /mikrofon-test yoluna git
// =============================================================================

import {
    AudioModule,
    RecordingPresets,
    useAudioPlayer,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MikrofonTestScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [kayitUri, setKayitUri] = useState<string | null>(null);
  const [izinDurumu, setIzinDurumu] = useState<string>('Kontrol ediliyor...');
  const [loglar, setLoglar] = useState<string[]>([]);
  const player = useAudioPlayer(kayitUri ? { uri: kayitUri } : null);

  const log = (mesaj: string) => {
    const zaman = new Date().toLocaleTimeString('tr-TR');
    setLoglar((prev) => [`[${zaman}] ${mesaj}`, ...prev].slice(0, 20));
    console.log(`[MIK-TEST] ${mesaj}`);
  };

  // Sayfa açılınca izin kontrol et
  useEffect(() => {
    (async () => {
      log('İzin durumu kontrol ediliyor...');
      try {
        const izinler = await AudioModule.requestRecordingPermissionsAsync();
        log(`İzin sonucu: ${JSON.stringify(izinler)}`);
        if (izinler.granted) {
          setIzinDurumu('✅ İzin verildi');
        } else {
          setIzinDurumu('❌ İzin verilmedi');
        }
      } catch (e: any) {
        log(`İzin hatası: ${e?.message ?? e}`);
        setIzinDurumu('⚠️ Hata: ' + (e?.message ?? 'bilinmiyor'));
      }
    })();
  }, []);

  const kaydiBaslat = async () => {
    try {
      log('Kayıt başlatılıyor...');
      setKayitUri(null);
      await recorder.prepareToRecordAsync();
      log('prepareToRecordAsync tamamlandı');
      recorder.record();
      log('record() çağrıldı, kayıt aktif');
    } catch (e: any) {
      log(`HATA - kayıt başlatma: ${e?.message ?? e}`);
      Alert.alert('Kayıt Hatası', e?.message ?? String(e));
    }
  };

  const kaydiDurdur = async () => {
    try {
      log('Kayıt durduruluyor...');
      await recorder.stop();
      const uri = recorder.uri;
      log(`Kayıt bitti. URI: ${uri}`);
      if (uri) {
        setKayitUri(uri);
        log('✅ Kayıt başarılı, çalmaya hazır');
      } else {
        log('⚠️ URI boş geldi');
      }
    } catch (e: any) {
      log(`HATA - kayıt durdurma: ${e?.message ?? e}`);
    }
  };

  const kaydiCal = async () => {
    if (!kayitUri) {
      log('Çalınacak kayıt yok');
      return;
    }
    try {
      log('Kayıt çalınıyor...');
      player.seekTo(0);
      player.play();
      log('▶️ Çalma başladı');
    } catch (e: any) {
      log(`HATA - çalma: ${e?.message ?? e}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎤 Mikrofon Testi</Text>
      <Text style={styles.subtitle}>
        Bu ekran telefonun mikrofonunun çalışıp çalışmadığını test eder
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>İzin Durumu</Text>
        <Text style={styles.value}>{izinDurumu}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Kayıt Durumu</Text>
        <Text style={styles.value}>
          {recorderState.isRecording ? '🔴 Kayıt yapılıyor...' : '⏸️ Hazır'}
        </Text>
        {recorderState.isRecording && (
          <Text style={styles.duration}>
            Süre: {Math.round((recorderState.durationMillis ?? 0) / 1000)}s
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary, recorderState.isRecording && styles.btnDisabled]}
        disabled={recorderState.isRecording}
        onPress={kaydiBaslat}>
        <Text style={styles.btnText}>🎤 Kayıt Başlat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnDanger, !recorderState.isRecording && styles.btnDisabled]}
        disabled={!recorderState.isRecording}
        onPress={kaydiDurdur}>
        <Text style={styles.btnText}>⏹️ Kaydı Durdur</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnSuccess, !kayitUri && styles.btnDisabled]}
        disabled={!kayitUri}
        onPress={kaydiCal}>
        <Text style={styles.btnText}>▶️ Kaydı Çal</Text>
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
          1. Sayfa açıldığında izin penceresi çıkmalı → "İzin Ver" de{'\n'}
          2. "Kayıt Başlat" → telefona "merhaba bir iki üç" gibi konuş{'\n'}
          3. "Kaydı Durdur"{'\n'}
          4. "Kaydı Çal" → sesini duyabiliyor musun?{'\n\n'}
          ✅ Duyabiliyorsan: Mikrofon çalışıyor (sorun ses tanıma katmanında){'\n'}
          ❌ Duyamıyorsan veya hata varsa: Mikrofon donanım/izin sorunu
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
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#222' },
  duration: { fontSize: 14, color: '#D32F2F', marginTop: 4 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  btnPrimary: { backgroundColor: '#1976D2' },
  btnDanger: { backgroundColor: '#D32F2F' },
  btnSuccess: { backgroundColor: '#2E7D32' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logBox: {
    backgroundColor: '#212121', padding: 12, borderRadius: 8,
    marginTop: 16, marginBottom: 16, minHeight: 120,
  },
  logTitle: { color: '#4FC3F7', fontWeight: 'bold', marginBottom: 8 },
  logEmpty: { color: '#999', fontStyle: 'italic', fontSize: 12 },
  logLine: { color: '#fff', fontSize: 11, fontFamily: 'monospace', marginBottom: 3 },
  geriBtn: { padding: 12, alignItems: 'center', marginTop: 8 },
  geriBtnText: { color: '#1976D2', fontWeight: '600' },
  aciklama: {
    backgroundColor: '#FFF3E0', padding: 14, borderRadius: 10, marginTop: 16,
    borderLeftWidth: 4, borderLeftColor: '#FB8C00',
  },
  aciklamaTitle: { fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  aciklamaText: { color: '#5D4037', fontSize: 12, lineHeight: 20 },
});