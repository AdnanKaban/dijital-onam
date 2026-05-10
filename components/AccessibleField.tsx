import Voice, {
    SpeechErrorEvent,
    SpeechResultsEvent,
} from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  // Sesli okuma için ek bilgi (örn. "Boş" yerine "Bu alan boş")
  readEmptyAs?: string;
};

export default function AccessibleField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  readEmptyAs = 'Bu alan henüz doldurulmadı',
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice event listener'ları
  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        // Önceki değere ekle (kullanıcı mevcut metne ekleyebilsin)
        const newText = value ? `${value} ${e.value[0]}` : e.value[0];
        onChange(newText);
      }
      setIsListening(false);
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.log('Voice error:', e.error);
      setIsListening(false);
      Alert.alert(
        'Sesli Yazma Hatası',
        'Ses tanınamadı. Lütfen tekrar deneyiniz veya manuel olarak yazınız.'
      );
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [value, onChange]);

  // Android'de mikrofon izni iste
  const requestMicPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Mikrofon İzni',
          message: 'Sesli yazma özelliği için mikrofon erişimi gereklidir.',
          buttonPositive: 'İzin Ver',
          buttonNegative: 'İptal',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  // 🔊 Alanı sesli oku (label + değer)
  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    Speech.stop();
    const textToRead = `${label}. ${value.trim() ? value : readEmptyAs}`;
    setIsSpeaking(true);
    Speech.speak(textToRead, {
      language: 'tr-TR',
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // 🎤 Sesli yazma başlat/durdur
  const handleVoiceInput = async () => {
    if (isListening) {
      try {
        await Voice.stop();
      } catch (e) {
        console.log('Voice stop error:', e);
      }
      setIsListening(false);
      return;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      Alert.alert(
        'İzin Reddedildi',
        'Mikrofon erişimi olmadan sesli yazma kullanılamaz.'
      );
      return;
    }

    try {
      Speech.stop(); // TTS okurken kayıt başlatma
      await Voice.start('tr-TR');
    } catch (e) {
      console.log('Voice start error:', e);
      setIsListening(false);
      Alert.alert('Hata', 'Sesli yazma başlatılamadı.');
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.btnGroup}>
          <TouchableOpacity
            onPress={handleSpeak}
            style={[styles.iconBtn, isSpeaking && styles.iconBtnActive]}
            accessibilityLabel={`${label} alanını sesli oku`}
          >
            <Text style={styles.iconBtnText}>{isSpeaking ? '⏸' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleVoiceInput}
            style={[styles.iconBtn, isListening && styles.iconBtnListening]}
            accessibilityLabel={`${label} alanına sesli yazma`}
          >
            <Text style={styles.iconBtnText}>{isListening ? '🔴' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
      />

      {isListening && (
        <Text style={styles.listeningHint}>🎤 Dinliyorum... Konuşunuz</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  iconBtnActive: {
    backgroundColor: '#FFE0B2',
    borderColor: '#FB8C00',
  },
  iconBtnListening: {
    backgroundColor: '#FFCDD2',
    borderColor: '#C62828',
  },
  iconBtnText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#FFF8F8',
    color: '#222',
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  listeningHint: {
    color: '#C62828',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '600',
  },
});