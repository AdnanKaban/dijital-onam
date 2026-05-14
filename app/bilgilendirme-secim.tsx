import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useBilgilendirmeSecimAsistani } from '../hooks/useBilgilendirmeSecimAsistani';

export default function BilgilendirmeSecimScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tr = params.lang !== 'en';

  const [okumadanModal, setOkumadanModal] = useState(false);
  const [redModal, setRedModal] = useState(false);

  const [okumadanOnayCheck, setOkumadanOnayCheck] = useState(false);
  const [redOnayCheck, setRedOnayCheck] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const gitBilgilendirme = () => {
    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    router.push({
      pathname: '/bilgilendirme',
      params,
    });
  };

  const okumadanOnayModalAc = () => {
    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setOkumadanOnayCheck(false);
    setOkumadanModal(true);
  };

  const okumadanRedModalAc = () => {
    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setRedOnayCheck(false);
    setRedModal(true);
  };

  const gitImzaOkumadanOnay = () => {
    if (!okumadanOnayCheck) return;

    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setOkumadanModal(false);

    router.push({
      pathname: '/imza',
      params: {
        ...params,
        bilgilendirmeOkundu: 'false',
        hastaKarari: 'onay',
      },
    });
  };

  const gitImzaOkumadanRed = () => {
    if (!redOnayCheck) return;

    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setRedModal(false);

    router.push({
      pathname: '/imza',
      params: {
        ...params,
        bilgilendirmeOkundu: 'false',
        hastaKarari: 'red',
      },
    });
  };

  const gitImzaOkumadanOnaySesli = () => {
    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setOkumadanOnayCheck(true);
    setOkumadanModal(false);

    router.push({
      pathname: '/imza',
      params: {
        ...params,
        bilgilendirmeOkundu: 'false',
        hastaKarari: 'onay',
      },
    });
  };

  const gitImzaOkumadanRedSesli = () => {
    Speech.stop();
    anaAsistan.durdur();
    modalAsistan.durdur();

    setRedOnayCheck(true);
    setRedModal(false);

    router.push({
      pathname: '/imza',
      params: {
        ...params,
        bilgilendirmeOkundu: 'false',
        hastaKarari: 'red',
      },
    });
  };

  const modalVazgec = () => {
    Speech.stop();
    modalAsistan.durdur();

    setOkumadanModal(false);
    setRedModal(false);
    setOkumadanOnayCheck(false);
    setRedOnayCheck(false);

    if (tr) {
      setTimeout(() => {
        anaAsistan.baslat();
      }, 500);
    }
  };

  const modalAktif = okumadanModal || redModal;

  const { anaAsistan, modalAsistan } = useBilgilendirmeSecimAsistani({
    aktif: tr,
    modalAktif,
    tr,

    onOku: gitBilgilendirme,
    onOkumadanOnay: okumadanOnayModalAc,
    onOkumadanRed: okumadanRedModalAc,

    onModalEminim: () => {
      if (okumadanModal) {
        gitImzaOkumadanOnaySesli();
      } else if (redModal) {
        gitImzaOkumadanRedSesli();
      }
    },

    onModalVazgec: modalVazgec,
  });

  useEffect(() => {
    if (!tr) return;

    const timer = setTimeout(() => {
      anaAsistan.baslat();
    }, 700);

    return () => {
      clearTimeout(timer);
      anaAsistan.durdur();
      modalAsistan.durdur();
      Speech.stop();
    };
  }, [tr]);

  useEffect(() => {
    if (!tr) return;
    if (!okumadanModal && !redModal) return;

    const timer = setTimeout(() => {
      modalAsistan.baslat();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [tr, okumadanModal, redModal]);

  useEffect(() => {
    if (okumadanOnayCheck || redOnayCheck) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [okumadanOnayCheck, redOnayCheck]);

  return (
    <LinearGradient colors={['#E57373', '#C62828']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              Speech.stop();
              anaAsistan.durdur();
              modalAsistan.durdur();
              router.back();
            }}
          >
            <Text style={styles.backBtnText}>← {tr ? 'Geri' : 'Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            📋 {tr ? 'Anestezi Bilgilendirme' : 'Anesthesia Information'}
          </Text>

          <Text style={styles.subtitle}>
            {tr
              ? 'K.B.Ü. Karabük Eğitim ve Araştırma Hastanesi'
              : 'K.B.U. Karabük Training and Research Hospital'}
          </Text>

          {tr && (
            <View style={styles.voiceBox}>
              <Text style={styles.voiceTitle}>🎤 Sesli Yönlendirme</Text>

              <Text style={styles.voiceText}>
                “oku”, “okumadan onaylıyorum” veya “okumadan reddediyorum”
                diyebilirsiniz.
              </Text>

              <Text style={styles.voiceStatus}>
                {anaAsistan.dinleniyor
                  ? '🎤 Dinleniyor...'
                  : anaAsistan.sonAlinanMetin
                  ? `Son algılanan: ${anaAsistan.sonAlinanMetin}`
                  : 'Sesli açıklama okunuyor veya bekleniyor...'}
              </Text>

              {anaAsistan.hataMesaji && (
                <Text style={styles.errorText}>{anaAsistan.hataMesaji}</Text>
              )}
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {tr
                ? 'Bu ekranda anestezi işlemleri hakkında size bilgi verilecektir. Bilgilendirme metnini okumanız veya dinlemeniz önerilir.\n\nAşağıdaki seçeneklerden birini seçiniz:'
                : 'This screen will provide information about anesthesia procedures. Reading is recommended.\n\nPlease select one option:'}
            </Text>
          </View>

          <TouchableOpacity style={styles.optionBtnGreen} onPress={gitBilgilendirme}>
            <Text style={styles.optionIcon}>📖</Text>

            <View style={styles.optionTextBox}>
              <Text style={styles.optionTitle}>
                {tr ? 'Bilgilendirme Metnini Oku / Dinle' : 'Read Information Text'}
              </Text>

              <Text style={styles.optionDesc}>
                {tr
                  ? 'Bilgilendirme metnini okuyun veya sesli dinleyin. Bu önerilen seçenektir.'
                  : 'Read the information text. This is the recommended option.'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtnOrange} onPress={okumadanOnayModalAc}>
            <Text style={styles.optionIcon}>✏️</Text>

            <View style={styles.optionTextBox}>
              <Text style={styles.optionTitle}>
                {tr ? 'Okumadan Onaylıyorum' : 'Consent Without Reading'}
              </Text>

              <Text style={styles.optionDesc}>
                {tr
                  ? 'Bilgilendirme metnini okumadan anestezi işlemine onay vermek istiyorum.'
                  : 'I wish to consent without reading the information text.'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtnRed} onPress={okumadanRedModalAc}>
            <Text style={styles.optionIcon}>❌</Text>

            <View style={styles.optionTextBox}>
              <Text style={styles.optionTitle}>
                {tr ? 'Okumadan Reddediyorum' : 'Refuse Without Reading'}
              </Text>

              <Text style={styles.optionDesc}>
                {tr
                  ? 'Bilgilendirme metnini okumadan anestezi işlemini reddetmek istiyorum.'
                  : 'I wish to refuse without reading the information text.'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={okumadanModal}
        transparent
        animationType="fade"
        onRequestClose={modalVazgec}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ {tr ? 'Emin misiniz?' : 'Are you sure?'}</Text>

            <Text style={styles.modalText}>
              {tr
                ? 'Bilgilendirme metnini okumadan anestezi işlemine onay vermek istediğinizi beyan ediyorsunuz.\n\nBu seçim kayıt altına alınacaktır.\n\nSesli devam etmek için “eminim” diyebilirsiniz.'
                : 'You declare that you want to consent without reading the information text.\n\nThis choice will be recorded.'}
            </Text>

            {tr && (
              <Text style={styles.modalVoiceStatus}>
                {modalAsistan.dinleniyor
                  ? '🎤 Dinleniyor...'
                  : modalAsistan.sonAlinanMetin
                  ? `Son algılanan: ${modalAsistan.sonAlinanMetin}`
                  : '“eminim” veya “vazgeç” diyebilirsiniz.'}
              </Text>
            )}

            <TouchableOpacity
              style={styles.modalCheckRow}
              onPress={() => setOkumadanOnayCheck(!okumadanOnayCheck)}
            >
              <View style={[styles.checkbox, okumadanOnayCheck && styles.checkboxActive]}>
                {okumadanOnayCheck && <Text style={styles.checkboxTick}>✓</Text>}
              </View>

              <Text style={styles.modalCheckText}>
                {tr
                  ? 'Evet, bilgilendirme metnini okumadan onayladığımı beyan ediyorum.'
                  : 'Yes, I declare that I consent without reading.'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={modalVazgec}>
              <Text style={styles.modalCancelText}>{tr ? 'Vazgeç' : 'Cancel'}</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !okumadanOnayCheck && styles.modalConfirmBtnDisabled,
                ]}
                onPress={gitImzaOkumadanOnay}
                disabled={!okumadanOnayCheck}
              >
                <Text style={styles.modalConfirmText}>
                  {tr ? 'İmzaya Geç →' : 'Proceed to Signature →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={redModal}
        transparent
        animationType="fade"
        onRequestClose={modalVazgec}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              ⚠️ {tr ? 'Reddi Onaylayın' : 'Confirm Refusal'}
            </Text>

            <Text style={styles.modalText}>
              {tr
                ? 'Bilgilendirme metnini okumadan anestezi işlemini reddetmek istediğinizi beyan ediyorsunuz.\n\nBu seçim kayıt altına alınacaktır.\n\nSesli devam etmek için “eminim” diyebilirsiniz.'
                : 'You declare that you want to refuse without reading the information text.\n\nThis choice will be recorded.'}
            </Text>

            {tr && (
              <Text style={styles.modalVoiceStatus}>
                {modalAsistan.dinleniyor
                  ? '🎤 Dinleniyor...'
                  : modalAsistan.sonAlinanMetin
                  ? `Son algılanan: ${modalAsistan.sonAlinanMetin}`
                  : '“eminim” veya “vazgeç” diyebilirsiniz.'}
              </Text>
            )}

            <TouchableOpacity
              style={styles.modalCheckRow}
              onPress={() => setRedOnayCheck(!redOnayCheck)}
            >
              <View style={[styles.checkbox, redOnayCheck && styles.checkboxActive]}>
                {redOnayCheck && <Text style={styles.checkboxTick}>✓</Text>}
              </View>

              <Text style={styles.modalCheckText}>
                {tr
                  ? 'Evet, bilgilendirme metnini okumadan reddettiğimi beyan ediyorum.'
                  : 'Yes, I declare that I refuse without reading.'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={modalVazgec}>
              <Text style={styles.modalCancelText}>{tr ? 'Vazgeç' : 'Cancel'}</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.modalRefuseBtn,
                  !redOnayCheck && styles.modalConfirmBtnDisabled,
                ]}
                onPress={gitImzaOkumadanRed}
                disabled={!redOnayCheck}
              >
                <Text style={styles.modalConfirmText}>
                  {tr ? 'İmzaya Geç →' : 'Proceed to Signature →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 20,
  },

  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 15,
    color: '#C62828',
    fontWeight: '600',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B71C1C',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },

  voiceBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D47A1',
    marginBottom: 6,
  },
  voiceText: {
    fontSize: 14,
    color: '#263238',
    lineHeight: 20,
  },
  voiceStatus: {
    marginTop: 8,
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#B71C1C',
    fontWeight: '600',
  },

  infoBox: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 15,
    color: '#5D4037',
    lineHeight: 22,
  },

  optionBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#388E3C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  optionBtnOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#E65100',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  optionBtnRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#B71C1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B71C1C',
    marginBottom: 14,
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    marginBottom: 12,
  },
  modalVoiceStatus: {
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },

  modalCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  modalCheckText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxActive: {
    borderColor: '#C62828',
    backgroundColor: '#C62828',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  modalCancelBtn: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#666',
  },

  modalConfirmBtn: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalRefuseBtn: {
    backgroundColor: '#B71C1C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmBtnDisabled: {
    backgroundColor: '#ccc',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});