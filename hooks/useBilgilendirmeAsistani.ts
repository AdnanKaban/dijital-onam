import { useMemo } from 'react';
import { useSesliYonlendirme } from './useSesliYonlendirme';

type Options = {
  aktif: boolean;
  tr: boolean;
  onayBekleniyor: boolean;
  kararBekleniyor: boolean;

  onBolumOnayla: () => void;
  onBolumTekrar: () => void;
  onKararOnay: () => void;
  onKararRed: () => void;
};

export function useBilgilendirmeAsistani({
  aktif,
  tr,
  onayBekleniyor,
  kararBekleniyor,
  onBolumOnayla,
  onBolumTekrar,
  onKararOnay,
  onKararRed,
}: Options) {
  const baslangicMetni = kararBekleniyor
    ? tr
      ? 'Tüm bilgilendirme bölümleri tamamlandı. Onay vermek için bilgilendirildim ve onaylıyorum diyebilirsiniz. Reddetmek için bilgilendirildim ve reddediyorum diyebilirsiniz.'
      : 'All information sections are completed. Say I am informed and I consent, or I am informed and I refuse.'
    : onayBekleniyor
    ? tr
      ? 'Bu bölümü okuduğunuzu veya dinlediğinizi onaylıyor musunuz? Onaylamak için okudum diyebilirsiniz. Tekrar dinlemek için tekrar diyebilirsiniz.'
      : 'Do you confirm that you have read or listened to this section? Say read or repeat.'
    : '';

  const komutlar = useMemo(() => {
    if (kararBekleniyor) {
      return [
        {
          ifadeler: [
            'bilgilendirildim ve onaylıyorum',
            'bilgilendirildim ve onayliyorum',
          ],
          callback: onKararOnay,
        },
        {
          ifadeler: [
            'bilgilendirildim ve reddediyorum',
            'bilgilendirildim ve red ediyorum',
          ],
          callback: onKararRed,
        },
      ];
    }

    return [
      {
        ifadeler: [
          'okudum',
          'dinledim',
          'anladım',
          'anladim',
          'tamamladım',
          'tamamladim',
        ],
        callback: onBolumOnayla,
      },
      {
        ifadeler: [
          'tekrar',
          'tekrar dinle',
          'yeniden oku',
          'yeniden dinle',
          'anlamadım',
          'anlamadim',
        ],
        callback: onBolumTekrar,
      },
    ];
  }, [
    kararBekleniyor,
    onBolumOnayla,
    onBolumTekrar,
    onKararOnay,
    onKararRed,
  ]);

  const asistan = useSesliYonlendirme({
    baslangicMetni,
    komutlar,
    aktif: aktif && Boolean(baslangicMetni),
  });

  return asistan;
}