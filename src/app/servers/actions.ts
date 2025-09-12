'use server';

import {
  validateServerParameters,
  type ServerParameterValidationInput,
} from '@/ai/flows/server-parameter-validation';
import { z } from 'zod';

const formSchema = z.object({
  parameters: z.string().min(1, 'Parameters are required.'),
  contentType: z.string(),
});

type ValidationState = {
  report?: string;
  error?: string;
};

export async function validateConfiguration(
  prevState: ValidationState,
  formData: FormData
): Promise<ValidationState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsedData = formSchema.safeParse(rawData);

    if (!parsedData.success) {
      return {
        error: parsedData.error.flatten().fieldErrors.parameters?.[0] || 'Invalid form data.',
      };
    }

    let serverParameters;
    try {
      serverParameters = JSON.parse(parsedData.data.parameters);
    } catch (e) {
      return { error: 'Invalid JSON format for parameters.' };
    }

    const validationInput: ServerParameterValidationInput = {
      serverParameters,
      contentType: parsedData.data.contentType,
    };

    const result = await validateServerParameters(validationInput);

    return { report: result.validationReport };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred during validation.' };
  }
}
