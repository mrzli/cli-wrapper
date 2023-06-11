import { CliConfig, CliResultObject } from '../../types';
import { parse } from '../parse';
import { mergeCliOptions } from './merge-cli-options';

export function processCli(
  description: string,
  config: CliConfig,
  args: readonly string[]
): CliResultObject {
  const parseResult = parse(args, config);
  if (!parseResult.success) {
    return {
      type: 'error',
      message: parseResult.message,
      options: {},
    };
  }

  if (parseResult.options.some((o) => o.name === 'version')) {
    return {
      type: 'completed',
      message: `Version ${config.meta.version}`,
      options: {},
    };
  }

  if (parseResult.options.some((o) => o.name === 'help')) {
    return {
      type: 'completed',
      message: description,
      options: {},
    };
  }

  const mergeResult = mergeCliOptions(config.options, parseResult.options);
  if (!mergeResult.success) {
    return {
      type: 'error',
      message: mergeResult.message,
      options: {},
    };
  }

  return {
    type: 'execute',
    message: undefined,
    options: Object.fromEntries(mergeResult.nameOptionPairs),
  };
}
