// =============================================================================
// MOCK HASTA VERİTABANI
// E-Devlet / E-Nabız entegrasyonu simülasyonu
//
// AKADEMİK NOT (tez için):
// Bu dosya, gerçek bir e-Devlet veya e-Nabız API entegrasyonunun yerine
// kullanılan bir simülasyon katmanıdır. Gerçek entegrasyon için Sağlık
// Bakanlığı API erişim izinleri ve KVKK kapsamında veri paylaşım protokolleri
// gerekmektedir; bu süreç akademik bir tez kapsamı dışındadır.
//
// Çalışmada tek bir hasta profili üzerinden entegrasyon yetisi simüle
// edilmektedir. İleride yapılacak çalışmalarda bu mock katman gerçek API
// çağrıları ile değiştirilebilir; uygulamanın geri kalan kodu bu değişiklikten
// etkilenmeyecek şekilde tasarlanmıştır.
// =============================================================================

export type HastaKaydi = {
  // Kimlik bilgileri (e-Devlet'ten gelir)
  tcKimlik: string;
  adSoyad: string;
  dogumTarihi: string;
  cinsiyet: 'kadin' | 'erkek';

  // Sağlık bilgileri (e-Nabız'dan gelir)
  kilo: string;
  boy: string;
  alerji: string;
  kullandigiIlaclar: string;
  bilinenHastaliklar: string;
};

// Demo amaçlı tek hasta kaydı.
// Klinik olarak anestezi açısından anlamlı bir profil seçilmiştir:
// - 53 yaş, kadın hasta (tipik ASA II-III adayı)
// - Hipertansiyon + hipotiroidi (preanestezik değerlendirmede önemli)
// - Penisilin alerjisi (perioperatif antibiyotik seçimini etkiler)
// - Concor (beta-bloker, ameliyat sabahı kararı önem taşır)
// - Euthyrox (TSH değerleri kontrol edilmeli)
const DEMO_HASTA: HastaKaydi = {
  tcKimlik: '12345678901',
  adSoyad: 'Ayşe Demir',
  dogumTarihi: '22/07/1972',
  cinsiyet: 'kadin',
  kilo: '72',
  boy: '165',
  alerji: 'Penisilin',
  kullandigiIlaclar: 'Concor 5mg (sabah 1 tablet), Euthyrox 50mcg (sabah aç karna)',
  bilinenHastaliklar: 'Hipertansiyon, Hipotiroidi',
};

/**
 * E-Devlet/E-Nabız API çağrısını simüle eder.
 * Gerçek bir API'de bu fonksiyon HTTP isteği atar ve token döner.
 *
 * @returns Her zaman demo hasta kaydını döner (simülasyon olduğu için).
 */
export async function eDevletGirisYap(): Promise<HastaKaydi> {
  // Gerçek API çağrısını simüle etmek için kısa bir gecikme
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return DEMO_HASTA;
}