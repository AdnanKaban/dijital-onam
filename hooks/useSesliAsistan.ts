// =============================================================================
// SESLI ASISTAN HOOK
// Anestezi onam uygulaması için sesli yönlendirme + sesle cevap alma
//
// Akış:
//   karsilama → sigaraSoru → (evet ise: sigaraYil → sigaraPaket) →
//   alkolSoru → ozet → tamam
//
// Bu hook bağımsız olarak ses tanıma + TTS yönetir, UI sadece state'i okur
// ve gerekli aksiyonları tetikler.
// =============================================================================

import Voice, {
    SpeechErrorEvent,
    SpeechResultsEvent,
} from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

// ==================== TIP TANIMLARI ====================

export type AsistanAdim =
  | 'kapali'        // Asistan henüz başlamadı
  | 'karsilama'     // "Butona basın" diyor
  | 'aktifBekle'    // Buton basıldı, başlayacak
  | 'sigaraSoru'    // Sigara kullanıyor mu sorusu
  | 'sigaraYil'     // Kaç yıldır
  | 'sigaraPaket'   // Günde kaç paket
  | 'alkolSoru'     // Alkol kullanıyor mu
  | 'ozet'          // Bilgileri okuyor
  | 'tamam';        // Bitti, devam butonu yanıyor

export type SesliAsistanCevaplar = {
  sigaraKullanimi: 'evet' | 'hayir' | '';
  sigaraYil: string;
  sigaraPaketGun: string;
  alkol: 'evet' | 'hayir' | '';
};

const BAŞLANGIÇ_CEVAPLAR: SesliAsistanCevaplar = {
  sigaraKullanimi: '',
  sigaraYil: '',
  sigaraPaketGun: '',
  alkol: '',
};

// ==================== METİN PARSERLAR ====================

/**
 * Konuşulan metinde "evet" veya "hayır" arar.
 * Hasta sadece bu iki kelimeden birini söylemesi için yönlendirildiği için
 * basit kelime kontrolü yeterlidir.
 */
function parseEvetHayir(text: string): 'evet' | 'hayir' | null {
  const lower = text.toLowerCase().trim();
  if (lower.includes('evet')) return 'evet';
  if (lower.includes('hayır') || lower.includes('hayir')) return 'hayir';
  return null;
}

/**
 * Konuşulan metinde sayı arar. Hem dijital ("10") hem yazılı ("on") destekler.
 */
function parseSayi(text: string): string | null {
  const lower = text.toLowerCase().trim();

  // Önce dijital sayı ara (örn: "10 yıldır" → "10")
  const dijitalMatch = lower.match(/\d+/);
  if (dijitalMatch) return dijitalMatch[0];

  // Yazılı sayılar (1-30 arası yeterli, daha fazlası gerekirse genişletilir)
  const yaziliSayilar: Record<string, string> = {
    'sıfır': '0', 'sifir': '0',
    'bir': '1',
    'iki': '2',
    'üç': '3', 'uc': '3',
    'dört': '4', 'dort': '4',
    'beş': '5', 'bes': '5',
    'altı': '6', 'alti': '6',
    'yedi': '7',
    'sekiz': '8',
    'dokuz': '9',
    'on': '10',
    'on bir': '11',
    'on iki': '12',
    'on üç': '13', 'on uc': '13',
    'on dört': '14', 'on dort': '14',
    'on beş': '15', 'on bes': '15',
    'on altı': '16', 'on alti': '16',
    'on yedi': '17',
    'on sekiz': '18',
    'on dokuz': '19',
    'yirmi': '20',
    'yirmi beş': '25', 'yirmi bes': '25',
    'otuz': '30',
    'kırk': '40', 'kirk': '40',
    'elli': '50',
  };

  // Önce iki kelimeli olanları kontrol et (örn: "on beş")
  for (const [key, val] of Object.entries(yaziliSayilar)) {
    if (key.includes(' ') && lower.includes(key)) return val;
  }
  // Sonra tek kelimeli
  for (const [key, val] of Object.entries(yaziliSayilar)) {
    if (!key.includes(' ') && lower.split(/\s+/).includes(key)) return val;
  }

  return null;
}

// ==================== ANA HOOK ====================

type Options = {
  /** Sesli asistan tamamlandığında çağrılır */
  onTamamlandi?: (cevaplar: SesliAsistanCevaplar) => void;
};

export function useSesliAsistan(options: Options = {}) {
  const [adim, setAdim] = useState<AsistanAdim>('kapali');
  const [cevaplar, setCevaplar] = useState<SesliAsistanCevaplar>(BAŞLANGIÇ_CEVAPLAR);
  const [dinleniyor, setDinleniyor] = useState(false);
  const [sonAlinanMetin, setSonAlinanMetin] = useState('');
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  // Mevcut adımı ref'te tut, çünkü Voice callback'leri stale closure problemi yaratır
  const adimRef = useRef<AsistanAdim>('kapali');
  const cevaplarRef = useRef<SesliAsistanCevaplar>(BAŞLANGIÇ_CEVAPLAR);

  useEffect(() => {
    adimRef.current = adim;
  }, [adim]);

  useEffect(() => {
    cevaplarRef.current = cevaplar;
  }, [cevaplar]);

  // ==================== Mikrofon Olayları ====================

  useEffect(() => {
    Voice.onSpeechResults = onSesAlindi;
    Voice.onSpeechError = onSesHatasi;
    Voice.onSpeechEnd = () => setDinleniyor(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Speech.stop();
    };
  }, []);

  // Mikrofon izni iste
  const izinIste = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Mikrofon İzni',
            message: 'Sesli asistan için mikrofon izni gerekiyor.',
            buttonPositive: 'İzin Ver',
            buttonNegative: 'İptal',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };

  // ==================== SES KONTROL ====================

  const konus = (metin: string, onBitti?: () => void) => {
    Speech.stop();
    Speech.speak(metin, {
      language: 'tr-TR',
      rate: 0.9,
      onDone: () => {
        if (onBitti) onBitti();
      },
      onStopped: () => {
        // Manuel durdurmada onBitti çağrılmaz
      },
      onError: () => {
        if (onBitti) onBitti();
      },
    });
  };

  const dinlemeyiBaslat = async () => {
    try {
      setSonAlinanMetin('');
      setHataMesaji(null);
      await Voice.start('tr-TR');
      setDinleniyor(true);
    } catch (e) {
      setHataMesaji('Mikrofon başlatılamadı.');
      setDinleniyor(false);
    }
  };

  const dinlemeyiBitir = async () => {
    try {
      await Voice.stop();
      setDinleniyor(false);
    } catch {}
  };

  // ==================== CEVAP İŞLEME ====================

  const onSesAlindi = (e: SpeechResultsEvent) => {
    const sonuc = e.value?.[0] ?? '';
    setSonAlinanMetin(sonuc);
    if (!sonuc) return;

    const mevcutAdim = adimRef.current;
    const mevcutCevaplar = cevaplarRef.current;

    // Adıma göre cevabı işle
    if (mevcutAdim === 'sigaraSoru') {
      const cevap = parseEvetHayir(sonuc);
      if (cevap) {
        const yeniCevaplar = { ...mevcutCevaplar, sigaraKullanimi: cevap };
        setCevaplar(yeniCevaplar);
        if (cevap === 'evet') {
          gecisYap('sigaraYil', yeniCevaplar);
        } else {
          gecisYap('alkolSoru', yeniCevaplar);
        }
      } else {
        anlasilmadi('sigaraSoru');
      }
    } else if (mevcutAdim === 'sigaraYil') {
      const sayi = parseSayi(sonuc);
      if (sayi) {
        const yeniCevaplar = { ...mevcutCevaplar, sigaraYil: sayi };
        setCevaplar(yeniCevaplar);
        gecisYap('sigaraPaket', yeniCevaplar);
      } else {
        anlasilmadi('sigaraYil');
      }
    } else if (mevcutAdim === 'sigaraPaket') {
      const sayi = parseSayi(sonuc);
      if (sayi) {
        const yeniCevaplar = { ...mevcutCevaplar, sigaraPaketGun: sayi };
        setCevaplar(yeniCevaplar);
        gecisYap('alkolSoru', yeniCevaplar);
      } else {
        anlasilmadi('sigaraPaket');
      }
    } else if (mevcutAdim === 'alkolSoru') {
      const cevap = parseEvetHayir(sonuc);
      if (cevap) {
        const yeniCevaplar = { ...mevcutCevaplar, alkol: cevap };
        setCevaplar(yeniCevaplar);
        gecisYap('ozet', yeniCevaplar);
      } else {
        anlasilmadi('alkolSoru');
      }
    }
  };

  const onSesHatasi = (e: SpeechErrorEvent) => {
    setDinleniyor(false);
    // Sessizlik veya tanıma hatası — mevcut adımı tekrar et
    const hataKodu = e.error?.code;
    if (hataKodu === '7' || hataKodu === '6') {
      // No match / Speech timeout
      anlasilmadi(adimRef.current);
    }
  };

  const anlasilmadi = (mevcutAdim: AsistanAdim) => {
    konus('Cevabınızı anlayamadım, lütfen tekrar söyleyin.', () => {
      // Aynı adımı tekrar et
      setTimeout(() => sorAdim(mevcutAdim, cevaplarRef.current), 500);
    });
  };

  // ==================== ADIM YÖNETİMİ ====================

  const sorAdim = (yeniAdim: AsistanAdim, mevcutCevaplar: SesliAsistanCevaplar) => {
    const sorular: Record<string, { metin: string; dinle: boolean }> = {
      sigaraSoru: {
        metin: 'Sigara kullanıyor musunuz? Evet veya hayır olarak cevaplayın.',
        dinle: true,
      },
      sigaraYil: {
        metin: 'Kaç yıldır sigara kullanıyorsunuz? Sayı olarak belirtin.',
        dinle: true,
      },
      sigaraPaket: {
        metin: 'Günde kaç paket içiyorsunuz? Sayı olarak belirtin.',
        dinle: true,
      },
      alkolSoru: {
        metin: 'Alkol kullanıyor musunuz? Evet veya hayır olarak cevaplayın.',
        dinle: true,
      },
    };

    if (yeniAdim === 'ozet') {
      ozetiOku(mevcutCevaplar);
      return;
    }

    const soru = sorular[yeniAdim];
    if (!soru) return;

    konus(soru.metin, () => {
      if (soru.dinle) {
        dinlemeyiBaslat();
      }
    });
  };

  const gecisYap = (yeniAdim: AsistanAdim, yeniCevaplar: SesliAsistanCevaplar) => {
    setAdim(yeniAdim);
    adimRef.current = yeniAdim;
    setTimeout(() => sorAdim(yeniAdim, yeniCevaplar), 600);
  };

  const ozetiOku = (cv: SesliAsistanCevaplar) => {
    let ozet = 'Verdiğiniz bilgiler şöyle: ';

    if (cv.sigaraKullanimi === 'evet') {
      ozet += `Sigara: ${cv.sigaraYil} yıldır, günde ${cv.sigaraPaketGun} paket. `;
    } else {
      ozet += 'Sigara kullanmıyorsunuz. ';
    }

    if (cv.alkol === 'evet') {
      ozet += 'Alkol kullanıyorsunuz. ';
    } else {
      ozet += 'Alkol kullanmıyorsunuz. ';
    }

    ozet += 'Onaylamak için aşağıdaki devam et butonuna basınız.';

    konus(ozet, () => {
      setAdim('tamam');
      adimRef.current = 'tamam';
      if (options.onTamamlandi) {
        options.onTamamlandi(cv);
      }
    });
  };

  // ==================== DIŞA AÇIK API ====================

  /** Ekran açılır açılmaz çağrılır — karşılama mesajını söyler */
  const karsilamayiBaslat = useCallback(() => {
    if (adimRef.current !== 'kapali') return;
    setAdim('karsilama');
    adimRef.current = 'karsilama';
    konus(
      'Sağlık bilgileriniz otomatik olarak doldurulmuştur. ' +
      'Sesli asistan kullanmak için aşağıdaki mikrofon butonuna basın.'
    );
  }, []);

  /** Hasta mikrofon butonuna bastı — soruları sormaya başla */
  const asistaniBaslat = useCallback(async () => {
    const izinli = await izinIste();
    if (!izinli) {
      setHataMesaji(
        'Mikrofon izni verilmediği için sesli asistan kullanılamaz. ' +
        'Lütfen formu manuel olarak doldurun.'
      );
      return;
    }
    setCevaplar(BAŞLANGIÇ_CEVAPLAR);
    cevaplarRef.current = BAŞLANGIÇ_CEVAPLAR;
    setAdim('aktifBekle');
    adimRef.current = 'aktifBekle';
    setTimeout(() => gecisYap('sigaraSoru', BAŞLANGIÇ_CEVAPLAR), 300);
  }, []);

  /** Asistanı iptal et */
  const asistaniDurdur = useCallback(() => {
    Speech.stop();
    Voice.stop();
    setDinleniyor(false);
    setAdim('kapali');
    adimRef.current = 'kapali';
  }, []);

  return {
    adim,
    cevaplar,
    dinleniyor,
    sonAlinanMetin,
    hataMesaji,
    karsilamayiBaslat,
    asistaniBaslat,
    asistaniDurdur,
  };
}