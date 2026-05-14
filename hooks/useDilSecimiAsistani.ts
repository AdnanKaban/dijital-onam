import { useMemo } from 'react';
import { useSesliYonlendirme } from './useSesliYonlendirme';

type Options = {
  aktif: boolean;
  onTurkce: () => void;
  onIngilizce: () => void;
  onDevam: () => void;
};

export function useDilSecimiAsistani({
  aktif,
  onTurkce,
  onIngilizce,
  onDevam,
}: Options) {
  const komutlar = useMemo(
    () => [
      {
        ifadeler: ['türkçe', 'turkce', 'türkçe devam et', 'turkce devam et'],
        callback: onTurkce,
      },
      {
        ifadeler: ['ingilizce', 'english', 'english continue', 'ingilizce devam et'],
        callback: onIngilizce,
      },
      {
        ifadeler: ['devam', 'devam et', 'continue', 'ilerle'],
        callback: onDevam,
      },
    ],
    [onTurkce, onIngilizce, onDevam]
  );

  return useSesliYonlendirme({
    baslangicMetni:
      'Dil seçimi ekranındasınız. Türkçe devam etmek için Türkçe diyebilirsiniz. İngilizce devam etmek için İngilizce diyebilirsiniz.',
    komutlar,
    aktif,
  });
}