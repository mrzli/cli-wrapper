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
      success: false,
      message: parseResult.message,
      options: {},
    };
  }

  if (parseResult.options.some((o) => o.name === 'version')) {
    return {
      success: true,
      message: `Version ${config.meta.version}`,
      options: {},
    };
  }

  if (parseResult.options.some((o) => o.name === 'help')) {
    return {
      success: true,
      message: description,
      options: {},
    };
  }

  const mergeResult = mergeCliOptions(config.options, parseResult.options);
  if (!mergeResult.success) {
    return {
      success: false,
      message: mergeResult.message,
      options: {},
    };
  }

  return {
    success: true,
    message: undefined,
    options: Object.fromEntries(mergeResult.nameOptionPairs),
  };
}
