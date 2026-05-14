import { useMemo } from 'react';
import { useSesliYonlendirme } from './useSesliYonlendirme';

type Options = {
  aktif: boolean;
  onGiris: () => void;
};

export function useGirisAsistani({ aktif, onGiris }: Options) {
  const komutlar = useMemo(
    () => [
      {
        ifadeler: [
          'giriş',
          'giris',
          'başla',
          'basla',
          'devam',
          'e devlet',
          'e devlet ile giriş',
          'e devlet ile giris',
          'e devlet ile giriş yap',
          'e devlet ile giris yap',
        ],
        callback: onGiris,
      },
    ],
    [onGiris]
  );

  return useSesliYonlendirme({
    baslangicMetni:
      'Anestezi dijital onam sistemine hoş geldiniz. e-Devlet ile giriş yapmak için giriş diyebilir veya ekrandaki butona basabilirsiniz.',
    komutlar,
    aktif,
  });
}