import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client server-side
const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentTopics, availableHours, dayType, completedSubtopics } = body;

    const prompt = `
You are an AI study planner for Complete interview preparation. Create a detailed daily study plan.

Context:
- Available study hours today: ${availableHours}
- Day type: ${dayType}
- Current topics to focus on: ${currentTopics.map((t: any) => t.title).join(', ')}
- Completed subtopics: ${completedSubtopics.length}

Please create a structured daily study plan with specific time slots and activities.

Format your response as JSON:
{
  "studyPlan": {
    "timeSlots": [
      {
        "startTime": "10:00 AM",
        "endTime": "11:30 AM",
        "activity": "Review C++ Fundamentals - Variables and Data Types",
        "priority": "high",
        "type": "theory"
      }
    ],
    "tips": ["tip1", "tip2", "tip3"],
    "focusAreas": ["area1", "area2"],
    "practiceProblems": ["problem1", "problem2"]
  }
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert C++ tutor creating personalized daily study plans.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
    
    return NextResponse.json({
      success: true,
      data: aiResponse,
    });

  } catch (error) {
    console.error('Error generating daily study plan:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate daily study plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 