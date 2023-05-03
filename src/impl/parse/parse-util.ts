import {
  NormalizedOptionName,
  CliOption,
  CliOptions,
  ParseResult,
  ParseResultOption,
} from '../../types';
import { camelCaseToKebabCase } from '../util';

export function createSuccessParseResult(
  options: readonly ParseResultOption[]
): ParseResult {
  return {
    success: true,
    options,
  };
}

export function createErrorParseResult(message: string): ParseResult {
  return {
    success: false,
    message,
  };
}

export function getOptionNameMap(
  options: CliOptions
): ReadonlyMap<string, CliOption> {
  const optionNameMap = new Map<string, CliOption>();

  for (const [key, option] of Object.entries(options)) {
    const name = camelCaseToKebabCase(key);
    optionNameMap.set(name, option);
  }

  return optionNameMap;
}

export function getOptionShortToLongNameMap(
  options: CliOptions
): ReadonlyMap<string, string> {
  const optionShortToLongNameMap = new Map<string, string>();

  for (const [key, option] of Object.entries(options)) {
    if (option.short) {
      optionShortToLongNameMap.set(option.short, camelCaseToKebabCase(key));
    }
  }

  return optionShortToLongNameMap;
}

export function isValidOptionString(optionStr: string): boolean {
  if (optionStr.startsWith('--')) {
    if (
      optionStr.startsWith('--no-')
        ? optionStr.length <= 6
        : optionStr.length <= 3
    ) {
      return false;
    }
    return LONG_FORM_OPTION_NAME_REGEX.test(optionStr);
  } else if (optionStr.startsWith('-')) {
    return SHORT_FORM_OPTION_NAME_REGEX.test(optionStr);
  } else {
    return false;
  }
}

const LONG_FORM_OPTION_NAME_REGEX =
  /^--(?:no-)?[a-z][\da-z]*(?:-[a-z][\da-z]*)*$/;
const SHORT_FORM_OPTION_NAME_REGEX = /^-[A-Za-z]+$/;

export function getOptionsFromString(optionsStr: string): readonly string[] {
  return optionsStr.startsWith('--')
    ? [optionsStr.slice(2)]
    : // eslint-disable-next-line unicorn/no-useless-spread
      [...optionsStr.slice(1)];
}

export function normalizeOptionName(
  optionName: string,
  optionShortToLongNameMap: ReadonlyMap<string, string>
): NormalizedOptionName {
  const isShortName = optionName.length === 1;

  let negated: boolean | undefined;
  let longOptionName: string | undefined;
  if (isShortName) {
    negated = isUpperCase(optionName);
    const positiveOptionName = negated ? optionName.toLowerCase() : optionName;
    longOptionName = optionShortToLongNameMap.get(positiveOptionName);
    if (!longOptionName) {
      return {
        unknownOption: true,
        name: positiveOptionName,
        negated,
      };
    }
  } else {
    negated = optionName.startsWith('no-');
    longOptionName = negated ? optionName.slice(3) : optionName;
  }

  return {
    unknownOption: false,
    name: longOptionName,
    negated,
  };
}

function isUpperCase(value: string): boolean {
  return value.toUpperCase() === value && value.toLowerCase() !== value;
}
