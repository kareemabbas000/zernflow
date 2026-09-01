import { logger } from "@/lib/logger";

interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

// In-memory transcription cache by audio URL to avoid redundant billable API calls
const transcriptionCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Universal Audio Transcriber for Flow AI Nodes
 *
 * Supports incoming voice notes and audio clips from:
 * - WhatsApp (OGG / OPUS, AAC)
 * - Instagram DM (MP4 / AAC / M4A)
 * - Facebook Messenger (MP4 / AAC / MP3)
 * - Telegram (OGG / OGA / MP3)
 * - X / Twitter (MP4 / AAC)
 *
 * Transcribes using OpenAI Whisper or Groq Whisper (multi-model scalable).
 */
export async function transcribeAudio({
  audioUrl,
  apiKey,
}: {
  audioUrl: string;
  apiKey?: string | null;
}): Promise<TranscriptionResult | null> {
  if (!audioUrl) return null;

  // Check cache first
  const cached = transcriptionCache.get(audioUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { text: cached.text };
  }

  try {
    // 1. Download audio file from platform CDN
    const response = await fetch(audioUrl, {
      headers: {
        "User-Agent": "ZernFlow-Audio-Transcriber/1.0",
      },
    });

    if (!response.ok) {
      logger.error("[audio-transcriber] Failed to download audio stream", {
        status: response.status,
        url: audioUrl,
      });
      return null;
    }

    const contentType = response.headers.get("content-type") || "audio/ogg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      logger.warn("[audio-transcriber] Downloaded audio buffer is empty");
      return null;
    }

    // Determine appropriate file extension based on MIME type
    let fileName = "voicenote.ogg";
    if (contentType.includes("mp4") || contentType.includes("m4a")) {
      fileName = "voicenote.m4a";
    } else if (contentType.includes("mpeg") || contentType.includes("mp3")) {
      fileName = "voicenote.mp3";
    } else if (contentType.includes("wav")) {
      fileName = "voicenote.wav";
    } else if (contentType.includes("aac")) {
      fileName = "voicenote.aac";
    }

    const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.AI_GATEWAY_API_KEY;

    if (!effectiveApiKey) {
      logger.warn("[audio-transcriber] No AI API Key available for audio transcription");
      return null;
    }

    const isGroq = effectiveApiKey.startsWith("gsk_") || Boolean(process.env.GROQ_API_KEY);
    const endpoint = isGroq
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";

    const modelName = isGroq ? "whisper-large-v3-turbo" : "whisper-1";

    const blob = new Blob([buffer], { type: contentType });
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("model", modelName);
    formData.append("response_format", "json");

    const transcribeRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${effectiveApiKey}`,
      },
      body: formData,
    });

    if (!transcribeRes.ok) {
      const errText = await transcribeRes.text();
      logger.error("[audio-transcriber] Transcription API returned error", {
        status: transcribeRes.status,
        error: errText,
      });
      return null;
    }

    const data = await transcribeRes.json();
    const transcribedText = (data.text || "").trim();

    if (transcribedText) {
      // Store in cache
      transcriptionCache.set(audioUrl, {
        text: transcribedText,
        timestamp: Date.now(),
      });
      return {
        text: transcribedText,
        language: data.language,
        duration: data.duration,
      };
    }

    return null;
  } catch (err) {
    logger.error("[audio-transcriber] Unexpected error during audio transcription", err);
    return null;
  }
}
