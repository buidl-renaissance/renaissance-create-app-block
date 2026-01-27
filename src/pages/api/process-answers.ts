import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Resend } from 'resend';
import { getUserById } from '@/db/user';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const PRD_NOTIFICATION_EMAIL = 'john@builddetroit.xyz';

/**
 * Helper to get current user from session
 */
async function getCurrentUser(req: NextApiRequest) {
  const cookies = req.headers.cookie || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  
  if (sessionMatch && sessionMatch[1]) {
    return getUserById(sessionMatch[1]);
  }
  return null;
}

interface ProcessedAnswer {
  question: string;
  answer: string;
  keyPoints: string[];
}

interface BlockSummary {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  nextSteps: string[];
}

interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  type: 'single' | 'multi' | 'open';
  options?: string[];
}

interface ProductRequirementsDocument {
  title: string;
  version: string;
  createdAt: string;
  overview: {
    name: string;
    tagline: string;
    description: string;
    problemStatement: string;
  };
  targetAudience: {
    primary: string;
    demographics: string[];
    painPoints: string[];
  };
  features: {
    core: { name: string; description: string; priority: 'must-have' | 'should-have' | 'nice-to-have' }[];
    future: string[];
  };
  technicalRequirements: string[];
  successMetrics: string[];
  timeline: { phase: string; description: string }[];
  risks: string[];
}

interface ProcessAnswersResponse {
  success: boolean;
  answers?: ProcessedAnswer[];
  summary?: BlockSummary;
  followUpQuestions?: FollowUpQuestion[];
  prd?: ProductRequirementsDocument;
  error?: string;
}

/**
 * Send PRD notification email
 */
async function sendPRDEmail(
  prd: ProductRequirementsDocument,
  summary: BlockSummary,
  blockType: string,
  blockName: string,
  userEmail?: string | null
): Promise<boolean> {
  try {
    // Build recipient list - always include notification email, add user if they have email
    const recipients = [PRD_NOTIFICATION_EMAIL];
    if (userEmail && userEmail !== PRD_NOTIFICATION_EMAIL) {
      recipients.push(userEmail);
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; }
    .container { padding: 20px; }
    .header { background: linear-gradient(135deg, #a78bfa 0%, #f5d764 150%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-style: italic; }
    .content { background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; }
    .section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin-bottom: 12px; font-weight: 600; }
    .feature-card { background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #a78bfa; }
    .feature-name { font-weight: 600; color: #1f2937; }
    .feature-desc { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .priority { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 100px; margin-left: 8px; text-transform: uppercase; }
    .priority-must { background: #a78bfa33; color: #7c3aed; }
    .priority-should { background: #fbbf2433; color: #d97706; }
    .priority-nice { background: #e5e7eb; color: #6b7280; }
    .list-item { background: white; padding: 10px 14px; border-radius: 6px; margin-bottom: 6px; font-size: 14px; }
    .timeline-item { display: flex; gap: 12px; margin-bottom: 12px; }
    .timeline-phase { font-weight: 600; color: #7c3aed; min-width: 80px; font-size: 13px; }
    .timeline-desc { color: #4b5563; font-size: 14px; }
    .risk-item { background: #fef2f2; padding: 10px 14px; border-radius: 6px; margin-bottom: 6px; font-size: 14px; color: #991b1b; border-left: 3px solid #ef4444; }
    .meta { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 ${prd.title}</h1>
      <p>${prd.overview.tagline}</p>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Overview</div>
        <p style="margin: 0 0 12px 0;"><strong>Problem:</strong> ${prd.overview.problemStatement}</p>
        <p style="margin: 0;">${prd.overview.description}</p>
        <p style="margin: 12px 0 0 0;"><span class="tag">${blockType}</span> <span class="tag">${blockName}</span></p>
      </div>

      <div class="section">
        <div class="section-title">Target Audience</div>
        <p style="margin: 0 0 8px 0;"><strong>${prd.targetAudience.primary}</strong></p>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong>Demographics:</strong> ${prd.targetAudience.demographics.join(' • ')}
        </p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
          <strong>Pain Points:</strong> ${prd.targetAudience.painPoints.join(' • ')}
        </p>
      </div>

      <div class="section">
        <div class="section-title">Core Features</div>
        ${prd.features.core.map(f => `
          <div class="feature-card">
            <span class="feature-name">${f.name}</span>
            <span class="priority priority-${f.priority === 'must-have' ? 'must' : f.priority === 'should-have' ? 'should' : 'nice'}">${f.priority}</span>
            <div class="feature-desc">${f.description}</div>
          </div>
        `).join('')}
        ${prd.features.future.length > 0 ? `
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280;">
            <strong>Future Ideas:</strong> ${prd.features.future.map(f => typeof f === 'string' ? f : (f as { name?: string }).name || JSON.stringify(f)).join(' • ')}
          </p>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Technical Requirements</div>
        ${prd.technicalRequirements.map(req => `
          <div class="list-item">✦ ${req}</div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Success Metrics</div>
        ${prd.successMetrics.map(metric => `
          <div class="list-item">📊 ${metric}</div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Timeline</div>
        ${prd.timeline.map(item => `
          <div class="timeline-item">
            <span class="timeline-phase">${item.phase}</span>
            <span class="timeline-desc">${item.description}</span>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Risks & Challenges</div>
        ${prd.risks.map(risk => `
          <div class="risk-item">⚠️ ${risk}</div>
        `).join('')}
      </div>

      <div class="meta">
        Version ${prd.version} • Created ${prd.createdAt}
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: 'Renaissance City <john@builddetroit.xyz>',
      to: recipients,
      subject: `📋 PRD: ${prd.overview.name} (${blockType})`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send PRD email:', error);
      return false;
    }

    console.log('✅ PRD email sent to', recipients.join(', '));
    return true;
  } catch (err) {
    console.error('Error sending PRD email:', err);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessAnswersResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Get the current user (for email notifications)
  const user = await getCurrentUser(req);

  const { transcript, questions, blockType, blockName, isFollowUp, previousAnswers, previousSummary } = req.body;

  if (!transcript || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing transcript or questions' 
    });
  }

  // App Block context for the AI
  const appBlockContext = `
WHAT IS AN APP BLOCK?
An App Block is a self-contained application unit that represents a real-world function, community, or activity, designed to stand alone or connect with other App Blocks inside a shared ecosystem. It's not just an app—it's a modular piece of a larger city.

CORE CHARACTERISTICS:

1. Self-Contained
   - Has its own purpose (events, music, games, coordination, commerce, etc.)
   - Can be used independently
   - Owns its UI, logic, and data boundaries

2. Composable
   - Can connect to other App Blocks through shared APIs
   - Can read from or write to shared systems (events, users, rewards, identity)
   - Gains power when connected—but doesn't require it

3. Rooted in Reality
   - Tied to real people, real places, or real activity
   - Supports in-person participation, coordination, or proof of engagement
   - Digital tools that exist because something is happening in the world

4. Claimable
   - Created or claimed by an individual or group
   - Has an owner / steward (not a faceless platform)
   - Ownership implies responsibility, curation, and evolution

5. Evolvable
   - Starts simple
   - Grows features over time
   - Can fork, specialize, or inspire new App Blocks
`;

  let systemPrompt: string;
  let userPrompt: string;

  if (isFollowUp && previousAnswers && previousSummary) {
    // Follow-up processing - generate formal PRD from all collected information
    systemPrompt = `You are a product manager helping someone build a "${blockType}" App Block called "${blockName || 'their block'}" for Renaissance City, a community platform in Detroit.

${appBlockContext}

They've answered initial questions and follow-up clarifying questions. Your job is to:
1. Record their follow-up answers
2. Generate a comprehensive Product Requirements Document (PRD) that can be used to build their App Block

Keep the App Block characteristics in mind—this should be self-contained yet composable, rooted in real-world activity, and designed to evolve over time. Be professional and thorough.`;

    userPrompt = `Here is their previous summary:
${JSON.stringify(previousSummary, null, 2)}

Here are their initial answers:
${previousAnswers.map((a: ProcessedAnswer) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Here are the follow-up questions and their responses:
${transcript}

Please analyze ALL of this and return a JSON object with:

1. "answers" - an array of objects for the follow-up questions, each with:
   - "question": the follow-up question
   - "answer": their selected answer(s) or text response
   - "keyPoints": array of 1-2 key implications of their choice

2. "summary" - an UPDATED summary object:
   - "name": "${previousSummary.name}"
   - "tagline": refined tagline
   - "description": comprehensive 2-3 sentence description
   - "targetAudience": refined audience description  
   - "coreFeatures": array of 3-5 core features
   - "nextSteps": array of 2-3 concrete next steps

3. "prd" - a formal Product Requirements Document object:
   - "title": "${previousSummary.name}"
   - "version": "1.0"
   - "createdAt": "${new Date().toISOString().split('T')[0]}"
   - "overview": {
       "name": the block name,
       "tagline": catchy tagline,
       "description": detailed 3-4 sentence description,
       "problemStatement": what problem this solves (1-2 sentences)
     }
   - "targetAudience": {
       "primary": main user description,
       "demographics": array of 2-4 demographic characteristics,
       "painPoints": array of 2-4 pain points this addresses
     }
   - "features": {
       "core": array of 3-5 objects with "name", "description", and "priority" (must-have/should-have/nice-to-have),
       "future": array of 2-3 future feature ideas
     }
   - "technicalRequirements": array of 2-4 technical needs
   - "successMetrics": array of 3-4 measurable success criteria
   - "timeline": array of 2-3 phases with "phase" name and "description"
   - "risks": array of 2-3 potential risks or challenges

Return ONLY valid JSON, no markdown or explanation.`;

  } else {
    // Initial processing
    systemPrompt = `You are helping someone build a "${blockType}" App Block called "${blockName || 'their block'}" for Renaissance City, a community platform in Detroit.

${appBlockContext}

Your job is to:
1. Extract and organize the answers from their spoken transcript
2. Create a clear, structured document that captures their vision for this App Block
3. Generate strategic follow-up questions that gather NEW information to shape the App Block's direction

Remember: An App Block is self-contained yet composable, rooted in real-world activity, owned by real people, and designed to start simple and evolve. Frame your questions and analysis with these characteristics in mind.

Be encouraging and constructive. If answers are vague or missing, note what could be clarified but don't be critical.`;

    userPrompt = `Here are the ORIGINAL questions they were asked:
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Here is their transcript (spoken answers):
"""
${transcript}
"""

Please analyze this and return a JSON object with:
1. "answers" - an array of objects, each with:
   - "question": the original question
   - "answer": their answer extracted from the transcript (or "Not addressed" if they didn't answer)
   - "keyPoints": array of 1-3 key takeaways from their answer

2. "summary" - an object with:
   - "name": suggested App Block name (use "${blockName}" if provided, or suggest one)
   - "tagline": a short, catchy tagline for the App Block (under 10 words)
   - "description": a 2-3 sentence description of what this App Block will be
   - "targetAudience": who this App Block is for
   - "coreFeatures": array of 3-5 core features or capabilities
   - "nextSteps": array of 2-3 recommended next steps to build this

3. "followUpQuestions" - an array of ONLY the follow-up questions needed to clarify their specific vision. Each question must:
   - "id": a unique identifier like "q1", "q2", etc.
   - "question": a specific, actionable question tailored to THIS app block
   - "context": brief explanation of why this matters for building their App Block
   - "type": one of "single" (pick one), "multi" (pick multiple), or "open" (free text)
   - "options": array of suggested answers (REQUIRED for "single" and "multi" types, omit for "open")

CRITICAL GUIDELINES FOR FOLLOW-UP QUESTIONS:

QUALITY OVER QUANTITY:
- Only include questions that will meaningfully impact how THIS specific App Block is built
- Skip questions if the user already provided sufficient detail
- Aim for 2-5 questions total - fewer is better if their answers were comprehensive

SINGLE-CHOICE ("single" type) RULES:
- Options MUST be mutually exclusive - picking one rules out the others
- Frame as "What is most important?" or "Which approach fits best?" to force prioritization
- 3-4 options is ideal - too many defeats the purpose
- Bad: ["Users", "Events", "Content", "All of the above"] - not mutually exclusive
- Good: ["Prioritize user growth first", "Prioritize content quality first", "Prioritize community engagement first"]

MULTI-CHOICE ("multi" type) RULES:
- Use for features, integrations, or characteristics where multiple can apply
- Options should be distinct capabilities or features
- Good for: "Which integrations matter most?" or "What features are must-haves for launch?"

OPEN-TEXT ("open" type) RULES:
- ONLY use for questions that are SPECIFIC to this App Block's unique concept
- Must ask for concrete details that couldn't be answered with options
- Bad: "What makes your app block unique?" (too generic, any app could be asked this)
- Bad: "Describe your target audience" (already covered in initial questions)
- Good: "What specific ${blockType}-related data or content will users create?" (specific to their concept)
- Good: "Describe a typical session - what does a user do from start to finish?"

DO NOT ASK:
- Questions already answered in the transcript
- Generic questions that apply to any app (monetization, team size, timeline - unless directly relevant)
- Broad philosophical questions ("What problem are you solving?")
- Questions where the answer is obvious from their description

FOCUS QUESTIONS ON:
- Clarifying ambiguous parts of their specific concept
- Technical decisions that affect how THIS app block works
- User flows specific to their ${blockType}
- Data or content structure unique to their idea
- Integration points that make sense for their use case

Return ONLY valid JSON, no markdown or explanation.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsed;
    try {
      // Remove any markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Send PRD email if a PRD was generated
    if (parsed.prd && parsed.summary) {
      sendPRDEmail(
        parsed.prd,
        parsed.summary,
        blockType || 'App Block',
        blockName || parsed.summary.name || 'Untitled',
        user?.email // Include user's email if available
      ).catch(err => {
        // Don't fail the request if email fails
        console.error('PRD email error (non-blocking):', err);
      });
    }

    return res.status(200).json({
      success: true,
      answers: parsed.answers,
      summary: parsed.summary,
      followUpQuestions: parsed.followUpQuestions,
      prd: parsed.prd,
    });

  } catch (error) {
    console.error('Error processing answers:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process answers',
    });
  }
}
