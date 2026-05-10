// =============================================================================
// BİLGİLENDİRME METİNLERİ (İKİ DİLLİ)
// Anestezi Hasta Bilgilendirme ve Rıza Belgesi (HB.RB.01)
//
// AKADEMİK NOT (tez için):
// Türkçe metin, K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi'nin onaylı
// HB.RB.01 belgesinden alınmıştır.
//
// İngilizce çeviri bu çalışma kapsamında yapılmış olup, klinik kullanım için
// tıbbi terminoloji açısından uzman onayı alınmamıştır. İngilizce metin yalnızca
// arayüz tasarımı amaçlıdır. Gerçek klinik kullanımda hastanenin onaylı
// İngilizce dil versiyonu kullanılmalıdır.
// =============================================================================

export type LocalizedText = {
  tr: string;
  en: string;
};

export type Section = {
  id: string;
  title: LocalizedText;
  paragraphs: LocalizedText[];
};

export const SECTIONS: Section[] = [
  {
    id: 'giris',
    title: {
      tr: 'Sayın Hastamız',
      en: 'Dear Patient',
    },
    paragraphs: [
      {
        tr: 'Uygulanacak olan cerrahi işlem sırasında yapılanları hissetmemeniz ve hatırlamamanız amacıyla size, genel anestezi uygulanacaktır. Bu uygulamalar bilimsel ve etik olarak bütün dünyada kabul edilmiş uygulamalardır. Bu amaçla anesteziyi uygulayacak sağlık personeli; Anestezi uzman doktoru ve anestezi teknikeridir. Bu tıbbi müdahale steril ameliyathane şartlarında cerrahi müdahalenin büyüklüğüne göre 1-4 saat arasında sürebilir.',
        en: 'During the surgical procedure, general anesthesia will be administered so that you do not feel or remember what is being done. These are scientifically and ethically accepted practices worldwide. The medical personnel who will administer anesthesia are an anesthesiologist and an anesthesia technician. This medical intervention takes place under sterile operating room conditions and may last between 1 and 4 hours depending on the size of the surgical procedure.',
      },
      {
        tr: 'Eğer bilgilendirme formunu okumak istemiyorsanız konu edilen bilgileri okumak istemediğinizi ve yapılacak her türlü işleme onay verdiğinizi okunaklı bir biçimde el yazısı ile yazarak imzalayınız.',
        en: 'If you do not wish to read the information form, please write in legible handwriting that you do not wish to read the information and that you consent to all procedures, and then sign.',
      },
      {
        tr: 'Sizi, operasyon için ameliyat öncesi ameliyata hazırlık amacıyla hazırlık bölümüne getirildiğinde, ameliyat salonuna alınmadan önce, anesteziyiniz uygun görecek olursa bir ilaç verilecektir. Bu ilaç, ağız kuruluğu, geçici unutkanlık ve uyku hali yapabilir.',
        en: 'When you are brought to the preparation area for pre-operative preparation, before being taken into the operating room, your anesthesiologist may give you a medication if deemed appropriate. This medication may cause dry mouth, temporary forgetfulness, and drowsiness.',
      },
      {
        tr: 'Daha sonra ameliyat salonuna alınacaksınız ve bu sırada;',
        en: 'You will then be taken to the operating room, and at this time:',
      },
      {
        tr: '1. Kalbinizin durumunu değerlendirmek için EKG elektrodları vücudunuza yapıştırılacak',
        en: '1. ECG electrodes will be attached to your body to assess your heart condition',
      },
      {
        tr: '2. Serum takılması için damarınıza özel bir iğne ile girilecek',
        en: '2. A special needle will be inserted into your vein for IV fluid administration',
      },
      {
        tr: '3. Parmağınıza, kanın oksijenlenmesini gösteren bir cihaz takılacak',
        en: '3. A device showing the oxygenation of your blood will be attached to your finger',
      },
      {
        tr: '4. Kolunuza tansiyon aleti bağlanacaktır.',
        en: '4. A blood pressure cuff will be attached to your arm.',
      },
      {
        tr: 'Bunların dışında anestezistinizin gerekli göreceği özel uygulamalar yapılabilir. Eğer yapılacaksa bu uygulamalar hakkında size bilgi verilecektir. Damarınıza takılan iğneden verilecek ilaçlarla veya maskeden solutulacak oksijen ve anestezik ilaç karışımıyla uyumanız sağlanacak, gerekirse ilaçlarla solunumunuz durdurularak aletler yardımıyla kontrol edilecektir. Bu işlemleri hatırlamayacaksınız. Solunum kontrolü için gerekli görülürse soluk borunuza yerleştirilecek olan tüp yoluyla oksijen ve anestezik ilaç verilmesine devam edilecektir.',
        en: 'In addition, special applications deemed necessary by your anesthesiologist may be performed. If so, you will be informed about these applications. You will be put to sleep with medications given through the IV needle or with a mixture of oxygen and anesthetic medication breathed through a mask. If necessary, your breathing will be stopped with medications and controlled with devices. You will not remember these procedures. If deemed necessary for respiratory control, oxygen and anesthetic medication will continue to be administered through a tube placed in your trachea.',
      },
      {
        tr: 'Bu işlemlerden sonra ameliyata başlanmasına izin verilecektir. Ameliyatınız süresince yaşamsal fonksiyonlarınız sürekli olarak izlenecektir. Gerektiğinde ilaç uygulama ve düzenlemeleri yapılacaktır. Yapılan tüm işlemler, "Anestezi İzleme Formuna" kaydedilecektir. Operasyon bittikten sonra, size verdiğimiz oksijen dışındaki ilaçları uygulamayı keseceğiz. Bazılarının etkilerini ortadan kaldıran ilaçlar vereceğiz.',
        en: 'After these procedures, surgery will be allowed to begin. During your surgery, your vital functions will be continuously monitored. Medication administration and adjustments will be made as needed. All procedures performed will be recorded on the "Anesthesia Monitoring Form." After the operation is over, we will stop administering medications other than oxygen. We will give medications that reverse the effects of some of them.',
      },
      {
        tr: 'Eğer yerleştirilmiş ise boğazınızdaki tüpü çıkaracağız. Durumunuzu takip için uyanma odasına alacağız. İyice uyandığınıza karar verildikten sonra cerrahi kliniğe gönderileceksiniz.',
        en: 'If placed, we will remove the tube from your throat. We will take you to the recovery room to monitor your condition. After it is determined that you are fully awake, you will be sent to the surgical clinic.',
      },
    ],
  },
  {
    id: 'genel-anestezi-sorunlari',
    title: {
      tr: 'Genel anestezi sırasında ortaya çıkabilecek sorunlar, komplikasyonlar nedenleri ve bazılarının önlemleri şunlardır:',
      en: 'Problems and complications that may arise during general anesthesia, their causes, and some preventive measures are as follows:',
    },
    paragraphs: [
      {
        tr: '1- Solunumla ilgili olanlar:',
        en: '1- Respiratory issues:',
      },
      {
        tr: 'I- Mide içeriğinin solunum yoluna kaçması: En önemli ve sık karşılaşılan sorunlardan biridir. Bunu önlemek için eğer başka bir problem yoksa, (on iki parmak bağırsağı, yemek borusu darlığı gibi) en az 8 saat öncesinden katı yiyecekleri ve sıvı içecekleri kesmeniz gerekir. Acil durumlarda bu süre daha kısa tutulabilir. Bebekler ve çocuklar için açlık süreleri 2-6 saat arasında değişmektedir. Bu konuda doktorunuza danışınız.',
        en: 'I- Aspiration of stomach contents into the respiratory tract: This is one of the most important and common problems. To prevent this, if there are no other problems (such as duodenal obstruction or esophageal stricture), you must stop consuming solid foods and liquids at least 8 hours in advance. In emergencies, this period may be shorter. Fasting periods for infants and children vary between 2-6 hours. Consult your doctor about this.',
      },
      {
        tr: 'II- Anestezi sırasında hava yolu açıklığının sağlanamaması: Dilin büyük, çenenin küçük, soluk borusunun önde olması ve size özel bazı yapısal nedenlerle tüpün soluk borusuna yerleştirilme işlemi gerçekleştirilemeyebilir.',
        en: 'II- Inability to maintain airway patency during anesthesia: Due to a large tongue, small jaw, anteriorly positioned trachea, and other patient-specific structural reasons, the tube placement into the trachea may not be possible.',
      },
      {
        tr: 'III- Tüpün yerleştirilmesi esnasında solunum yolundaki bazı organlarda (dudak, dil, diş, boğaz, soluk borusu, akciğer) yaralanmalar olabilir.',
        en: 'III- Injuries may occur to some organs in the respiratory tract (lip, tongue, tooth, throat, trachea, lung) during tube placement.',
      },
      {
        tr: 'IV- İleri derecede solunum yetmezliği gelişebilir.',
        en: 'IV- Severe respiratory failure may develop.',
      },
      {
        tr: 'V- Boğaz ağrısı: Ameliyattan sonra olduğu sık görülmekle birlikte ciddi bir probleme nadiren neden olur.',
        en: 'V- Sore throat: Although commonly seen after surgery, it rarely causes serious problems.',
      },
      {
        tr: '2- Dolaşımla ilgili olanlar:',
        en: '2- Circulatory issues:',
      },
      {
        tr: 'I- Toplardamara, serum vermek için girilecek özel iğnenin, çok ender olarak karşılaşılan anatomik farklılıklara bağlı olarak yanlışlıkla atardamara takılması: Buradan bir ilaç verilirse parmaklardan kanlanma ve kolunuzu kaybetme riskiyle karşılaşabilirsiniz. Bazı ameliyatlarda, tansiyonunuzu daha yakından takip edebilmek için atardamar içine özel iğne uygulanır. Bu durumda bile çok nadir olsa da yukarıda belirtilen hasarlar oluşabilir.',
        en: 'I- Accidental insertion of the IV needle into an artery instead of a vein due to rare anatomical differences: If medication is administered through this, you may face the risk of bleeding from fingers and losing your arm. In some surgeries, a special needle is inserted into the artery to monitor your blood pressure more closely. Even in this case, although very rare, the damages mentioned above may occur.',
      },
      {
        tr: 'II- Kalp ile ilgili olanlar: Örneğin ileri derecede koroner yetmezliği, kalp blokları, kapak hastalıkları, geçirilmiş kalp krizi gibi sorunlar da, anestezi ve operasyonun neden olacağı riskleri artırmaktadır. Ayrıca bazı hastalarda çok nadiren de olsa, ameliyat esnasında ve sonrasında kalp krizi oluşabilmektedir.',
        en: 'II- Heart-related issues: Conditions such as severe coronary insufficiency, heart blocks, valvular diseases, and previous heart attacks increase the risks caused by anesthesia and surgery. Additionally, although very rarely, some patients may experience a heart attack during or after surgery.',
      },
      {
        tr: 'III- Büyük damarlara kateter uygulamaları: Bu uygulamalar yalnızca ameliyat sırasında kan kaybı olacağı düşünülen, ciddi derecede kalp rahatsızlığı olan ve ameliyat sonrası uzun süre damar yolu gerektiren hastalarda uygulanmaktadır. Yapılacağı yere göre ( boyun, kasık, kol vs) kanama, akciğerlerde hava toplanması gibi istenmeyen etkiler oluşabilir.',
        en: 'III- Catheter placement in large vessels: This is performed only in patients with anticipated blood loss during surgery, severe heart conditions, and those requiring long-term IV access after surgery. Depending on the location (neck, groin, arm, etc.), undesired effects such as bleeding and air accumulation in the lungs may occur.',
      },
      {
        tr: '3- İlaçlara bağlı sorunlar:',
        en: '3- Medication-related issues:',
      },
      {
        tr: 'I- Bütün diğer ilaçlarda olduğu gibi anestezi uygulamasında kullanılan ilaçlar da bazı allerjik reaksiyonlar ortaya çıkarabilir.',
        en: 'I- As with all other medications, drugs used in anesthesia may cause allergic reactions.',
      },
      {
        tr: 'II- İlaçların başka istenmeyen etkileri:',
        en: 'II- Other undesired effects of medications:',
      },
      {
        tr: 'A. Tansiyon düşüklüğü veya artması,',
        en: 'A. Low or high blood pressure,',
      },
      {
        tr: 'B. Nabız düşmesi veya artması,',
        en: 'B. Decreased or increased heart rate,',
      },
      {
        tr: 'C. Kalp ve solunumun durması,',
        en: 'C. Cardiac and respiratory arrest,',
      },
      {
        tr: 'III- Ateş yükselmesi (Malign Hipertermi): Bazı insanlarda çok nadiren "1/10.000" önlenemeyen ateş yükselmesi gelişebilir ve bu durum, en iyi olanakları olan yerlerde bile, yüksek oranda ölümcüldür.',
        en: 'III- Fever elevation (Malignant Hyperthermia): In very rare cases (1/10,000), an unstoppable fever may develop in some people, and this condition is highly fatal even in places with the best facilities.',
      },
      {
        tr: '4- Diğer:',
        en: '4- Other:',
      },
      {
        tr: 'I- Teknik, ekipman ve kadro yetersizliklerine bağlı oluşabilecek problemler,',
        en: 'I- Problems that may arise from technical, equipment, and staff inadequacies,',
      },
      {
        tr: 'II- Ameliyat sırasında verilen pozisyonla ilgili sorunlar: Ameliyat sırasında hareketsiz ve aynı pozisyonda uzun süre yatmakla ilgili sinir ezilmeleri, yüzükoyun yatmaya bağlı yüz göğüs vs gibi organlarda ezilme, gözde yaralanmalar olabilmektedir.',
        en: 'II- Issues related to surgical positioning: Lying motionless in the same position for long periods may cause nerve compressions; lying face-down may cause compression on organs such as face and chest, and eye injuries may occur.',
      },
      {
        tr: 'Yukarıda sayılan nedenler anestezi riskini etkileyen faktörlerdir. Genel anesteziye bağlı ölüm oranını belirlemek güç olmakla birlikte 1/10.000 ila 1/250000 olarak kabul edilmektedir. Bütün anestezi işlemleri sırasında veya sonrasında beklenen veya beklenmeyen yan etkiler veya kalıcı veya geçici problemler ortaya çıkabilmektedir. Yukarıda anlatılanlarla ilgili anlaşılmayan yönleri daha ayrıntılı bilgi almak istediğiniz konuları lütfen anestezistinize sorunuz.',
        en: 'The above reasons are factors affecting anesthesia risk. Although it is difficult to determine the mortality rate due to general anesthesia, it is accepted as 1/10,000 to 1/250,000. Expected or unexpected side effects, or permanent or temporary problems, may arise during or after all anesthesia procedures. Please ask your anesthesiologist about any aspects you do not understand or wish to learn more about.',
      },
    ],
  },
  {
    id: 'epidural-spinal-pleksus',
    title: {
      tr: 'EPİDURAL ANESTEZİ, SPİNAL ANESTEZİ ve PLEKSUS BLOKAJI',
      en: 'EPIDURAL ANESTHESIA, SPINAL ANESTHESIA and PLEXUS BLOCK',
    },
    paragraphs: [
      {
        tr: 'Size uygulanacak cerrahi işlem, vücudunuzun tamamı uyuşmadan yalnızca bir bölümü uyuşturularak yapılabilmektedir. Bu yöntemlerden biri seçilecek olursa operasyonun yapılacağı yere göre belinizden, koltuk altınızdan, boynunuzdan veya kasığınızdan iğne ile verilerek vücudunuzun o bölümü uyuşturulacaktır.',
        en: 'The surgical procedure to be performed on you can be done by numbing only a part of your body without numbing your entire body. If one of these methods is chosen, depending on the location of the operation, that part of your body will be numbed by injection from your lower back, armpit, neck, or groin.',
      },
      {
        tr: 'Uygulanacak olan cerrahi işlem sırasında yapılanları hissetmemeniz amacıyla bölgesel uyuşturma uygulanacaktır. Bu uygulamalar bilimsel olarak bütün dünyada kabul edilmiş uygulamalardır. Aşağıda anlatılan uygulama yöntemi ile ilgili anlaşılmayan yönleri lütfen anestezistinize sorunuz. Sizi, operasyon için ameliyat öncesi hazırlık bölümüne ameliyata getirildikten amacıyla ameliyat salonuna alınmadan önce, anesteziyiniz uygun görecek olursa bir ilaç verilecektir. Bu ilaç ağız kuruluğu, geçici unutkanlık ve uyku hali yapabilir.',
        en: 'Regional anesthesia will be applied so that you do not feel what is being done during the surgical procedure. These are scientifically accepted practices worldwide. Please ask your anesthesiologist about any aspects of the application method described below that you do not understand. Before being taken to the operating room from the pre-operative preparation area, your anesthesiologist may give you a medication if deemed appropriate. This medication may cause dry mouth, temporary forgetfulness, and drowsiness.',
      },
      {
        tr: 'Bir süre sonra ameliyat salonuna alınacaksınız ve bu sırada:',
        en: 'After a while, you will be taken to the operating room, and at this time:',
      },
      {
        tr: '1- Kalbinizin durumunu değerlendirmek için EKG elektrodları vücudunuza yapıştırılacak,',
        en: '1- ECG electrodes will be attached to your body to assess your heart condition,',
      },
      {
        tr: '2- Serum takılması için damarınıza özel bir iğneyle girilecek,',
        en: '2- A special needle will be inserted into your vein for IV fluid administration,',
      },
      {
        tr: '3- Parmağınıza kanın oksijenlenmesini gösteren bir cihaz takılacak.',
        en: '3- A device showing the oxygenation of your blood will be attached to your finger.',
      },
      {
        tr: '4- Kolunuza tansiyon aleti bağlanacaktır.',
        en: '4- A blood pressure cuff will be attached to your arm.',
      },
      {
        tr: 'Spinal Anestezi: Bel bölgenizde, omurlar arasında bulunan omuriliğin içinde bulunduğu sıvıya, çevreleyen zarlardan geçerek ince bir iğne ile lokal anestezik verilerek belden alt kısmında ağrı his duyusu ve hareketin kaldırıldığı anestezi uygulamasıdır.',
        en: 'Spinal Anesthesia: An anesthesia application in which a thin needle is used to deliver local anesthetic through the surrounding membranes into the cerebrospinal fluid that surrounds the spinal cord between the vertebrae in your lower back, eliminating pain sensation and movement below the waist.',
      },
      {
        tr: 'Epidural Anestezi: Sırt veya bel bölgenizde omurlar arası omuriliği saran zarları ile bu bölgedeki doku arasında epidural boşluk olarak bilinen aralığa çok ince bir plastik tüp yerleştirilmesi ve bu tüp içerisinden lokal anestezik verilmesi ile yalnızca uygulanacağı bölgenin altında ağrının ortadan kaldırıldığı anestezi uygulamasıdır.',
        en: 'Epidural Anesthesia: An anesthesia application in which a very thin plastic tube is placed in the epidural space, between the membranes surrounding the spinal cord and the tissue in your back or lower back, and local anesthetic is delivered through this tube, eliminating pain only below the area of application.',
      },
      {
        tr: 'Bunların dışında anestezistinizin gerekli göreceği özel uygulamalar yapılabilir. Eğer yapılmasına karar verilirse, bu uygulamalar size detaylı olarak anlatılacaktır. Yapılacak bölgesel uyuşturma uygulamaları esnasında ve sonrasında ortaya çıkabilecek sorunlar, komplikasyonlar;',
        en: 'In addition, special applications deemed necessary by your anesthesiologist may be performed. If decided, these applications will be explained to you in detail. Problems and complications that may arise during and after the regional anesthesia procedures:',
      },
      {
        tr: 'I- Tansiyon ve nabız düşmesi: Ameliyat sırasında veya sonrasında nabız veya tansiyonda düşme olabilir. Anestezist gerektiği an gerekli girişimi yapacaktır.',
        en: 'I- Drop in blood pressure and heart rate: A drop in heart rate or blood pressure may occur during or after surgery. The anesthesiologist will intervene when necessary.',
      },
      {
        tr: 'II- Baş ağrısı: Spinal anestezi veya epidural anestezi uygulamaları sonrası ortaya çıkabilir. Eğer oluşursa çözüm için anestezistinize danışınız.',
        en: 'II- Headache: May occur after spinal or epidural anesthesia. If it occurs, consult your anesthesiologist for a solution.',
      },
      {
        tr: 'III- Sinirsel komplikasyonlar: Bölgesel anestezi sonrası geçici veya kalıcı sinirsel hasarlar nadiren de olsa ortaya çıkabilir.',
        en: 'III- Neurological complications: Although rare, temporary or permanent nerve damage may occur after regional anesthesia.',
      },
      {
        tr: 'IV- Bulantı ve kusma: Ameliyat sırasında veya sonrasında ortaya çıkabilir. Gerekli müdahale anestezinistce yapılacaktır.',
        en: 'IV- Nausea and vomiting: May occur during or after surgery. Necessary intervention will be performed by the anesthesiologist.',
      },
      {
        tr: 'V- Enfeksiyon: Her enjeksiyonda olduğu gibi bu girişimlerde de enfeksiyon oluşabilir. Oluşmaması için özen gösterilmektedir.',
        en: 'V- Infection: As with any injection, infection may occur during these procedures. Care is taken to prevent infection.',
      },
      {
        tr: 'VI- Duymada bozukluk: Spinal anestezi sonrası nadiren geçici veya kalıcı duyma bozuklukları ortaya çıkabilir.',
        en: 'VI- Hearing impairment: Although rare, temporary or permanent hearing impairment may occur after spinal anesthesia.',
      },
      {
        tr: 'VII- Kullanılan ilaçlara bağlı yan etkiler ortaya çıkabilir.',
        en: 'VII- Side effects related to the medications used may occur.',
      },
      {
        tr: 'VIII- Başarısız Blok: Spinal veya epidural anestezi uygulamaları ile ameliyata başlandıktan sonra hastanın ağrı duyması ya da ameliyatlar süresinin sinirin uyuşturulması için kullanılan ilacın etki süresinden uzun sürmesine bağlı olarak hastanın ameliyatına devam edilebilmesi için anestezist uygun gördüğü taktirde başka bir uygulama (sedasyon veya genel anestezi) yapmak zorunda kalabilir.',
        en: 'VIII- Failed Block: After surgery has begun with spinal or epidural anesthesia, if the patient feels pain or if the surgery lasts longer than the effect of the medication used for nerve numbing, the anesthesiologist may have to perform another application (sedation or general anesthesia) as deemed appropriate to continue the surgery.',
      },
      {
        tr: 'Bu tür bir olasılık nedeniyle, lütfen genel anestezi uygulaması ile ilgili detaylı açıklamayı da dikkatlice okuyunuz. Anestezi uygulaması için verilecek olan "Aydınlatılmış Hasta Onamı"nın bağlantılı uygulamaları da içereceğinin bilinmesi gerekir.',
        en: 'Due to such a possibility, please carefully read the detailed explanation about general anesthesia administration. It should be known that the "Informed Patient Consent" given for anesthesia application will also include related applications.',
      },
    ],
  },
  {
    id: 'periferik-sinir-bloklari',
    title: {
      tr: 'PERİFERİK SİNİR BLOKLARI',
      en: 'PERIPHERAL NERVE BLOCKS',
    },
    paragraphs: [
      {
        tr: 'Kollarda ve bacaklarda ağrı duymadan ameliyat yapılabilmesi için, bu bölgenin hareket etmesini ve duyusunu sağlayan sinirlerin uyuşturulması işlemine "Sinir blokajı (Periferik sinir bloğu)" adı verilir. Sinir blokları ile kolun veya bacağın tamamı uyuşturulabileceği gibi bu uzuvların bir bölümü de uyuşturulabilir. (El, ayak, parmak gibi).',
        en: 'The procedure of numbing the nerves that provide movement and sensation in the arms and legs to perform surgery without pain is called "Nerve Block (Peripheral Nerve Block)." With nerve blocks, the entire arm or leg can be numbed, or only a portion of these limbs (such as hand, foot, or finger) can be numbed.',
      },
      {
        tr: 'Ameliyat yapılacak alana giden sinirin etrafına uygun yerden iğne ile girilerek uygun lokal anestezik ilaçtan gereği kadar enjekte edilecektir. Genel anestezi uygulamalarından alınan tüm önlemler sinir bloklarında da alınarak işlem gerçekleştirilir.',
        en: 'A needle is inserted around the nerve that goes to the surgical area through an appropriate location, and the necessary amount of local anesthetic medication is injected. All precautions taken in general anesthesia applications are also taken in nerve blocks, and the procedure is performed.',
      },
      {
        tr: 'Sinir blokları sırasında veya sonrasında ortaya çıkabilecek sorunlar:',
        en: 'Problems that may arise during or after nerve blocks:',
      },
      {
        tr: 'I- İlaçlara karşı alerji: Sinir bloğu için verilen lokal anestezik ilaçlara karşı alerji gelişebilir.',
        en: 'I- Drug allergies: Allergies to the local anesthetic medications given for nerve blocks may develop.',
      },
      {
        tr: 'II- İlaçların damar içine yapılması: Sinirlerin damarlara yakın komşuluğu nedeniyle verilen ilaçlar damar yoluna istenmeden verilebilir. Buna bağlı baş dönmesi, uyku hali, bilinçte bozulma, epileptik (sara benzeri) hareketler oluşabilir.',
        en: 'II- Intravascular medication injection: Due to the proximity of nerves to vessels, medications may unintentionally be administered into the vessel. This may cause dizziness, drowsiness, impaired consciousness, and epileptic-like (seizure-like) movements.',
      },
      {
        tr: 'III- Damarların delinmesi: Sinire komşu damarların delinmesine bağlı olarak, damardan kan doku içine sızılabilir ve bu bölgede birikebilir.',
        en: 'III- Vessel puncture: Due to puncture of vessels adjacent to the nerve, blood from the vessel may leak into the tissue and accumulate in this area.',
      },
      {
        tr: 'IV- Sinir hasarlanması: Sinir iğneyle zedelenmesine bağlı veya ilacın direkt olarak sinir içine verilmesi nedeniyle geçici veya kalıcı hareket veya duyu kaybı olabilir.',
        en: 'IV- Nerve damage: Temporary or permanent loss of movement or sensation may occur due to nerve injury by the needle or direct injection of medication into the nerve.',
      },
      {
        tr: 'V- Kolun uyuşturulması için boyun bölgesinden yapılan girişimlerde; ses kısıklığı, işlemin yapıldığı taraftaki göz kapağında düşme ve sulanma, akciğerin sönmesi, bu bölgeden akciğerlerde sıvı ve kan toplanması olabilir. Bu bölgeden verilen ilaçların direkt olarak omurilik sıvısına verilmesi veya sızması durumunda boyundan aşağıya bölgede uyuşukluk ve hareket kaybı kalp ve/veya solunum durması olabilir.',
        en: 'V- In procedures performed from the neck region for arm numbing: hoarseness, drooping and watering of the eyelid on the side of the procedure, lung collapse, and fluid and blood accumulation in the lungs may occur. If the medications given from this area are administered directly to or leak into the spinal fluid, numbness and loss of movement below the neck, and cardiac and/or respiratory arrest may occur.',
      },
      {
        tr: 'VI- Enfeksiyon: Her enjeksiyonda olduğu gibi bu girişimlerde de enfeksiyon gelişebilir.',
        en: 'VI- Infection: As with any injection, infection may develop during these procedures.',
      },
      {
        tr: 'VII- Başarısız sinir bloğu: Periferik sinir bloğu uygulaması ile ameliyata başlandıktan sonra hastanın ağrı duyması ya da ameliyat süresinin sinirin uyuşturulması (sinir blokajı) için kullanılan ilacın etki süresinden uzun sürmesine bağlı olarak hastanın ameliyatına devam edebilmesi için anestezist uygun gördüğü ek bir uygulama (sedasyon veya genel anestezi) yapmak zorunda kalabilir.',
        en: 'VII- Failed nerve block: After surgery has begun with peripheral nerve block, if the patient feels pain or if the surgery lasts longer than the effect of the medication used for nerve numbing (nerve block), the anesthesiologist may have to perform an additional application (sedation or general anesthesia) as deemed appropriate to continue the surgery.',
      },
      {
        tr: 'Bu tür bir olasılık nedeniyle, lütfen genel anestezi uygulaması ile ilgili detaylı açıklamayı da dikkatlice okuyunuz. Anestezi uygulaması için verilecek olan "Aydınlatılmış Hasta Onamı"nın bağlantılı uygulamaları da içereceğinin bilinmesi gereklidir.',
        en: 'Due to such a possibility, please carefully read the detailed explanation about general anesthesia administration. It should be known that the "Informed Patient Consent" given for anesthesia application will also include related applications.',
      },
    ],
  },
  {
    id: 'santral-kateter',
    title: {
      tr: 'SANTRAL KATETER UYGULAMASI',
      en: 'CENTRAL CATHETER APPLICATION',
    },
    paragraphs: [
      {
        tr: 'Doktorunuz gerekli gördüğü takdirde, kanama miktarı takibi, ilaç ve kan verme ihtiyacı doğması gibi nedenlerle büyük toplardamarlarınızdan birine kateter yerleştirme gereksinimi olabilir. Bu işlem esnasında veya sonrasında, kalp ritim bozuklukları, kanama, pnömotoraks "akciğerlerde hava birikmesi", kalp duvarının delinmesi solunum yollarının tıkanması gibi hayati komplikasyonlar ortaya çıkabilir. Bu işlem doktorunuzun kararına göre boynunuzdan köprücük kemiğinizin üstünden veya altından, kasığınızdan veya kolunuzdan uygulanabilir.',
        en: 'If your doctor deems necessary, there may be a need to place a catheter in one of your large veins for reasons such as monitoring blood loss, the need for medication and blood administration. During or after this procedure, life-threatening complications such as cardiac arrhythmias, bleeding, pneumothorax (air accumulation in the lungs), perforation of the heart wall, and obstruction of the respiratory tract may occur. According to your doctor\'s decision, this procedure may be applied from your neck above or below the collarbone, from your groin, or from your arm.',
      },
      {
        tr: 'Ayrıca bu kateterin vücutta kalması vücudunuzda tedavi edilemeyecek düzeyde enfeksiyonların oluşmasına da neden olabilir. Kateterin toplar damar yerine atardamara girmesi sonucunda buradan ilaç verilirse bu atardamarın beslediği alana bağlı olarak felç, beyin fonksiyonları kaybı, kol veya bacakta kangren oluşabilir. Kateterin uygulanması ve çıkarılması esnasında kopma ihtimali olduğundan eğer koparsa çıkarılabilmesi için yeni bir operasyon gerekebilir. Yukarıda anlatılan istenmeyen etkiler nadir görülmekte ve olmaması için azami gayret gösterilmektedir. Bu konuda daha açıklayıcı bilgi için anestezistinize soru sormaktan çekinmeyiniz.',
        en: 'Additionally, the catheter remaining in the body may cause infections that cannot be treated. If the catheter enters an artery instead of a vein and medication is administered through it, paralysis, loss of brain functions, and gangrene in the arm or leg may occur depending on the area supplied by that artery. Since there is a possibility of breakage during catheter placement and removal, a new operation may be required for removal if it breaks. The undesired effects mentioned above are rare, and maximum effort is made to prevent them. Do not hesitate to ask your anesthesiologist for more detailed information on this subject.',
      },
    ],
  },
  {
    id: 'arter-kanulu',
    title: {
      tr: 'ARTER KANÜLÜ UYGULAMASI',
      en: 'ARTERIAL CANNULA APPLICATION',
    },
    paragraphs: [
      {
        tr: 'Tansiyon ve kalp atımlarınızın ölçülmesi, kalp ve akciğer fonksiyonlarınızın yakından takibi, kan tahlili için kan alınması gibi nedenlerle doktorunuzun gerekli gördüğü durumlarda kolunuzdaki bileğinizdeki, kolunuzda veya kasığınızdaki atardamara kateter uygulama işlemi yapılabilir. Bu işlem sonrasında pıhtı oluşması içine içine girilen atardamarın tıkanması ve beslediği alanda kangren veya enfeksiyon oluşma ihtimali vardır. Tıbben bütün önlemler alınsa da bu etkilerin nadiren ortaya çıkması nadiren de olsa engellenemeyebilir.',
        en: 'In cases where your doctor deems necessary, for reasons such as measuring blood pressure and heart rate, close monitoring of heart and lung functions, and taking blood for blood tests, a catheter may be placed in the artery in your wrist, arm, or groin. After this procedure, there is a possibility of clot formation, blockage of the entered artery, and gangrene or infection in the area it supplies. Although all medical precautions are taken, the rare occurrence of these effects may not always be preventable.',
      },
      {
        tr: 'Yukarıda anlatılan bütün anestezi işlemleri sırasında veya sonrasında beklenen veya beklenmeyen yan etkiler veya kalıcı veya geçici problemler ortaya çıkabilmektedir. Nadiren görülen bu problemlerin önlenebilmesi ve ortaya çıkarsa giderilebilmesi için azami önlemler alınmaktadır. Yukarıda anlatılanlarla ilgili anlaşılmayan yönleri lütfen anestezi doktorunuza sorunuz.',
        en: 'During or after all anesthesia procedures described above, expected or unexpected side effects or permanent or temporary problems may arise. Maximum precautions are taken to prevent these rarely seen problems and to resolve them if they occur. Please ask your anesthesiologist about any aspects you do not understand.',
      },
      {
        tr: 'Yukarıdaki açıklamaları okudum ve/veya bana anlatıldı. Bana uygulanacak anestezi girişimleri ile ilgili işlemlerin yapılmasına izin veriyorum.',
        en: 'I have read the above explanations and/or they have been explained to me. I consent to the anesthesia procedures to be applied to me.',
      },
    ],
  },
  {
    id: 'alternatif-riskler',
    title: {
      tr: 'ANESTEZİNİN ALTERNATİF TEDAVİLERİ VE RİSKLERİ',
      en: 'ALTERNATIVE TREATMENTS AND RISKS OF ANESTHESIA',
    },
    paragraphs: [
      {
        tr: 'Bilinen bir alternatif uygulama yöntemi yoktur.',
        en: 'There is no known alternative application method.',
      },
    ],
  },
  {
    id: 'uygulanmazsa',
    title: {
      tr: 'ANESTEZİ UYGULANMAZSA NELER GELİŞİR?',
      en: 'WHAT HAPPENS IF ANESTHESIA IS NOT APPLIED?',
    },
    paragraphs: [
      {
        tr: 'Yapılacak ameliyat işlem gerçekleştirilemez.',
        en: 'The planned surgical procedure cannot be performed.',
      },
    ],
  },
  {
    id: 'sonrasi',
    title: {
      tr: 'ANESTEZİ SONRASI DİKKAT EDİLMESİ GEREKEN NOKTALAR NELERDİR?',
      en: 'WHAT POINTS SHOULD BE OBSERVED AFTER ANESTHESIA?',
    },
    paragraphs: [
      {
        tr: 'Genel Anestezi uygulamasından sonra: anestezi uzmanınız tarafından aksi belirtilmemişse, en az 6 saat ağzınızdan herhangi bir sıvı, gıda vb. alınmamalıdır.',
        en: 'After General Anesthesia: Unless otherwise stated by your anesthesiologist, no liquids, food, etc. should be taken by mouth for at least 6 hours.',
      },
      {
        tr: 'Bölgesel anestezi uygulamasından sonra:',
        en: 'After regional anesthesia:',
      },
      {
        tr: '• En az 12 saat mutlak yatak istirahati yapılmalıdır.',
        en: '• Absolute bed rest must be observed for at least 12 hours.',
      },
      {
        tr: '• 6 saat süreyle sulu gıda alınmalıdır.',
        en: '• Liquid food should be consumed for 6 hours.',
      },
      {
        tr: 'Baş dönmesi, baş ağrısı, mide bulantısı, kusma, 6 saat içinde idrar yapamamama şikayetleri söz konusu olursa, hemşireye haber verilmeli/hekime başvurulmalıdır.',
        en: 'If complaints such as dizziness, headache, nausea, vomiting, or inability to urinate within 6 hours occur, the nurse should be informed and a doctor should be consulted.',
      },
    ],
  },
  {
    id: 'iletisim',
    title: {
      tr: 'GEREKTİĞİNDE AYNI KONUDA TIBBİ YARDIMA NASIL ULAŞILACAĞI',
      en: 'HOW TO ACCESS MEDICAL ASSISTANCE ON THE SAME SUBJECT WHEN NEEDED',
    },
    paragraphs: [
      {
        tr: '• Hastane telefonlarından (444 77 78) hekiminize ulaşabilirsiniz.',
        en: '• You can reach your doctor through the hospital phone (444 77 78).',
      },
      {
        tr: '• Gerektiğinde Acil servis başvurabilirsiniz.',
        en: '• You can apply to the Emergency Service when needed.',
      },
      {
        tr: 'Bu formdaki tüm boşluklar imzalamamdan önce dolduruldu ve bir kopyasını aldım.',
        en: 'All blanks on this form were filled in before I signed, and I received a copy.',
      },
    ],
  },
];