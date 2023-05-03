import { CliResultOption } from './cli-result-option';

export interface CliResult {
  readonly success: boolean;
  readonly options: CliResultOptions;
}

export interface CliResultOptions {
  readonly [key: string]: CliResultOption;
}
