import { CliConfig, CliResult } from '../../types';
import { processCli } from './process-cli';

export function cli(description: string, config: CliConfig): CliResult {
  const result = processCli(description, config, process.argv.slice(2));

  const { type, message, options } = result;

  if (message) {
    console.log(message);
  }

  return {
    type,
    options,
  };
}
