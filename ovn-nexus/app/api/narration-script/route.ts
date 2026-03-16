import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/narration-script
 *
 * Uses GPT-4o Vision to read a slide image and generate a
 * narration script with ElevenLabs audio tags ready for
 * Text to Dialogue rendering.
 *
 * Request body (multipart/form-data OR JSON):
 *
 *   Multipart:
 *     image: File  (PNG, JPEG, WebP, GIF)
 *     options?: JSON string of NarrationOptions
 *
 *   JSON:
 *     imageUrl: string      (publicly accessible URL)
 *     imageBase64: string   (base64-encoded image, no data URI prefix)
 *     mimeType?: string     (default: 'image/png')
 *     options?: NarrationOptions
 *
 * NarrationOptions:
 *   narrator:       'eryn' | 'peter' | 'both'  (default: 'eryn')
 *   style:          'didactic' | 'case-based' | 'socratic' | 'clinical-pearls'
 *   targetAudience: 'dental-student' | 'oms-resident' | 'attending' | 'patient'
 *   duration:       30 | 60 | 90 | 120   (seconds, default: 60)
 *   specialty:      string  (e.g. 'oral and maxillofacial surgery')
 *   slideIndex:     number  (slide number in the deck, for context)
 *   totalSlides:    number  (total slides in deck)
 *   previousScript: string  (optional: prior slide script for continuity)
 *
 * Returns:
 * {
 *   script: string           // full narration text with [audio tags]
 *   speakers: Speaker[]      // turn-by-turn breakdown for Text to Dialogue
 *   slideTitle: string       // GPT-extracted slide title
 *   keyPoints: string[]      // GPT-extracted key learning points
 *   estimatedDuration: number // estimated seconds
 *   suggestedVoiceId: string  // Eryn or Peter voice ID
 * }
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NarrationOptions {
  narrator?: 'eryn' | 'peter' | 'both';
  style?: 'didactic' | 'case-based' | 'socratic' | 'clinical-pearls';
  targetAudience?: 'dental-student' | 'oms-resident' | 'attending' | 'patient';
  duration?: 30 | 60 | 90 | 120;
  specialty?: string;
  slideIndex?: number;
  totalSlides?: number;
  previousScript?: string;
}

interface Speaker {
  speaker: string;
  voiceId: string;
  text: string;
}

const VOICE_IDS = {
  eryn: process.env.ELEVENLABS_VOICE_ID_ERYN || 'WuBPEavIaQB56EnsGvFh',
  peter: process.env.ELEVENLABS_VOICE_ID_PETER || 'EapdDtSsMC291mjfSNe7',
};

function buildSystemPrompt(options: NarrationOptions): string {
  const audience = options.targetAudience || 'oms-resident';
  const style = options.style || 'didactic';
  const specialty = options.specialty || 'oral and maxillofacial surgery';
  const duration = options.duration || 60;
  const narrator = options.narrator || 'eryn';

  const audienceMap: Record<string, string> = {
    'dental-student': 'dental students in their clinical years',
    'oms-resident': 'oral and maxillofacial surgery residents',
    'attending': 'attending surgeons seeking a refresher',
    'patient': 'patients seeking to understand their condition',
  };

  const styleMap: Record<string, string> = {
    'didactic':
      'Clear, structured didactic teaching. State the concept, explain it, give an example.',
    'case-based':
      'Case-based learning. Open with a clinical scenario, build toward the teaching point.',
    'socratic':
      'Socratic method. Pose questions that guide the learner to discover the answer.',
    'clinical-pearls':
      'Practical clinical pearls. Focus on what practitioners actually need to know at the bedside.',
  };

  const narratorName = narrator === 'peter' ? 'Peter' : 'Eryn';

  return `You are ${narratorName}, an expert educator in ${specialty}.
Your audience is ${audienceMap[audience]}.
Teaching style: ${styleMap[style]}
Target duration: approximately ${duration} seconds of spoken audio (~${Math.round(duration * 2.5)} words).

Your task:
1. Read the slide carefully — all text, labels, diagrams, tables, and figures.
2. Write a narration script that teaches the content on the slide.
3. Output ONLY valid JSON matching the schema below — no markdown, no preamble.

ElevenLabs Audio Tag Rules:
- Wrap emotional cues in square brackets: [thoughtfully], [emphasizing], [gently], [with concern], [enthusiastically], [clinically]
- Use [pause] for a beat of silence between concepts
- For case-based style, open with [dramatically] or [setting the scene]
- Keep tags natural — 1 tag per 2-3 sentences maximum

Output JSON schema:
{
  "slideTitle": "string — the main topic of the slide",
  "keyPoints": ["array of 2-5 core learning points"],
  "script": "string — full narration with [audio tags] interspersed",
  "speakers": [
    {
      "speaker": "${narratorName}",
      "voiceId": "${VOICE_IDS[narrator === 'peter' ? 'peter' : 'eryn']}",
      "text": "string — narration text with [audio tags]"
    }
  ],
  "estimatedDuration": number
}`;
}

function buildUserPrompt(options: NarrationOptions): string {
  const parts: string[] = ['Please analyze this slide and generate the narration script.'];

  if (options.slideIndex !== undefined && options.totalSlides !== undefined) {
    parts.push(
      `This is slide ${options.slideIndex} of ${options.totalSlides} in the deck.`
    );
  }

  if (options.previousScript) {
    parts.push(
      `For continuity, the previous slide's narration ended with: "${options.previousScript.slice(-200)}"`
    );
  }

  return parts.join(' ');
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    let imageUrl: string | null = null;
    let options: NarrationOptions = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;
      const optionsStr = formData.get('options') as string | null;

      if (!imageFile) {
        return NextResponse.json(
          { error: 'image field is required in form data' },
          { status: 400 }
        );
      }

      if (optionsStr) {
        try {
          options = JSON.parse(optionsStr);
        } catch {
          return NextResponse.json(
            { error: 'options must be valid JSON' },
            { status: 400 }
          );
        }
      }

      // Convert file to base64 data URL
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mime = imageFile.type || 'image/png';
      imageUrl = `data:${mime};base64,${base64}`;
    } else {
      // Handle JSON body
      const body = await request.json();
      const { imageBase64, imageUrl: providedUrl, mimeType = 'image/png', options: bodyOptions } = body;

      if (!imageBase64 && !providedUrl) {
        return NextResponse.json(
          { error: 'Provide either imageBase64, imageUrl, or multipart image upload' },
          { status: 400 }
        );
      }

      options = bodyOptions || {};

      if (providedUrl) {
        imageUrl = providedUrl;
      } else {
        imageUrl = `data:${mimeType};base64,${imageBase64}`;
      }
    }

    // Call GPT-4o Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(options),
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // Use high detail for medical/educational slides
              },
            },
            {
              type: 'text',
              text: buildUserPrompt(options),
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: 'No response from GPT-4o' },
        { status: 500 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: 'GPT-4o returned invalid JSON', raw: rawContent },
        { status: 500 }
      );
    }

    // Inject real voice IDs if speakers array is present
    if (Array.isArray(parsed.speakers)) {
      parsed.speakers = (parsed.speakers as Speaker[]).map((s) => ({
        ...s,
        voiceId:
          s.speaker?.toLowerCase().includes('peter')
            ? VOICE_IDS.peter
            : VOICE_IDS.eryn,
      }));
    }

    // Add usage metadata
    const response = {
      ...parsed,
      meta: {
        model: 'gpt-4o',
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Narration script error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
