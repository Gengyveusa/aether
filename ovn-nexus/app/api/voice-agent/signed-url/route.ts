export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * GET /api/voice-agent/signed-url
 *
 * Generates a signed WebSocket URL for a secure ElevenLabs Voice Agent session.
 * The API key stays server-side and is never exposed to the client.
 *
 * Query params:
 *   agentId (optional) - override the default agent ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId =
      searchParams.get('agentId') ||
      process.env.ELEVENLABS_AGENT_ID;

    if (!agentId) {
      return NextResponse.json(
        { error: 'ELEVENLABS_AGENT_ID is not configured' },
        { status: 500 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs signed URL error:', error);
      return NextResponse.json(
        { error: 'Failed to get signed URL from ElevenLabs' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error('Voice agent signed URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
