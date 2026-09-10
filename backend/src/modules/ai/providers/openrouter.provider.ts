// import OpenAI from "openai";

// export class OpenRouterProvider {
//   private client: OpenAI;

//   constructor() {
//     this.client = new OpenAI({
//       apiKey: process.env.OPENROUTER_API_KEY,
//       baseURL:
//         process.env.OPENROUTER_BASE_URL ??
//         "https://openrouter.ai/api/v1",
//     });
//   }

//   async chat(
//     message: string,
//     systemPrompt?: string
//   ): Promise<string> {
//     const completion =
//       await this.client.chat.completions.create({
//         model:
//           process.env.OPENROUTER_MODEL ??
//           "deepseek/deepseek-chat-v3-0324:free",

//         messages: [
//           ...(systemPrompt
//             ? [
//                 {
//                   role: "system" as const,
//                   content: systemPrompt,
//                 },
//               ]
//             : []),

//           {
//             role: "user",
//             content: message,
//           },
//         ],
//       });

//     return (
//       completion.choices[0]?.message?.content ??
//       "Maaf, saya tidak bisa menjawab."
//     );
//   }
// }