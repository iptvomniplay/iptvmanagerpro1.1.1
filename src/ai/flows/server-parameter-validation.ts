'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating server parameters against expected ranges for different content types.
 *
 * The flow takes server parameters and content type as input and returns a validation report indicating whether the parameters are within acceptable ranges.
 *
 * - `validateServerParameters` - A function that initiates the server parameter validation process.
 * - `ServerParameterValidationInput` - The input type for the `validateServerParameters` function.
 * - `ServerParameterValidationOutput` - The return type for the `validateServerParameters` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ServerParameterValidationInputSchema = z.object({
  serverParameters: z
    .record(z.string(), z.any())
    .describe('A JSON object containing the server parameters to validate.'),
  contentType: z
    .string()
    .describe(
      'The content type for which to validate the server parameters (e.g., "live", "vod", "4k").'
    ),
});
export type ServerParameterValidationInput = z.infer<
  typeof ServerParameterValidationInputSchema
>;

const ServerParameterValidationOutputSchema = z.object({
  validationReport: z
    .string()
    .describe(
      'A report indicating whether the server parameters are within acceptable ranges for the given content type.'
    ),
});
export type ServerParameterValidationOutput = z.infer<
  typeof ServerParameterValidationOutputSchema
>;

export async function validateServerParameters(
  input: ServerParameterValidationInput
): Promise<ServerParameterValidationOutput> {
  return validateServerParametersFlow(input);
}

const validateServerParametersPrompt = ai.definePrompt({
  name: 'validateServerParametersPrompt',
  input: {schema: ServerParameterValidationInputSchema},
  output: {schema: ServerParameterValidationOutputSchema},
  prompt: `You are an expert system administrator specializing in IPTV server configurations.

You will validate the provided server parameters against the expected ranges for the given content type.

Provide a validation report indicating whether the parameters are within acceptable ranges and optimized for the specified content type.

Server Parameters:
{{JSON.stringify serverParameters}}

Content Type: {{{contentType}}}

Validation Report:`,
});

const validateServerParametersFlow = ai.defineFlow(
  {
    name: 'validateServerParametersFlow',
    inputSchema: ServerParameterValidationInputSchema,
    outputSchema: ServerParameterValidationOutputSchema,
  },
  async input => {
    const {output} = await validateServerParametersPrompt(input);
    return output!;
  }
);
