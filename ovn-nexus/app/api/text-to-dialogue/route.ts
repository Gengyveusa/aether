import { NextResponse } from 'next/server';

/**
 * POST /api/text-to-dialogue
 *
 * Generates expressive multi-speaker audio from a clinical dialogue script
 * using ElevenLabs Eleven v3 model (Text to Dialogue).
 *
 * Request body:
 * {
 *   turns: Array<{
 *     speaker: string,       // e.g. 'doctor', 'patient', 'narrator'
 *     voiceId: string,       // ElevenLabs voice ID
 *     text: string,          // text with optional [audio tags]
 *   }>,
 *   outputFormat?: string    // default: 'mp3_44100_128'
 * }
 *
 * Returns: audio/mpeg stream
 */

interface DialogueTurn {
  speaker: string;
  voiceId: string;
  text: string;
}

interface DialogueRequest {
  turns: DialogueTurn[];
  outputFormat?: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body: DialogueRequest = await request.json();
    const { turns, outputFormat = 'mp3_44100_128' } = body;

    if (!turns || turns.length === 0) {
      return NextResponse.json(
        { error: 'turns array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Build the dialogue inputs array for ElevenLabs API
    const inputs = turns.map((turn) => ({
      text: turn.text,
      voice_id: turn.voiceId,
    }));

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-dialogue',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: process.env.ELEVENLABS_TEXT_TO_DIALOGUE_MODEL || 'eleven_v3',
          inputs,
          output_format: outputFormat,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs Text to Dialogue error:', error);
      return NextResponse.json(
        { error: 'Failed to generate dialogue audio' },
        { status: response.status }
      );
    }

    // Stream back the audio
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Text to dialogue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
