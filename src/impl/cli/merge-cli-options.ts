import {
  CliMergeResult,
  CliOption,
  CliOptions,
  CliResultOption,
  OptionType,
  ParseResultOption,
} from '../../types';
import { camelCaseToKebabCase, kebabCaseToCamelCase } from '../util';

export function mergeCliOptions(
  cliOptions: CliOptions,
  parseResultOptions: readonly ParseResultOption[]
): CliMergeResult {
  const cliNameOptionList: readonly (readonly [string, CliOption])[] =
    Object.entries(cliOptions);

  const parseResultOptionsMap = new Map<string, ParseResultOption>(
    parseResultOptions.map((o) => [o.name, o])
  );

  const parseResultOptionsObj = Object.fromEntries(
    parseResultOptions.map((o) => [kebabCaseToCamelCase(o.name), o])
  );

  const nameOptionPairs: (readonly [string, CliResultOption])[] = [];

  for (const cliNameOption of cliNameOptionList) {
    const name = cliNameOption[0];
    const cliOption = cliNameOption[1];
    const parseResultOption = parseResultOptionsMap.get(
      camelCaseToKebabCase(name)
    );

    if (parseResultOption) {
      if (cliOption.type === 'string') {
        assertOptionType(parseResultOption.type, 'string');
        const choicesSet = new Set(cliOption.choices);
        if (parseResultOption.multiple) {
          for (const value of parseResultOption.value) {
            if (cliOption.choices && !choicesSet.has(value)) {
              return createInvalidChoiceOptionResult(value, cliOption.choices);
            }
          }

          nameOptionPairs.push([
            name,
            {
              type: 'string',
              multiple: true,
              value: parseResultOption.value,
            },
          ]);
        } else {
          if (cliOption.choices && !choicesSet.has(parseResultOption.value)) {
            return createInvalidChoiceOptionResult(
              parseResultOption.value,
              cliOption.choices
            );
          }

          nameOptionPairs.push([
            name,
            {
              type: 'string',
              multiple: false,
              value: parseResultOption.value,
            },
          ]);
        }
      } else if (cliOption.type === 'boolean') {
        assertOptionType(parseResultOption.type, 'boolean');
        nameOptionPairs.push([
          name,
          {
            type: 'boolean',
            value: parseResultOption.value,
          },
        ]);
      }
    } else {
      if (
        cliOption.required === true ||
        (cliOption.required instanceof Function &&
          cliOption.required(parseResultOptionsObj) === true)
      ) {
        return {
          success: false,
          message: `Missing required option '${name}'.`,
        };
      }

      if (cliOption.defaultValue) {
        if (cliOption.type === 'string') {
          if (cliOption.multiple) {
            nameOptionPairs.push([
              name,
              {
                type: 'string',
                multiple: true,
                value: cliOption.defaultValue,
              },
            ]);
          } else {
            nameOptionPairs.push([
              name,
              {
                type: 'string',
                multiple: false,
                value: cliOption.defaultValue,
              },
            ]);
          }
        } else if (cliOption.type === 'boolean') {
          nameOptionPairs.push([
            name,
            {
              type: 'boolean',
              value: cliOption.defaultValue,
            },
          ]);
        }
      }
    }
  }

  return {
    success: true,
    nameOptionPairs,
  };
}

function assertOptionType<TExpectedOptionType extends OptionType>(
  actual: OptionType,
  expected: TExpectedOptionType
): asserts actual is TExpectedOptionType {
  if (actual !== expected) {
    throw new Error(
      `Invalid option type '${actual}', expected '${expected}'. This is a programming error.`
    );
  }
}

function createInvalidChoiceOptionResult(
  value: string,
  choices: readonly string[]
): CliMergeResult {
  return {
    success: false,
    message: `Invalid option value: '${value}'. Valid choices are: ${choices}.`,
  };
}
