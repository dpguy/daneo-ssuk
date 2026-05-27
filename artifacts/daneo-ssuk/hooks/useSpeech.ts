import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechSpeed = 0.8 | 1.0 | 1.2;

export interface UseSpeechReturn {
  isSpeaking: boolean;
  speechError: boolean;
  speed: SpeechSpeed;
  setSpeed: (s: SpeechSpeed) => void;
  speak: (text: string, overrideSpeed?: SpeechSpeed) => void;
  replay: () => void;
  toggle: (text: string) => void;
  stop: () => void;
  clearError: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [speed, setSpeed] = useState<SpeechSpeed>(1.0);
  const lastWordRef = useRef<string>("");
  const speedRef = useRef<SpeechSpeed>(1.0);

  const syncSpeed = useCallback((s: SpeechSpeed) => {
    speedRef.current = s;
    setSpeed(s);
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, overrideSpeed?: SpeechSpeed) => {
    setSpeechError(false);
    Speech.stop();
    setIsSpeaking(false);

    const rate = overrideSpeed ?? speedRef.current;
    lastWordRef.current = text;

    setIsSpeaking(true);
    Speech.speak(text, {
      language: "en-US",
      rate,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setSpeechError(true);
      },
    });
  }, []);

  const replay = useCallback(() => {
    if (lastWordRef.current) {
      speak(lastWordRef.current);
    }
  }, [speak]);

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stop();
      } else {
        speak(text);
      }
    },
    [isSpeaking, speak, stop]
  );

  const clearError = useCallback(() => setSpeechError(false), []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return {
    isSpeaking,
    speechError,
    speed,
    setSpeed: syncSpeed,
    speak,
    replay,
    toggle,
    stop,
    clearError,
  };
}
