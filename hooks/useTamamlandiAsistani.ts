import * as Speech from 'expo-speech';
import { useEffect } from 'react';

type Options = {
  aktif: boolean;
  tr: boolean;
};

export function useTamamlandiAsistani({ aktif, tr }: Options) {
  useEffect(() => {
    if (!aktif) return;

    const timer = setTimeout(() => {
      Speech.stop();

      Speech.speak(
        tr
          ? 'İmza başarıyla kaydedildi. Dijital onam kaydı oluşturuldu. Teşekkür ederiz, iyi günler dileriz.'
          : 'Signature has been saved successfully. The digital consent record has been created. Thank you and have a nice day.',
        {
          language: tr ? 'tr-TR' : 'en-US',
          rate: 0.88,
          pitch: 1.0,
        }
      );
    }, 600);

    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [aktif, tr]);
}