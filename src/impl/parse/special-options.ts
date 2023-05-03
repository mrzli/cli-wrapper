import { ParseResult } from '../../types';
import { getErrorMessageSpecialOptionNeedsToBeStandalone } from './messages';
import { createErrorParseResult, createSuccessParseResult } from './parse-util';

export function handleSpecialOptions(
  args: readonly string[]
): ParseResult | undefined {
  const isOnlyArgument = args.length === 1;
  const isVersion = args.includes('-v') || args.includes('--version');
  const isHelp = args.includes('-h') || args.includes('--help');

  if (isVersion) {
    return createSpecialOptionResult('version', isOnlyArgument);
  } else if (isHelp) {
    return createSpecialOptionResult('help', isOnlyArgument);
  }

  return undefined;
}

function createSpecialOptionResult(
  optionName: 'version' | 'help',
  isOnlyArgument: boolean
): ParseResult {
  if (!isOnlyArgument) {
    return createErrorParseResult(
      getErrorMessageSpecialOptionNeedsToBeStandalone(optionName)
    );
  }
  return createSuccessParseResult([
    {
      type: 'boolean',
      name: optionName,
      value: true,
    },
  ]);
}
