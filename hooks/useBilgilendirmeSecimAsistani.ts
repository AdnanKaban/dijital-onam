import { useMemo } from 'react';
import { useSesliYonlendirme } from './useSesliYonlendirme';

type Options = {
  aktif: boolean;
  modalAktif: boolean;
  tr: boolean;

  onOku: () => void;
  onOkumadanOnay: () => void;
  onOkumadanRed: () => void;

  onModalEminim: () => void;
  onModalVazgec: () => void;
};

export function useBilgilendirmeSecimAsistani({
  aktif,
  modalAktif,
  tr,
  onOku,
  onOkumadanOnay,
  onOkumadanRed,
  onModalEminim,
  onModalVazgec,
}: Options) {
  const anaBaslangicMetni = tr
    ? 'Anestezi bilgilendirme ekranındasınız. Bilgilendirme metnini okumak veya dinlemek için oku diyebilirsiniz. Bilgilendirme metnini okumadan onay vermek için okumadan onaylıyorum diyebilirsiniz. Bilgilendirme metnini okumadan reddetmek için okumadan reddediyorum diyebilirsiniz.'
    : 'You are on the anesthesia information screen. You may read the text, consent without reading, or refuse without reading.';

  const anaKomutlar = useMemo(
    () => [
      {
        ifadeler: [
          'okumadan onaylıyorum',
          'okumadan onayliyorum',
          'bilgilendirme metnini okumadan onaylıyorum',
          'bilgilendirme metnini okumadan onayliyorum',
          'okumadan kabul ediyorum',
        ],
        callback: onOkumadanOnay,
      },
      {
        ifadeler: [
          'okumadan reddediyorum',
          'okumadan red ediyorum',
          'bilgilendirme metnini okumadan reddediyorum',
          'bilgilendirme metnini okumadan red ediyorum',
          'okumadan kabul etmiyorum',
          'okumadan istemiyorum',
        ],
        callback: onOkumadanRed,
      },
      {
        ifadeler: [
          'oku',
          'dinle',
          'metni oku',
          'bilgilendirme metnini oku',
          'bilgilendirme metnini dinle',
        ],
        callback: onOku,
      },
    ],
    [onOku, onOkumadanOnay, onOkumadanRed]
  );

  const modalBaslangicMetni = tr
    ? 'Eminseniz eminim diyebilirsiniz. Vazgeçmek için vazgeç diyebilirsiniz.'
    : 'Say sure to continue, or cancel to go back.';

  const modalKomutlar = useMemo(
    () => [
      {
        ifadeler: [
          'eminim',
          'devam',
          'onaylıyorum',
          'onayliyorum',
          'evet',
          'kabul ediyorum',
        ],
        callback: onModalEminim,
      },
      {
        ifadeler: [
          'vazgeç',
          'vazgec',
          'iptal',
          'geri',
          'hayır',
          'hayir',
        ],
        callback: onModalVazgec,
      },
    ],
    [onModalEminim, onModalVazgec]
  );

  const anaAsistan = useSesliYonlendirme({
    baslangicMetni: anaBaslangicMetni,
    komutlar: anaKomutlar,
    aktif: aktif && !modalAktif,
  });

  const modalAsistan = useSesliYonlendirme({
    baslangicMetni: modalBaslangicMetni,
    komutlar: modalKomutlar,
    aktif: aktif && modalAktif,
  });

  return {
    anaAsistan,
    modalAsistan,
  };
}