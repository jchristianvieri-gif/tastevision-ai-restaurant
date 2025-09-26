// lib/langchain/productExtractor.ts
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

export class ProductExtractor {
  private model: OpenAI;
  private prompt: PromptTemplate;

  constructor() {
    this.model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      temperature: 0.1,
      maxTokens: 500,
    });

    this.prompt = new PromptTemplate({
      template: `
      Analyze this restaurant product image and extract the following information:
      - Product name
      - Short description (max 50 words)
      - Price in IDR format

      Image context: {imageContext}
      Additional text found: {extractedText}

      Return ONLY JSON format:
      {{
        "name": "product name",
        "description": "short description",
        "price": "price in number without currency symbol"
      }}

      If price is not clear, estimate based on similar restaurant items.
      `,
      inputVariables: ["imageContext", "extractedText"],
    });
  }

  async extractProductInfo(imageContext: string, extractedText: string = "") {
    try {
      const chain = new LLMChain({
        llm: this.model,
        prompt: this.prompt,
      });

      const response = await chain.call({
        imageContext,
        extractedText,
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI extraction error:", error);
      throw new Error("Failed to extract product information");
    }
  }
}
