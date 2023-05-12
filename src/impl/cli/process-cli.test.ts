import { describe, expect, it } from '@jest/globals';
import { processCli } from './process-cli';
import {
  CliConfig,
  CliOptions,
  CliResultObject,
  CliResultOptions,
} from '../../types';
import {
  getErrorMessageSpecialOptionNeedsToBeStandalone,
  getErrorMessageInvalidOptionFormat,
} from '../parse/messages';

const EXAMPLE_DESCRIPTION = 'Some description';

describe('processCli', () => {
  describe('processCli()', () => {
    describe('version and help', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['-v'],
          expected: createSuccessMessage('Version 1.0.0'),
        },
        {
          input: ['--version'],
          expected: createSuccessMessage('Version 1.0.0'),
        },
        {
          input: ['-h'],
          expected: createSuccessMessage(EXAMPLE_DESCRIPTION),
        },
        {
          input: ['--help'],
          expected: createSuccessMessage(EXAMPLE_DESCRIPTION),
        },
        {
          input: '-v -c config.json'.split(' '),
          expected: createErrorMessage(
            getErrorMessageSpecialOptionNeedsToBeStandalone('version')
          ),
        },
        {
          input: '-h -c config.json'.split(' '),
          expected: createErrorMessage(
            getErrorMessageSpecialOptionNeedsToBeStandalone('help')
          ),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('empty', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: [],
          expected: createSuccessOptions({}),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('simple string option', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
        },
        multiWord: {
          type: 'string',
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['--config', 'config.json'],
          expected: createSuccessOptions({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
          }),
        },
        {
          input: ['-c', 'config.json'],
          expected: createSuccessOptions({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
          }),
        },
        {
          input: ['--multi-word', 'value'],
          expected: createSuccessOptions({
            multiWord: {
              type: 'string',
              multiple: false,
              value: 'value',
            },
          }),
        },
        {
          input: ['--config', 'path with space/config.json'],
          expected: createSuccessOptions({
            config: {
              type: 'string',
              multiple: false,
              value: 'path with space/config.json',
            },
          }),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('basic errors', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
        },
        output: {
          type: 'string',
          short: 'o',
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['-u'],
          expected: createErrorMessage("Unknown option 'u'."),
        },
        {
          input: ['--unknown'],
          expected: createErrorMessage("Unknown option 'unknown'."),
        },
        {
          input: ['-U'],
          expected: createErrorMessage("Unknown option 'u'."),
        },
        {
          input: ['--no-unknown'],
          expected: createErrorMessage("Unknown option 'unknown'."),
        },
        {
          input: ['some-argument'],
          expected: createErrorMessage("Expected option, got 'some-argument'."),
        },
        {
          input: ['-c'],
          expected: createErrorMessage("Option 'config' requires a value."),
        },
        {
          input: ['-c', '-o', 'output'],
          expected: createErrorMessage("Option 'config' requires a value."),
        },
        {
          input: ['-c', 'config.json', 'some-argument'],
          expected: createErrorMessage("Expected option, got 'some-argument'."),
        },
        {
          input: ['-c', 'config.json', '-c', 'config.json'],
          expected: createErrorMessage(
            "Option 'config' is used more than once."
          ),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('invalid option format', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        '--',
        '--o', // min 2 characters
        '--no-o', // min 2 characters (for base name)
        '---option',
        '--a_b',
        '--1a',
        '--a-',
        '--Ab',
        '-',
        '-1',
      ].map((optionName) => ({
        input: [optionName],
        expected: createErrorMessage(
          getErrorMessageInvalidOptionFormat(optionName)
        ),
      }));

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('multiple', () => {
      const CONFIG = createConfig({
        values: {
          type: 'string',
          multiple: true,
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['--values', 'a,b,c'],
          expected: createSuccessOptions({
            values: {
              type: 'string',
              multiple: true,
              value: ['a', 'b', 'c'],
            },
          }),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('boolean', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
        },
        aBoolean: {
          type: 'boolean',
          short: 'a',
        },
        bBoolean: {
          type: 'boolean',
          short: 'b',
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['--a-boolean'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['--a-boolean', 'value'],
          expected: createErrorMessage(
            "Boolean option 'a-boolean' does not take a value."
          ),
        },
        {
          input: ['--b-boolean'],
          expected: createSuccessOptions({
            bBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['--a-boolean', '--b-boolean'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: true,
            },
            bBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['-a', '-b'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: true,
            },
            bBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['-ab'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: true,
            },
            bBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['--no-a-boolean', '--no-b-boolean'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: false,
            },
            bBoolean: {
              type: 'boolean',
              value: false,
            },
          }),
        },
        {
          input: ['-A', '-B'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: false,
            },
            bBoolean: {
              type: 'boolean',
              value: false,
            },
          }),
        },
        {
          input: ['-AB'],
          expected: createSuccessOptions({
            aBoolean: {
              type: 'boolean',
              value: false,
            },
            bBoolean: {
              type: 'boolean',
              value: false,
            },
          }),
        },
        {
          input: ['-abu', 'value'],
          expected: createErrorMessage("Unknown option 'u'."),
        },
        {
          input: ['-abU', 'value'],
          expected: createErrorMessage("Unknown option 'u'."),
        },
        {
          input: ['-ab', 'value'],
          expected: createErrorMessage(
            "Option list 'ab' does not take a value."
          ),
        },
        {
          input: ['-abc'],
          expected: createErrorMessage(
            "'config' is not a boolean option. Only boolean options can be part of options list."
          ),
        },
        {
          input: ['--no-config'],
          expected: createErrorMessage(
            "'config' is not a boolean option. Only boolean options can be negated."
          ),
        },
        {
          input: ['-C'],
          expected: createErrorMessage(
            "'config' is not a boolean option. Only boolean options can be negated."
          ),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('required - boolean', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
          required: true,
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: [],
          expected: createErrorMessage("Missing required option 'config'."),
        },
        {
          input: ['-c', 'config.json'],
          expected: createSuccessOptions({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
          }),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('required - function', () => {
      const CONFIG = createConfig({
        output: {
          type: 'string',
          short: 'o',
        },
        file: {
          type: 'string',
          short: 'f',
          required: (options) => {
            return options['output'] !== undefined;
          },
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: [],
          expected: createSuccessOptions({}),
        },
        {
          input: ['-o', 'output'],
          expected: createErrorMessage("Missing required option 'file'."),
        },
        {
          input: ['-o', 'output', '-f', 'file'],
          expected: createSuccessOptions({
            output: {
              type: 'string',
              multiple: false,
              value: 'output',
            },
            file: {
              type: 'string',
              multiple: false,
              value: 'file',
            },
          }),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('default value', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
          defaultValue: 'config.json',
        },
        values: {
          type: 'string',
          multiple: true,
          defaultValue: ['a', 'b'],
        },
        flag: {
          type: 'boolean',
          defaultValue: true,
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: [],
          expected: createSuccessOptions({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
            values: {
              type: 'string',
              multiple: true,
              value: ['a', 'b'],
            },
            flag: {
              type: 'boolean',
              value: true,
            },
          }),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });

    describe('choices', () => {
      const CONFIG = createConfig({
        singleValue: {
          type: 'string',
          short: 's',
          choices: ['a', 'b', 'c'],
        },
        multiValues: {
          type: 'string',
          short: 'm',
          multiple: true,
          choices: ['a', 'b', 'c'],
        },
      });

      const EXAMPLES: readonly SimpleProcessCliExample[] = [
        {
          input: ['-s', 'a', '-m', 'a,b'],
          expected: createSuccessOptions({
            singleValue: {
              type: 'string',
              multiple: false,
              value: 'a',
            },
            multiValues: {
              type: 'string',
              multiple: true,
              value: ['a', 'b'],
            },
          }),
        },
        {
          input: ['-s', 'd'],
          expected: createErrorMessage(
            "Invalid option value: 'd'. Valid choices are: a,b,c."
          ),
        },
        {
          input: ['-m', 'a,d'],
          expected: createErrorMessage(
            "Invalid option value: 'd'. Valid choices are: a,b,c."
          ),
        },
      ];

      testProcessCliExamples(EXAMPLES, CONFIG, identityMapper);
    });
  });
});

function createConfig(options: CliOptions): CliConfig {
  return {
    meta: {
      version: '1.0.0',
    },
    options,
  };
}

function createSuccessOptions(options: CliResultOptions): CliResultObject {
  return {
    success: true,
    message: undefined,
    options,
  };
}

function createSuccessMessage(message: string): CliResultObject {
  return {
    success: true,
    message,
    options: {},
  };
}

function createErrorMessage(message: string): CliResultObject {
  return {
    success: false,
    message,
    options: {},
  };
}

interface ProcessCliExample<TInput> {
  readonly input: TInput;
  readonly expected: CliResultObject;
}

type SimpleProcessCliExample = ProcessCliExample<readonly string[]>;

function testProcessCliExamples<TInput>(
  examples: readonly ProcessCliExample<TInput>[],
  config: CliConfig,
  inputMapper: (input: TInput) => readonly string[]
): void {
  for (const example of examples) {
    it(JSON.stringify(example), () => {
      const actual = processCli(
        EXAMPLE_DESCRIPTION,
        config,
        inputMapper(example.input)
      );
      expect(actual).toEqual(example.expected);
    });
  }
}

function identityMapper(input: readonly string[]): readonly string[] {
  return input;
}
