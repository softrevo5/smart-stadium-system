import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GateStatus, ConcessionStatus, Incident, StadiumState } from '@/lib/types';

// System instructions per user role
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  fan: `You are the FIFA World Cup 2026 Smart Stadium Companion. Your goal is to help fans navigate the venue, enjoy their experience, and adopt sustainable practices.
Guidelines:
- Keep answers friendly, enthusiastic, and concise. Use markdown formatting where appropriate.
- Help them choose the least congested gates, find sustainable concessions (with vegan or green options), and use free eco-shuttles or public transit.
- Provide accessibility advice (e.g., recommend Gates A, B, or D for wheelchair/ramp access; warn them that Gate C has stairs only).
- Ground your responses in the LIVE STADIUM STATE provided. If a fan asks about queues, check the concession or gate lists in the live state.`,

  organizer: `You are the Lead Tournament Operations Officer (GenAI Command Center) for the FIFA World Cup 2026. Your role is real-time decision support, incident routing, and security coordination.
Guidelines:
- Keep responses professional, highly structured, analytical, and actionable. Use bullet points and bold highlights.
- Reference stadium security guidelines, emergency protocol, and active gate/restroom statuses in your answers.
- When assisting with incidents, draft an immediate action plan (e.g., dispatch medical team with AED, redirect fans from Gate B to Gate A, dispatch janitorial staff).
- Help coordinate volunteer placement and resource balancing based on current crowd density.`,

  volunteer: `You are the Volunteer Coordinator Assistant for the FIFA World Cup 2026. Your job is to help volunteers with shift guidelines, crowd direction protocols, and stadium rules.
Guidelines:
- Be encouraging, supportive, and clear.
- Explain protocols for lost children, spectator guidelines, translations, and ticketing issues.
- Remind volunteers of the FIFA "Green Team" waste diversion goals (e.g., ensuring fans sort recyclables into blue bins).`,

  staff: `You are the Venue Operations Support for the FIFA World Cup 2026. You assist maintenance, security, ticketing, and catering crews.
Guidelines:
- Be concise, direct, and practical.
- Focus on safety, ticket scanner configurations, trash collection logs, and fast dispatch routing.
- Provide step-by-step resolution steps for technical or facility requests.`
};

export async function POST(req: NextRequest) {
  let body: { role?: string; messages?: { role: 'user' | 'model'; content: string }[]; stadiumState?: StadiumState | null } = {};

  try {
    body = await req.json();
  } catch (parseError) {
    console.error('Failed to parse request JSON:', parseError);
    return NextResponse.json(
      { error: 'Failed to process request', details: 'Malformed JSON body' },
      { status: 500 }
    );
  }

  const { role = 'fan', messages = [], stadiumState = null } = body;

  try {
    // Initialize Gemini API client safely on each request (supports dynamic environment variables)
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

    // Build the grounding context based on the current state of the stadium
    let groundingContext = '--- CURRENT LIVE STADIUM STATE ---\n';
    if (stadiumState) {
      groundingContext += `Time context: ${stadiumState.timeUntilMatch}\n`;
      groundingContext += `Attendance: ${stadiumState.currentCapacity} / ${stadiumState.totalAttendance} inside\n`;
      groundingContext += `Solar Grid Output: ${stadiumState.solarPowerOutput} kW, Waste Diversion: ${stadiumState.wasteDiversion}%, Water Saved: ${stadiumState.waterSaved} Gal\n\n`;

      groundingContext += 'Gates:\n';
      stadiumState.gates.forEach((g: GateStatus) => {
        groundingContext += `- ${g.name}: Congestion is ${g.congestion.toUpperCase()}, Wait: ${g.estimatedWait}m, Flow: ${g.flowRate} p/min, Accessible Ramps: ${g.accessibleRamps ? 'Yes' : 'No'}. Notes: ${g.notes || 'None'}\n`;
      });

      groundingContext += '\nConcessions:\n';
      stadiumState.concessions.forEach((c: ConcessionStatus) => {
        groundingContext += `- ${c.name} (${c.type}): Queue size is ${c.queueSize} people, Wait: ${c.estimatedWait}m. Highlight eco item: "${c.featuredGreenItem}"\n`;
      });

      groundingContext += '\nActive Incidents:\n';
      if (stadiumState.incidents.length === 0) {
        groundingContext += '- No active incidents.\n';
      } else {
        stadiumState.incidents.forEach((i: Incident) => {
          groundingContext += `- [${i.severity.toUpperCase()}] ${i.title} at ${i.location} (Status: ${i.status.toUpperCase()}) reported at ${i.timestamp}. Description: ${i.description}\n`;
        });
      }
    } else {
      groundingContext += 'Stadium state unavailable.\n';
    }
    groundingContext += '-----------------------------------\n';

    // Verify API client initialization
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API Key is not configured', details: 'Please set the GEMINI_API_KEY environment variable in your .env configuration file.' },
        { status: 401 }
      );
    }

    // Format chat history for Gemini API
    // Gemini API expects structure like: { role: 'user' | 'model', parts: [{ text: string }] }
    // Ensure we send system context in the final user message to ground it
    const contents = [];

    // Add past history (limit to last 6 messages to keep it efficient)
    const recentMessages = messages.slice(-6);
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const msg = recentMessages[i];
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Ground the last user message with live stadium context
    const lastUserMessage = recentMessages[recentMessages.length - 1];
    const groundedPrompt = `${groundingContext}\n\nUser Question: ${lastUserMessage.content}`;
    contents.push({
      role: 'user',
      parts: [{ text: groundedPrompt }]
    });

    let responseText = '';
    let success = false;
    let apiError: unknown = null;

    // List of model names to try in order of preference
    const modelsToTry = [
      'gemini-2.5-flash'
    ];

    for (const modelName of modelsToTry) {
      // 1. Try enabling Google Search grounding to retrieve real-time tournament details, fixtures, transit schedules
      try {
        console.log(`Attempting generateContent with search grounding on ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTIONS[role] || SYSTEM_INSTRUCTIONS.fan,
          tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent({
          contents,
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.2, // Low temperature for high factual accuracy in stadium directions
          }
        });

        responseText = result.response.text();
        success = true;
        break; // Successfully generated content, exit loop
      } catch (groundingErr) {
        console.warn(`Search grounding failed or not supported in this API key tier, falling back to standard generation:`, groundingErr);
        
        // 2. Fall back to standard generation without external search tools
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_INSTRUCTIONS[role] || SYSTEM_INSTRUCTIONS.fan
          });

          const result = await model.generateContent({
            contents,
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.2,
            }
          });

          responseText = result.response.text();
          success = true;
          break; // Successfully generated content, exit loop
        } catch (err) {
          apiError = err;
          console.error(`Error with model ${modelName} in standard generation fallback:`, err);
        }
      }
    }

    if (!success) {
      throw apiError || new Error('All model attempts failed');
    }

    return NextResponse.json({
      content: responseText,
      role: 'model'
    });

  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', details: message },
      { status: 500 }
    );
  }
}
