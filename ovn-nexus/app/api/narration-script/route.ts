import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

function buildSystemPrompt(opts: NarrationOptions): string {
  const {
    style = 'clinical-pearls',
    targetAudience = 'oms-resident',
    duration = 60,
    narrator = 'eryn',
    specialty = 'oral and maxillofacial surgery',
    slideIndex,
    totalSlides,
  } = opts;

  const audienceMap: Record<string, string> = {
    'dental-student': 'a dental student learning core concepts',
    'oms-resident': 'an oral and maxillofacial surgery resident with clinical exposure',
    attending: 'an attending surgeon seeking concise clinical pearls',
    patient: 'a patient who needs clear, jargon-free explanation',
  };

  const styleMap: Record<string, string> = {
    didactic: 'Use a structured, lecture-style delivery with clear explanations.',
    'case-based': 'Frame content around a clinical scenario or case.',
    socratic: 'Use rhetorical questions to guide the learner through reasoning.',
    'clinical-pearls': 'Deliver crisp, high-yield clinical insights and mnemonics.',
  };

  const slideContext =
    slideIndex !== undefined && totalSlides !== undefined
      ? `This is slide ${slideIndex + 1} of ${totalSlides}.`
      : '';

  return `You are a world-class medical educator specializing in ${specialty}.
Your task is to generate a spoken narration script for a presentation slide.

AUDIENCE: ${audienceMap[targetAudience] ?? audienceMap['oms-resident']}
STYLE: ${styleMap[style] ?? styleMap['clinical-pearls']}
TARGET DURATION: approximately ${duration} seconds when read aloud.
${slideContext}

NARRATOR SETUP:
${
  narrator === 'both'
    ? 'Use TWO speakers in dialogue format.\n- Speaker 1 (ERYN): Lead narrator, expert clinician voice.\n- Speaker 2 (PETER): Discussant, asks clarifying questions or adds nuance.\nFormat each line as: [ERYN]: ... or [PETER]: ...'
    : `Single narrator (${narrator.toUpperCase()}). Write in a natural, spoken voice — not a lecture script.`
}

OUTPUT FORMAT (JSON only, no markdown):
{
  "script": "full spoken text",
  "slideTitle": "inferred title from slide content",
  "keyPoints": ["bullet1", "bullet2", "bullet3"],
  "speakers": [
    { "speaker": "ERYN", "voiceId": "eryn", "text": "..." }
  ],
  "estimatedDuration": 60
}

IMPORTANT:
- Do NOT use markdown in the script field.
- Speak to the audience, not AT the slide.
- Keep it tight: no filler phrases.
- For dialogue, alternate naturally between speakers.`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    let imageBase64: string | null = null;
    let mimeType = 'image/png';
    let imageUrl: string | null = null;
    let options: NarrationOptions = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const optionsStr = formData.get('options') as string | null;

      if (file) {
        mimeType = file.type || 'image/png';
        const arrayBuffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuffer).toString('base64');
      }

      if (optionsStr) {
        try {
          options = JSON.parse(optionsStr);
        } catch {
          // use defaults
        }
      }

      // Also parse flat fields from form
      const style = formData.get('style') as string | null;
      const targetAudience = formData.get('targetAudience') as string | null;
      const duration = formData.get('duration') as string | null;
      const narrator = formData.get('narrator') as string | null;

      if (style) options.style = style as NarrationOptions['style'];
      if (targetAudience) options.targetAudience = targetAudience as NarrationOptions['targetAudience'];
      if (duration) options.duration = parseInt(duration) as NarrationOptions['duration'];
      if (narrator) options.narrator = narrator as NarrationOptions['narrator'];
    } else {
      const body = await request.json();
      imageUrl = body.imageUrl ?? null;
      imageBase64 = body.imageBase64 ?? null;
      mimeType = body.mimeType ?? 'image/png';
      options = {
        narrator: body.narrator,
        style: body.style,
        targetAudience: body.targetAudience,
        duration: body.duration,
        specialty: body.specialty,
        slideIndex: body.slideIndex,
        totalSlides: body.totalSlides,
        previousScript: body.previousScript,
      };
    }

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'No image provided. Send file (multipart) or imageUrl/imageBase64 (JSON).' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(options);

    // Build image content part with proper typing
    const imageContent = imageBase64
      ? ({
          type: 'image_url' as const,
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
            detail: 'high' as const,
          },
        } as { type: 'image_url'; image_url: { url: string; detail: 'high' } })
      : ({
          type: 'image_url' as const,
          image_url: {
            url: imageUrl as string,
            detail: 'high' as const,
          },
        } as { type: 'image_url'; image_url: { url: string; detail: 'high' } });

    const completion = await (openai.chat.completions.create as Function)({
      model: 'gpt-4o',
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this slide and generate the narration script as specified.',
            },
            imageContent,
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from the response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = {
          script: raw,
          slideTitle: 'Slide Narration',
          keyPoints: [],
          speakers: [
            { speaker: options.narrator?.toUpperCase() ?? 'ERYN', voiceId: options.narrator ?? 'eryn', text: raw },
          ],
          estimatedDuration: options.duration ?? 60,
        };
      }
    }

    return NextResponse.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o',
      options,
    });
  } catch (err: unknown) {
    console.error('[narration-script] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
