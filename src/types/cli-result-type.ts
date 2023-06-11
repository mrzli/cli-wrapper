export const TYPES_OF_CLI_RESULT = ['completed', 'execute', 'error'] as const;

export type CliResultType = (typeof TYPES_OF_CLI_RESULT)[number];
