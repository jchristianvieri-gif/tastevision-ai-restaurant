// packages/ai/product-extractor.ts
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export class AIProductExtractor {
  private model: ChatOpenAI;
  private extractionChain: RunnableSequence;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4-vision-preview",
      maxTokens: 1000,
      temperature: 0.1,
    });

    this.extractionChain = RunnableSequence.from([
      {
        image: (input: { image: string }) => input.image,
        prompt: () => this.createExtractionPrompt()
      },
      this.model,
      new StringOutputParser(),
      (output: string) => this.parseExtractionResult(output)
    ]);
  }

  private createExtractionPrompt() {
    return `You are an expert at analyzing restaurant menu images. Extract the following information:

REQUIRED FIELDS:
- name: Product name (string)
- description: Brief description 1-2 sentences (string)
- price: Price in IDR (number)
- category: food, drink, or dessert (string)

EXTRACTION RULES:
1. If price is not visible, estimate based on similar menu items
2. Description should be appealing and concise
3. Category must be one of: food, drink, dessert
4. Return valid JSON only

EXAMPLE OUTPUT:
{
  "name": "Beef Burger Special",
  "description": "Juicy beef patty with fresh vegetables and special sauce",
  "price": 45000,
  "category": "food"
}

Now analyze the image:`;
  }

  private parseExtractionResult(output: string): any {
    try {
      // Clean the output and extract JSON
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const result = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const required = ['name', 'description', 'price', 'category'];
      for (const field of required) {
        if (!result[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate price is positive number
      if (typeof result.price !== 'number' || result.price <= 0) {
        throw new Error('Invalid price format');
      }

      // Validate category
      const validCategories = ['food', 'drink', 'dessert'];
      if (!validCategories.includes(result.category)) {
        throw new Error('Invalid category');
      }

      return result;
    } catch (error) {
      console.error('Extraction parsing error:', error);
      throw new Error('Failed to parse AI extraction result');
    }
  }

  async extractFromImage(imageBase64: string): Promise<any> {
    try {
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: this.createExtractionPrompt()
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: "high"
            }
          }
        ]
      });

      const response = await this.model.invoke([message]);
      return this.parseExtractionResult(response.content.toString());
    } catch (error) {
      console.error('AI extraction error:', error);
      throw error;
    }
  }
}
