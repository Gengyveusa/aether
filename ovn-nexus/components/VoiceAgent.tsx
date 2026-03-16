'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

interface VoiceAgentProps {
  /** ElevenLabs Agent ID (use NEXT_PUBLIC_ELEVENLABS_AGENT_ID env var) */
  agentId?: string;
  /** Display name of the patient or tutor */
  patientName?: string;
  /** Clinical scenario description shown in the UI */
  scenario?: string;
  /** Custom system prompt override */
  systemPrompt?: string;
  /** Callback when conversation ends */
  onConversationEnd?: (conversationId: string) => void;
}

/**
 * VoiceAgent - Real-time voice conversation component for OVN Nexus
 *
 * Enables students to have live spoken conversations with AI-powered
 * clinical simulations (patients, tutors, or examiners).
 *
 * Prerequisites:
 *   npm install @elevenlabs/react
 *
 * Environment variables:
 *   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id
 *
 * Usage:
 *   <VoiceAgent
 *     agentId="your-agent-id"
 *     patientName="Mr. Johnson"
 *     scenario="Periapical abscess, right mandibular molar"
 *   />
 */
export function VoiceAgent({
  agentId,
  patientName = 'Patient',
  scenario = '',
  systemPrompt,
  onConversationEnd,
}: VoiceAgentProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
      console.log('[VoiceAgent] Connected');
    },
    onDisconnect: () => {
      console.log('[VoiceAgent] Disconnected');
      if (conversationId && onConversationEnd) {
        onConversationEnd(conversationId);
      }
    },
    onError: (err) => {
      console.error('[VoiceAgent] Error:', err);
      setError('Connection error. Please try again.');
    },
    ...(systemPrompt && {
      overrides: {
        agent: {
          prompt: { prompt: systemPrompt },
        },
      },
    }),
  });

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const effectiveAgentId =
        agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

      if (!effectiveAgentId) {
        setError('No agent ID configured. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID.');
        return;
      }

      // Get a signed URL from our server-side route (keeps API key secret)
      const res = await fetch(
        `/api/voice-agent/signed-url?agentId=${effectiveAgentId}`
      );
      if (!res.ok) throw new Error('Failed to get signed URL');
      const { signedUrl } = await res.json();

      const convId = await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
      });
      setConversationId(convId);
    } catch (err) {
      console.error('[VoiceAgent] Start error:', err);
      setError('Failed to start conversation. Check microphone permissions.');
    }
  }, [agentId, conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {isConnected ? `Speaking with ${patientName}` : patientName}
        </h3>
        {scenario && (
          <p className="text-sm text-muted-foreground mt-1">{scenario}</p>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full transition-colors ${
            isConnected
              ? isSpeaking
                ? 'bg-blue-500 animate-pulse'
                : 'bg-green-500'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {!isConnected && 'Ready'}
          {isConnected && !isSpeaking && 'Listening...'}
          {isConnected && isSpeaking && `${patientName} is speaking...`}
        </span>
      </div>

      {/* Controls */}
      {!isConnected ? (
        <button
          onClick={startConversation}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Start Conversation
        </button>
      ) : (
        <button
          onClick={stopConversation}
          className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
        >
          End Conversation
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center max-w-xs">{error}</p>
      )}

      {/* Conversation ID (for logging/analysis) */}
      {conversationId && (
        <p className="text-xs text-muted-foreground">
          Session: {conversationId}
        </p>
      )}
    </div>
  );
}
