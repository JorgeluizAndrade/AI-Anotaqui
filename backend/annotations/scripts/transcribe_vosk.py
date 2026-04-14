#!/usr/bin/env python3
import json
import os
import sys
import wave

from vosk import KaldiRecognizer, Model


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False))


def main() -> int:
    if len(sys.argv) != 2:
        emit({"error": "usage: transcribe_vosk.py <audio.wav>"})
        return 1

    wav_path = sys.argv[1]
    if not os.path.exists(wav_path):
        emit({"error": f"audio file not found: {wav_path}"})
        return 1

    model_path = os.getenv("VOSK_MODEL_PATH", "/home/jojo/models/vosk-model-pt-fb-v0.1.1-pruned/")
    if not os.path.exists(model_path):
        emit({"error": f"vosk model not found: {model_path}"})
        return 1

    try:
        model = Model(model_path)

        with wave.open(wav_path, "rb") as wav_file:
            if wav_file.getnchannels() != 1 or wav_file.getframerate() != 16000:
                emit({"error": "invalid wav format; expected mono 16kHz"})
                return 1

            recognizer = KaldiRecognizer(model, wav_file.getframerate())
            recognizer.SetWords(True)

            text_parts = []
            while True:
                data = wav_file.readframes(4000)
                if len(data) == 0:
                    break
                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    if result.get("text"):
                        text_parts.append(result["text"])

            final_result = json.loads(recognizer.FinalResult())
            if final_result.get("text"):
                text_parts.append(final_result["text"])

        emit({"text": " ".join(text_parts).strip()})
        return 0
    except Exception as exc:
        emit({"error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
