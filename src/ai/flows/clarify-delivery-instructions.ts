'use server';
/**
 * @fileOverview An AI assistant that clarifies ambiguous delivery instructions for a delivery rider.
 *
 * - clarifyDeliveryInstructions - A function that processes and clarifies delivery instructions.
 * - ClarifyDeliveryInstructionsInput - The input type for the clarifyDeliveryInstructions function.
 * - ClarifyDeliveryInstructionsOutput - The return type for the clarifyDeliveryInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClarifyDeliveryInstructionsInputSchema = z.object({
  deliveryInstructions: z
    .string()
    .describe('The ambiguous or complex customer delivery instructions.'),
});
export type ClarifyDeliveryInstructionsInput = z.infer<
  typeof ClarifyDeliveryInstructionsInputSchema
>;

const ClarifyDeliveryInstructionsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A clear and concise summary of the delivery instructions.'),
  actionItems: z
    .array(z.string())
    .describe(
      'A list of key actions the rider needs to take to complete the delivery.'
    ),
  clarifyingQuestions: z
    .array(z.string())
    .describe(
      'A list of suggested questions the rider can ask the customer for clarification, if needed.'
    ),
});
export type ClarifyDeliveryInstructionsOutput = z.infer<
  typeof ClarifyDeliveryInstructionsOutputSchema
>;

export async function clarifyDeliveryInstructions(
  input: ClarifyDeliveryInstructionsInput
): Promise<ClarifyDeliveryInstructionsOutput> {
  return clarifyDeliveryInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clarifyDeliveryInstructionsPrompt',
  input: {schema: ClarifyDeliveryInstructionsInputSchema},
  output: {schema: ClarifyDeliveryInstructionsOutputSchema},
  prompt: `You are an AI assistant designed to help delivery riders understand and execute complex or ambiguous customer delivery instructions. Your goal is to provide clarity, identify key tasks, and suggest questions for the rider to ask the customer if further information is needed. Always be clear, concise, and helpful.

Analyze the following delivery instructions and provide:
1. A clear summary of the instructions.
2. A list of key action items for the rider.
3. A list of suggested clarifying questions the rider could ask the customer.

Delivery Instructions: {{{deliveryInstructions}}}`,
});

const clarifyDeliveryInstructionsFlow = ai.defineFlow(
  {
    name: 'clarifyDeliveryInstructionsFlow',
    inputSchema: ClarifyDeliveryInstructionsInputSchema,
    outputSchema: ClarifyDeliveryInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
