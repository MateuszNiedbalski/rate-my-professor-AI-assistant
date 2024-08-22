import { NextResponse } from 'next/server' // Import NextResponse from Next.js for handling responses
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const systemPrompt = "You are a customer support assistant for Headstarter. Headstarter is a company that runs programmes from people to learn AI skills through project based learning, AI interviews and teaching people networking skills. You must answer under 50 words";

// Gemini model with systemInstruction
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
});


export async function POST(req) {
  const data = await req.json();

  // Instantiate chat request to the API using previous chat history
  const chat = model.startChat({
    history: [
      ...data.slice(1, data.length - 1), // Omit user input from current history
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  // (DEBUG) POST Request body
  console.log("DATA:" + JSON.stringify(data));
  // (DEBUG) UserInput
  console.log("INPUT:" + JSON.stringify(data[data.length-1].parts[0].text));

  // Sends user input to the chat model
  const result = await chat.sendMessageStream(data[data.length-1].parts[0].text);

  /* (Deprecated)
  let text = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    text += chunkText;
  };
  */

  // New ReadableStream to handle stream response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        // Iterate over the streamed chunks of response
        for await (const chunk of result.stream) {
          const content = chunk.text();

          if (content) {
            console.log(content);
            controller.enqueue(encoder.encode(content));
          }
        }

      } catch (err) {
        // Handle errors occured during streaming
        controller.error(err);
      } finally {
        // Close the stream when done
        controller.close();
      }
    }
  })

  // Return the stream response
  return new NextResponse(stream);
}