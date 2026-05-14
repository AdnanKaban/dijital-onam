// =============================================================================
// SESLI YONLENDIRME HOOK
// Ortak STT/TTS motoru
// =============================================================================

import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type SesliKomut = {
  ifadeler: string[];
  callback: () => void;
};

type Options = {
  baslangicMetni: string;
  komutlar: SesliKomut[];
  aktif?: boolean;
};

// -----------------------------------------------------------------------------
// YARDIMCILAR
// -----------------------------------------------------------------------------

function temizleMetin(metin: string) {
  return metin
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function kelimeOlarakVarMi(metin: string, kelime: string) {
  const regex = new RegExp(`(^|\\s)${kelime}(\\s|$)`, 'i');
  return regex.test(metin);
}

function komutEslesiyor(metin: string, ifadeler: string[]) {
  const temiz = temizleMetin(metin);

  return ifadeler.some((ifade) => {
    const temizIfade = temizleMetin(ifade);

    // "oku", "okumadan" içinde yakalanmasın
    if (temizIfade === 'oku') {
      return kelimeOlarakVarMi(temiz, 'oku');
    }

    // "dinle", "dinledim" içinde yanlış yakalanmasın
    if (temizIfade === 'dinle') {
      return kelimeOlarakVarMi(temiz, 'dinle');
    }

    return temiz.includes(temizIfade);
  });
}

// -----------------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------------

export function useSesliYonlendirme({
  baslangicMetni,
  komutlar,
  aktif = true,
}: Options) {
  const [dinleniyor, setDinleniyor] = useState(false);
  const [sonAlinanMetin, setSonAlinanMetin] = useState('');
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  const aktifRef = useRef(aktif);
  const komutlarRef = useRef(komutlar);

  const dinlemeyiKesIstendi = useRef(false);
  const islemYapildiRef = useRef(false);

  useEffect(() => {
    aktifRef.current = aktif;
  }, [aktif]);

  useEffect(() => {
    komutlarRef.current = komutlar;
  }, [komutlar]);

  // ---------------------------------------------------------------------------
  // TTS
  // ---------------------------------------------------------------------------

  const konus = useCallback((metin: string, sonraCagir?: () => void) => {
    Speech.stop();

    setTimeout(() => {
      Speech.speak(metin, {
        language: 'tr-TR',
        rate: 0.9,
        pitch: 1.0,

        onDone: () => {
          if (sonraCagir) {
            setTimeout(sonraCagir, 300);
          }
        },

        onError: () => {
          if (sonraCagir) {
            setTimeout(sonraCagir, 300);
          }
        },
      });
    }, 100);
  }, []);

  // ---------------------------------------------------------------------------
  // STT BASLAT
  // ---------------------------------------------------------------------------

  const dinlemeyiBaslat = useCallback(async () => {
    if (!aktifRef.current) return;

    try {
      dinlemeyiKesIstendi.current = false;

      const izin = await ExpoSpeechRecognitionModule.getPermissionsAsync();

      if (!izin.granted) {
        const yeniIzin =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();

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
          'oku',
          'dinle',
          'bilgilendirme metnini oku',
          'bilgilendirme metnini dinle',

          'okumadan onaylıyorum',
          'okumadan onayliyorum',
          'bilgilendirme metnini okumadan onaylıyorum',
          'bilgilendirme metnini okumadan onayliyorum',
          'okumadan kabul ediyorum',

          'okumadan reddediyorum',
          'okumadan red ediyorum',
          'bilgilendirme metnini okumadan reddediyorum',
          'bilgilendirme metnini okumadan red ediyorum',
          'okumadan kabul etmiyorum',
          'okumadan istemiyorum',

          'bilgilendirildim ve onaylıyorum',
          'bilgilendirildim ve onayliyorum',
          'bilgilendirildim ve reddediyorum',
          'bilgilendirildim ve red ediyorum',

          'okudum',
          'dinledim',
          'anladım',
          'anladim',
          'tekrar',

          'devam',
          'kaydet',
          'imzayı kaydet',
          'imzayi kaydet',
          'imzayı tamamladım',
          'imzayi tamamladim',

          'eminim',
          'vazgeç',
          'vazgec',
          'iptal',
          'geri',
        ],
      });
    } catch (e: any) {
      console.error('[useSesliYonlendirme] dinlemeyiBaslat:', e);

      setHataMesaji(
        'Mikrofon başlatılamadı: ' + (e?.message ?? 'bilinmiyor')
      );
    }
  }, []);

  // ---------------------------------------------------------------------------
  // STT DURDUR
  // ---------------------------------------------------------------------------

  const dinlemeyiKes = useCallback(() => {
    dinlemeyiKesIstendi.current = true;

    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}

    setDinleniyor(false);
  }, []);

  // ---------------------------------------------------------------------------
  // KOMUT ISLE
  // ---------------------------------------------------------------------------

  const komutuIsle = useCallback(
    (metin: string) => {
      if (!aktifRef.current) {
        return;
      }

      if (islemYapildiRef.current) {
        return;
      }

      for (const komut of komutlarRef.current) {
        if (komutEslesiyor(metin, komut.ifadeler)) {
          islemYapildiRef.current = true;

          dinlemeyiKes();

          setTimeout(() => {
            komut.callback();
          }, 200);

          return;
        }
      }

      konus('Komut anlaşılamadı. Lütfen tekrar deneyin.', () => {
        if (!dinlemeyiKesIstendi.current && aktifRef.current) {
          dinlemeyiBaslat();
        }
      });
    },
    [konus, dinlemeyiBaslat, dinlemeyiKes]
  );

  // ---------------------------------------------------------------------------
  // LISTENERLAR
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const startSub = ExpoSpeechRecognitionModule.addListener('start', () => {
      if (!aktifRef.current) return;

      setDinleniyor(true);
      setHataMesaji(null);
    });

    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
      setDinleniyor(false);
    });

    const errorSub = ExpoSpeechRecognitionModule.addListener(
      'error',
      (event: any) => {
        if (!aktifRef.current) {
          return;
        }

        console.warn('[useSesliYonlendirme] STT error:', event);

        setDinleniyor(false);

        if (
          event.error === 'no-speech' ||
          event.error === 'speech-timeout'
        ) {
          setTimeout(() => {
            if (!dinlemeyiKesIstendi.current && aktifRef.current) {
              konus('Sizi duyamadım, tekrar söyler misiniz?', () =>
                dinlemeyiBaslat()
              );
            }
          }, 500);
        } else {
          setHataMesaji(
            'Ses tanıma hatası: ' + (event.message ?? event.error)
          );
        }
      }
    );

    const resultSub = ExpoSpeechRecognitionModule.addListener(
      'result',
      (event: ExpoSpeechRecognitionResultEvent) => {
        if (!aktifRef.current) {
          return;
        }

        const sonuc = event.results[0]?.transcript ?? '';

        setSonAlinanMetin(sonuc);

        // Interim sonuçlar işlenirse yanlış navigation tetiklenebilir.
        if (!event.isFinal) return;

        console.log('[useSesliYonlendirme] Final:', sonuc);

        komutuIsle(sonuc);
      }
    );

    return () => {
      startSub.remove();
      endSub.remove();
      errorSub.remove();
      resultSub.remove();
    };
  }, [komutuIsle, konus, dinlemeyiBaslat]);

  // ---------------------------------------------------------------------------
  // BASLAT
  // ---------------------------------------------------------------------------

  const baslat = useCallback(() => {
    if (!aktifRef.current) return;

    islemYapildiRef.current = false;

    konus(baslangicMetni, () => {
      dinlemeyiBaslat();
    });
  }, [baslangicMetni, konus, dinlemeyiBaslat]);

  // ---------------------------------------------------------------------------
  // DURDUR
  // ---------------------------------------------------------------------------

  const durdur = useCallback(() => {
    Speech.stop();

    dinlemeyiKes();

    setSonAlinanMetin('');
    setHataMesaji(null);

    islemYapildiRef.current = false;
  }, [dinlemeyiKes]);

  // ---------------------------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    };
  }, []);

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  return {
    dinleniyor,
    sonAlinanMetin,
    hataMesaji,

    baslat,
    durdur,

    konus,
    dinlemeyiBaslat,
    dinlemeyiKes,
  };
}