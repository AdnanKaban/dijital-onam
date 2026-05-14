import { useMemo } from 'react';
import { useSesliYonlendirme } from './useSesliYonlendirme';

type Options = {
  aktif: boolean;
  tr: boolean;
  imzaVar: boolean;

  onKaydet: () => void;
  onImzaYok: () => void;
};

export function useImzaAsistani({
  aktif,
  tr,
  imzaVar,
  onKaydet,
  onImzaYok,
}: Options) {
  const baslangicMetni = tr
    ? 'İmza ekranındasınız. Ortadaki beyaz alana imzanızı atabilirsiniz. İmzanızı tamamladıktan sonra devam, kaydet veya imzayı tamamladım diyebilirsiniz.'
    : 'You are on the signature screen. Sign in the white area. After signing, say continue or save.';

  const komutlar = useMemo(
    () => [
      {
        ifadeler: [
          'devam',
          'kaydet',
          'imzayı tamamladım',
          'imzayi tamamladim',
          'tamamladım',
          'tamamladim',
          'bitir',
        ],
        callback: () => {
          if (imzaVar) {
            onKaydet();
          } else {
            onImzaYok();
          }
        },
      },
    ],
    [imzaVar, onKaydet, onImzaYok]
  );

  const asistan = useSesliYonlendirme({
    baslangicMetni,
    komutlar,
    aktif,
  });

  return asistan;
}