import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI Clients
const openRouter = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5175', // Optional, for including your app on openrouter.ai rankings.
    'X-Title': 'PRAJNA AI Companion', // Optional. Shows in rankings on openrouter.ai.
  }
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const bedrock = process.env.AWS_ACCESS_KEY_ID ? new BedrockRuntimeClient({ region: 'us-east-1' }) : null;

// Mock Faculty Data for AI Context
const facultyProfile = {
  name: 'Dr. Priya',
  designation: 'Associate Professor',
  department: 'Computer Science',
  campus: 'Bengaluru',
  score: {
    total: 78,
    tier: 'Gold',
    breakdown: { teaching: 22, research: 25, fdp: 15, achievements: 8, admin: 5, profile: 3 }
  },
  pendingTasks: [
    { title: 'Mark attendance for CSE-301', dueDate: 'Today' },
    { title: 'Submit FDP certificate', dueDate: 'Tomorrow' }
  ]
};

app.post('/api/ai/chat', async (req, res) => {
  const { message, history } = req.body;

  const systemPrompt = `You are PRAJNA, a warm and encouraging professional AI companion for ${facultyProfile.name}, a ${facultyProfile.designation} in the ${facultyProfile.department} department at GITAM University ${facultyProfile.campus}.
Current PRAJNA Score: ${facultyProfile.score.total}/100 (${facultyProfile.score.tier} tier).
Pending Tasks: ${facultyProfile.pendingTasks.map(t => `- ${t.title}`).join('\n')}.
Keep responses concise, actionable, and encouraging. Never be generic.`;

  try {
    if (process.env.OPENROUTER_API_KEY && openRouter) {
      console.log('Using OpenRouter API...');
      
      // Convert history format to OpenAI format
      const mappedHistory = history.map(h => ({
        role: h.role === 'ai' ? 'assistant' : 'user',
        content: h.content
      }));

      const completion = await openRouter.chat.completions.create({
        model: "openrouter/free", // Uses the best available free model on OpenRouter
        messages: [
          { role: "system", content: systemPrompt },
          ...mappedHistory,
          { role: "user", content: message }
        ],
      });
      return res.json({ reply: completion.choices[0].message.content });
    } else if (process.env.ANTHROPIC_API_KEY && anthropic) {
      console.log('Using Anthropic API...');
      const msg = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [...history, { role: "user", content: message }]
      });
      return res.json({ reply: msg.content[0].text });
    } else if (process.env.AWS_ACCESS_KEY_ID && bedrock) {
      console.log('Using AWS Bedrock API...');
      const response = await bedrock.send(new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [...history, { role: "user", content: message }],
        }),
        contentType: 'application/json',
        accept: 'application/json',
      }));
      const result = JSON.parse(new TextDecoder().decode(response.body));
      return res.json({ reply: result.content[0].text });
    } else {
      console.log('Using Rule-Based Fallback Engine...');
      const lowerMessage = message.toLowerCase();
      let reply = "I'm here to help you navigate your academic journey at GITAM! ";
      if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('pending')) {
        reply = `You have ${facultyProfile.pendingTasks.length} pending tasks: ${facultyProfile.pendingTasks.map(t => t.title).join(', ')}. Need help with any of these?`;
      } else if (lowerMessage.includes('score') || lowerMessage.includes('rank') || lowerMessage.includes('tier')) {
        reply = `You are currently in the ${facultyProfile.score.tier} tier with a score of ${facultyProfile.score.total}. Your research score is looking great! Consider publishing another Q1 journal to reach the Platinum tier.`;
      } else {
        reply = `That sounds interesting. As your PRAJNA companion, I recommend focusing on your upcoming FDP certificate submission to boost your score. How can I assist further? (Note: This is the rule-based fallback. Provide OPENROUTER_API_KEY in .env for the full LLM experience!)`;
      }
      return res.json({ reply });
    }
  } catch (error) {
    console.error('Error in AI processing:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

app.listen(3001, () => {
  console.log('Local API Server running on port 3001');
});
