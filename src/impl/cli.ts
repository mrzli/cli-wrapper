import { CliConfig } from '../types';

export interface CliResult {
  readonly description: string;
}

export function cli(description: string, config: CliConfig): CliResult {
  return {
    description,
  };
}
