import { CliConfig, ParseResult, ParseResultOption } from '../../types';
import { getErrorMessageInvalidOptionFormat } from './messages';
import {
  createErrorParseResult,
  createSuccessParseResult,
  getOptionNameMap,
  getOptionShortToLongNameMap,
  getOptionsFromString,
  isValidOptionString,
  normalizeOptionName,
} from './parse-util';
import { handleSpecialOptions } from './special-options';

export function parse(args: readonly string[], config: CliConfig): ParseResult {
  const specialOptionsResult = handleSpecialOptions(args);
  if (specialOptionsResult) {
    return specialOptionsResult;
  }

  const usedOptionsSet = new Set<string>();
  const optionNameMap = getOptionNameMap(config.options);
  const optionShortToLongNameMap = getOptionShortToLongNameMap(config.options);

  const options: ParseResultOption[] = [];

  let index = 0;
  while (index < args.length) {
    const optionStr = args[index];
    if (!isValidOptionString(optionStr)) {
      return createErrorParseResult(
        getErrorMessageInvalidOptionFormat(optionStr)
      );
    }

    const optionNames = getOptionsFromString(optionStr);

    if (optionNames.length === 1) {
      const optionName = optionNames[0];
      const { unknownOption, name, negated } = normalizeOptionName(
        optionName,
        optionShortToLongNameMap
      );

      if (unknownOption) {
        return createErrorParseResult(`Unknown option '${name}'.`);
      }

      const option = optionNameMap.get(name);
      if (!option) {
        return createErrorParseResult(`Unknown option '${name}'.`);
      }

      if (negated && option.type !== 'boolean') {
        return createErrorParseResult(
          `'${name}' is not a boolean option. Only boolean options can be negated.`
        );
      }

      if (usedOptionsSet.has(name)) {
        return createErrorParseResult(
          `Option '${name}' is used more than once.`
        );
      }
      usedOptionsSet.add(name);

      if (option.type === 'string') {
        if (index >= args.length - 1 || args[index + 1].startsWith('-')) {
          return createErrorParseResult(`Option '${name}' requires a value.`);
        }
        index++;

        const value = args[index];
        const resultOption: ParseResultOption = option.multiple
          ? {
              type: 'string',
              name,
              multiple: true,
              value: value.split(','),
            }
          : {
              type: 'string',
              name,
              multiple: false,
              value,
            };

        options.push(resultOption);
      } else if (option.type === 'boolean') {
        if (index < args.length - 1 && !args[index + 1].startsWith('-')) {
          return createErrorParseResult(
            `Boolean option '${name}' does not take a value.`
          );
        }

        const resultOption: ParseResultOption = {
          type: 'boolean',
          name,
          value: !negated,
        };

        options.push(resultOption);
      }
    } else {
      for (const optionName of optionNames) {
        const { unknownOption, name, negated } = normalizeOptionName(
          optionName,
          optionShortToLongNameMap
        );

        if (unknownOption) {
          return createErrorParseResult(`Unknown option '${name}'.`);
        }

        const option = optionNameMap.get(name);
        if (!option) {
          return createErrorParseResult(`Unknown option '${name}'.`);
        }

        if (negated && option.type !== 'boolean') {
          return createErrorParseResult(
            `'${name}' is not a boolean option. Only boolean options can be negated.`
          );
        }

        if (usedOptionsSet.has(name)) {
          return createErrorParseResult(
            `Option '${name}' is used more than once.`
          );
        }
        usedOptionsSet.add(name);

        if (option.type === 'string') {
          return createErrorParseResult(
            `'${name}' is not a boolean option. Only boolean options can be part of options list.`
          );
        } else if (option.type === 'boolean') {
          const resultOption: ParseResultOption = {
            type: 'boolean',
            name,
            value: !negated,
          };

          options.push(resultOption);
        }
      }

      if (index < args.length - 1 && !args[index + 1].startsWith('-')) {
        return createErrorParseResult(
          `Option list '${optionNames.join('')}' does not take a value.`
        );
      }
    }

    index++;
  }

  return createSuccessParseResult(options);
}
