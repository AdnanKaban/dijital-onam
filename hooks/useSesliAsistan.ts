// =============================================================================
// SESLI ASISTAN HOOK
// expo-speech-recognition + expo-speech ile tam çalışır implementasyon
// =============================================================================

import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AsistanAdim =
  | 'kapali' | 'karsilama' | 'aktifBekle'
  | 'sigaraSoru' | 'sigaraYil' | 'sigaraPaket'
  | 'alkolSoru' | 'ozet' | 'tamam';

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

type Options = {
  onTamamlandi?: (cevaplar: SesliAsistanCevaplar) => void;
};

// -----------------------------------------------------------------------------
// Yardımcılar
// -----------------------------------------------------------------------------

function evetMiHayirMi(metin: string): 'evet' | 'hayir' | null {
  const m = metin.toLowerCase().trim();
  if (/\b(evet|tabi|tabii|elbette|olur|var|kullanıyorum|kullaniyorum|kullanırım|ediyorum|içiyorum|iciyorum)\b/.test(m)) {
    return 'evet';
  }
  if (/\b(hayır|hayir|yok|kullanmıyorum|kullanmiyorum|içmiyorum|icmiyorum|asla|hiç|hic)\b/.test(m)) {
    return 'hayir';
  }
  return null;
}

function sayiCikar(metin: string): string | null {
  const m = metin.toLowerCase().trim();
  const rakam = m.match(/\d+/);
  if (rakam) return rakam[0];

  const sayilar: Record<string, number> = {
    'sıfır': 0, 'sifir': 0,
    'bir': 1, 'iki': 2, 'üç': 3, 'uc': 3, 'uç': 3,
    'dört': 4, 'dort': 4, 'beş': 5, 'bes': 5, 'altı': 6, 'alti': 6,
    'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10,
    'onbir': 11, 'oniki': 12, 'onüç': 13, 'onuc': 13,
    'ondört': 14, 'ondort': 14, 'onbeş': 15, 'onbes': 15,
    'yirmi': 20, 'otuz': 30, 'kırk': 40, 'kirk': 40,
    'elli': 50, 'altmış': 60, 'altmis': 60, 'yetmiş': 70, 'yetmis': 70,
    'seksen': 80, 'doksan': 90, 'yüz': 100, 'yuz': 100,
  };
  for (const [kelime, deger] of Object.entries(sayilar)) {
    if (m.includes(kelime)) return String(deger);
  }
  return null;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useSesliAsistan(options: Options = {}) {
  const [adim, setAdim] = useState<AsistanAdim>('kapali');
  const [cevaplar, setCevaplar] = useState<SesliAsistanCevaplar>(BAŞLANGIÇ_CEVAPLAR);
  const [dinleniyor, setDinleniyor] = useState(false);
  const [sonAlinanMetin, setSonAlinanMetin] = useState('');
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  const adimRef = useRef<AsistanAdim>('kapali');
  const cevaplarRef = useRef<SesliAsistanCevaplar>(BAŞLANGIÇ_CEVAPLAR);
  const dinlemeyiKesIstendi = useRef(false);
  const tekrarSayisiRef = useRef(0);

  useEffect(() => { adimRef.current = adim; }, [adim]);
  useEffect(() => { cevaplarRef.current = cevaplar; }, [cevaplar]);

  const konus = useCallback((metin: string, sonraCagir?: () => void): void => {
    Speech.stop();
    setTimeout(() => {
      Speech.speak(metin, {
        language: 'tr-TR',
        rate: 0.95,
        pitch: 1.0,
        onDone: () => { if (sonraCagir) setTimeout(sonraCagir, 300); },
        onError: () => { if (sonraCagir) setTimeout(sonraCagir, 300); },
      });
    }, 100);
  }, []);

  const dinlemeyiBaslat = useCallback(async () => {
    try {
      dinlemeyiKesIstendi.current = false;
      const izin = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      if (!izin.granted) {
        const yeniIzin = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!yeniIzin.granted) {
          setHataMesaji('Mikrofon izni gerekli');
          return;
        }
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'tr-TR',
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: [
          'evet', 'hayır', 'bir', 'iki', 'üç', 'dört', 'beş',
          'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'onbir', 'oniki',
          'yirmi', 'otuz',
        ],
      });
    } catch (e: any) {
      console.error('[useSesliAsistan] dinlemeyiBaslat hatası:', e);
      setHataMesaji('Mikrofon başlatılamadı: ' + (e?.message ?? 'bilinmiyor'));
    }
  }, []);

  const dinlemeyiKes = useCallback(() => {
    dinlemeyiKesIstendi.current = true;
    try { ExpoSpeechRecognitionModule.stop(); } catch {}
    setDinleniyor(false);
  }, []);

  useEffect(() => {
    const startSub = ExpoSpeechRecognitionModule.addListener('start', () => {
      setDinleniyor(true);
      setHataMesaji(null);
    });

    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
      setDinleniyor(false);
    });

    const errorSub = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
      console.warn('[useSesliAsistan] STT error:', event);
      setDinleniyor(false);
      if (event.error === 'no-speech' || event.error === 'speech-timeout') {
        if (adimRef.current !== 'kapali' && adimRef.current !== 'tamam' && adimRef.current !== 'ozet') {
          setTimeout(() => {
            if (!dinlemeyiKesIstendi.current) {
              konus('Sizi duyamadım, tekrar söyler misiniz?', () => dinlemeyiBaslat());
            }
          }, 500);
        }
      } else {
        setHataMesaji('Ses tanıma hatası: ' + (event.message ?? event.error));
      }
    });

    const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event: ExpoSpeechRecognitionResultEvent) => {
      const sonuc = event.results[0]?.transcript ?? '';
      setSonAlinanMetin(sonuc);
      if (!event.isFinal) return;
      const su_anki_adim = adimRef.current;
      console.log(`[useSesliAsistan] Final: "${sonuc}" adim=${su_anki_adim}`);
      islemeCevap(sonuc, su_anki_adim);
    });

    return () => {
      startSub.remove();
      endSub.remove();
      errorSub.remove();
      resultSub.remove();
    };
  }, []);

  const islemeCevap = useCallback((metin: string, su_anki_adim: AsistanAdim) => {
    if (su_anki_adim === 'sigaraSoru') {
      const cevap = evetMiHayirMi(metin);
      if (cevap === null) {
        tekrarSayisiRef.current++;
        if (tekrarSayisiRef.current >= 3) {
          setHataMesaji('Cevap anlaşılamadı. Lütfen formu manuel doldurun.');
          setAdim('tamam');
          tekrarSayisiRef.current = 0;
          return;
        }
        konus('Lütfen evet veya hayır olarak cevaplayın.', () => {
          ExpoSpeechRecognitionModule.start({
            lang: 'tr-TR', interimResults: true, continuous: false,
            contextualStrings: ['evet', 'hayır'],
          });
        });
        return;
      }
      tekrarSayisiRef.current = 0;
      const yeniCevaplar = { ...cevaplarRef.current, sigaraKullanimi: cevap };
      setCevaplar(yeniCevaplar);
      if (cevap === 'evet') {
        setAdim('sigaraYil');
        konus('Kaç yıldır sigara kullanıyorsunuz?', () => dinlemeyiBaslat());
      } else {
        setAdim('alkolSoru');
        konus('Alkol kullanıyor musunuz?', () => dinlemeyiBaslat());
      }
      return;
    }

    if (su_anki_adim === 'sigaraYil') {
      const sayi = sayiCikar(metin);
      if (sayi === null) {
        tekrarSayisiRef.current++;
        if (tekrarSayisiRef.current >= 3) {
          setAdim('alkolSoru');
          konus('Sayı anlaşılamadı, devam ediyoruz. Alkol kullanıyor musunuz?', () => dinlemeyiBaslat());
          tekrarSayisiRef.current = 0;
          return;
        }
        konus('Lütfen bir sayı söyleyin. Örneğin: on yıldır.', () => {
          ExpoSpeechRecognitionModule.start({ lang: 'tr-TR', interimResults: true, continuous: false });
        });
        return;
      }
      tekrarSayisiRef.current = 0;
      const yeniCevaplar = { ...cevaplarRef.current, sigaraYil: sayi };
      setCevaplar(yeniCevaplar);
      setAdim('sigaraPaket');
      konus('Günde kaç paket sigara içiyorsunuz?', () => dinlemeyiBaslat());
      return;
    }

    if (su_anki_adim === 'sigaraPaket') {
      const sayi = sayiCikar(metin);
      if (sayi === null) {
        tekrarSayisiRef.current++;
        if (tekrarSayisiRef.current >= 3) {
          setAdim('alkolSoru');
          konus('Sayı anlaşılamadı, devam ediyoruz. Alkol kullanıyor musunuz?', () => dinlemeyiBaslat());
          tekrarSayisiRef.current = 0;
          return;
        }
        konus('Lütfen bir sayı söyleyin. Örneğin: bir paket.', () => {
          ExpoSpeechRecognitionModule.start({ lang: 'tr-TR', interimResults: true, continuous: false });
        });
        return;
      }
      tekrarSayisiRef.current = 0;
      const yeniCevaplar = { ...cevaplarRef.current, sigaraPaketGun: sayi };
      setCevaplar(yeniCevaplar);
      setAdim('alkolSoru');
      konus('Alkol kullanıyor musunuz?', () => dinlemeyiBaslat());
      return;
    }

    if (su_anki_adim === 'alkolSoru') {
      const cevap = evetMiHayirMi(metin);
      if (cevap === null) {
        tekrarSayisiRef.current++;
        if (tekrarSayisiRef.current >= 3) {
          setAdim('ozet');
          ozetOku(cevaplarRef.current);
          tekrarSayisiRef.current = 0;
          return;
        }
        konus('Lütfen evet veya hayır olarak cevaplayın.', () => {
          ExpoSpeechRecognitionModule.start({
            lang: 'tr-TR', interimResults: true, continuous: false,
            contextualStrings: ['evet', 'hayır'],
          });
        });
        return;
      }
      tekrarSayisiRef.current = 0;
      const yeniCevaplar = { ...cevaplarRef.current, alkol: cevap };
      setCevaplar(yeniCevaplar);
      setAdim('ozet');
      ozetOku(yeniCevaplar);
      return;
    }
  }, [konus, dinlemeyiBaslat]);

  // ---------------------------------------------------------------------------
  // ÖZET OKUMA — GÜNCELLEME: Erişilebilirlik için daha açıklayıcı yönlendirme
  // ---------------------------------------------------------------------------
  const ozetOku = useCallback((cv: SesliAsistanCevaplar) => {
    const sigaraDurum = cv.sigaraKullanimi === 'evet'
      ? `Sigara kullanıyorsunuz: ${cv.sigaraYil} yıldır, günde ${cv.sigaraPaketGun} paket. `
      : 'Sigara kullanmıyorsunuz. ';
    const alkolDurum = cv.alkol === 'evet' ? 'Alkol kullanıyorsunuz. ' : 'Alkol kullanmıyorsunuz. ';

    // Önce özet, sonra net yönlendirme — okuma güçlüğü olan kullanıcı için
    const ozet =
      `Verdiğiniz bilgiler şöyle: ${sigaraDurum}${alkolDurum}` +
      `Şimdi ekranın en altındaki yanıp sönen kırmızı devam et butonuna basın. ` +
      `Tekrar ediyorum: ekranın en altındaki kırmızı butona basın.`;

    konus(ozet, () => {
      setAdim('tamam');
      options.onTamamlandi?.(cv);
    });
  }, [konus, options]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const karsilamayiBaslat = useCallback(() => {
    setAdim('karsilama');
    konus(
      'Sağlık bilgileriniz otomatik olarak dolduruldu. ' +
      'Alışkanlıklarınız hakkında sorularıma cevap vermek için sağ alttaki mikrofon butonuna basın.'
    );
  }, [konus]);

  const asistaniBaslat = useCallback(() => {
    setCevaplar(BAŞLANGIÇ_CEVAPLAR);
    cevaplarRef.current = BAŞLANGIÇ_CEVAPLAR;
    tekrarSayisiRef.current = 0;
    setHataMesaji(null);
    setSonAlinanMetin('');
    setAdim('sigaraSoru');
    konus('Sigara kullanıyor musunuz? Evet veya hayır olarak cevaplayın.', () => {
      dinlemeyiBaslat();
    });
  }, [konus, dinlemeyiBaslat]);

  const asistaniDurdur = useCallback(() => {
    Speech.stop();
    dinlemeyiKes();
    setAdim('kapali');
    setSonAlinanMetin('');
    setHataMesaji(null);
    tekrarSayisiRef.current = 0;
  }, [dinlemeyiKes]);

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    };
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