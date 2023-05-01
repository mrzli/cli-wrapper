import { ParseResultOption } from './parse-result-option';

export interface ParseResultBase {
  readonly success: boolean;
}

export interface ParseResultSuccess extends ParseResultBase {
  readonly success: true;
  readonly options: readonly ParseResultOption[];
}

export interface ParseResultError extends ParseResultBase {
  readonly success: false;
  readonly message: string;
}

export type ParseResult = ParseResultSuccess | ParseResultError;
