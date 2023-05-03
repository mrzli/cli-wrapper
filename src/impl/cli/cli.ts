import { CliConfig, CliResult } from '../../types';
import { processCli } from './process-cli';

export function cli(description: string, config: CliConfig): CliResult {
  const result = processCli(description, config, process.argv.slice(2));

  const { success, message, options } = result;

  if (message) {
    console.log(message);
  }

  return {
    success,
    options,
  };
}
