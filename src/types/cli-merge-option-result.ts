import { CliResultOption } from './cli-result-option';

export interface CliMergeResultBase {
  readonly success: boolean;
}

export interface CliMergeResultSuccess extends CliMergeResultBase {
  readonly success: true;
  readonly nameOptionPairs: readonly (readonly [string, CliResultOption])[];
}

export interface CliMergeResultError extends CliMergeResultBase {
  readonly success: false;
  readonly message: string;
}

export type CliMergeResult = CliMergeResultSuccess | CliMergeResultError;
