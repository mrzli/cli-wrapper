import {
  NormalizedOptionName,
  Option,
  Options,
  ParseResult,
  ParseResultOption,
} from '../../types';

export function createSuccessResult(
  options: readonly ParseResultOption[]
): ParseResult {
  return {
    success: true,
    options,
  };
}

export function createErrorResult(message: string): ParseResult {
  return {
    success: false,
    message,
  };
}

export function getOptionNameMap(
  options: Options
): ReadonlyMap<string, Option> {
  const optionNameMap = new Map<string, Option>();

  for (const [key, option] of Object.entries(options)) {
    const name = camelCaseToKebabCase(key);
    optionNameMap.set(name, option);
  }

  return optionNameMap;
}

export function getOptionShortToLongNameMap(
  options: Options
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
    if (optionStr.startsWith('--no-') ? optionStr.length <= 6 : optionStr.length <= 3) {
      return false;
    }
    return LONG_FORM_OPTION_NAME_REGEX.test(optionStr);
  } else if (optionStr.startsWith('-')) {
    return SHORT_FORM_OPTION_NAME_REGEX.test(optionStr);
  } else {
    return false;
  }
}

const LONG_FORM_OPTION_NAME_REGEX = /^--(?:no-)?[a-z][\da-z]*(?:-[a-z][\da-z]*)*$/;
const SHORT_FORM_OPTION_NAME_REGEX = /^-[A-Za-z]+$/;

export function getOptionsFromString(optionsStr: string): readonly string[] {
  return optionsStr.startsWith('--')
    ? [optionsStr.slice(2)]
    : // eslint-disable-next-line unicorn/no-useless-spread
      [...optionsStr.slice(1)];
}

function camelCaseToKebabCase(value: string): string {
  return value
    .replace(
      /([\p{Lowercase_Letter}\p{Uppercase_Letter}\d])(\p{Uppercase_Letter})/gu,
      '$1-$2'
    )
    .toLowerCase();
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
      }
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
