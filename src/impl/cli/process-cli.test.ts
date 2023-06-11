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
          expected: createCompletedResult('Version 1.0.0'),
        },
        {
          input: ['--version'],
          expected: createCompletedResult('Version 1.0.0'),
        },
        {
          input: ['-h'],
          expected: createCompletedResult(EXAMPLE_DESCRIPTION),
        },
        {
          input: ['--help'],
          expected: createCompletedResult(EXAMPLE_DESCRIPTION),
        },
        {
          input: '-v -c config.json'.split(' '),
          expected: createErrorResult(
            getErrorMessageSpecialOptionNeedsToBeStandalone('version')
          ),
        },
        {
          input: '-h -c config.json'.split(' '),
          expected: createErrorResult(
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
          expected: createExecuteResult({}),
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
          expected: createExecuteResult({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
          }),
        },
        {
          input: ['-c', 'config.json'],
          expected: createExecuteResult({
            config: {
              type: 'string',
              multiple: false,
              value: 'config.json',
            },
          }),
        },
        {
          input: ['--multi-word', 'value'],
          expected: createExecuteResult({
            multiWord: {
              type: 'string',
              multiple: false,
              value: 'value',
            },
          }),
        },
        {
          input: ['--config', 'path with space/config.json'],
          expected: createExecuteResult({
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
          expected: createErrorResult("Unknown option 'u'."),
        },
        {
          input: ['--unknown'],
          expected: createErrorResult("Unknown option 'unknown'."),
        },
        {
          input: ['-U'],
          expected: createErrorResult("Unknown option 'u'."),
        },
        {
          input: ['--no-unknown'],
          expected: createErrorResult("Unknown option 'unknown'."),
        },
        {
          input: ['some-argument'],
          expected: createErrorResult("Expected option, got 'some-argument'."),
        },
        {
          input: ['-c'],
          expected: createErrorResult("Option 'config' requires a value."),
        },
        {
          input: ['-c', '-o', 'output'],
          expected: createErrorResult("Option 'config' requires a value."),
        },
        {
          input: ['-c', 'config.json', 'some-argument'],
          expected: createErrorResult("Expected option, got 'some-argument'."),
        },
        {
          input: ['-c', 'config.json', '-c', 'config.json'],
          expected: createErrorResult(
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
        expected: createErrorResult(
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
            aBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['--a-boolean', 'value'],
          expected: createErrorResult(
            "Boolean option 'a-boolean' does not take a value."
          ),
        },
        {
          input: ['--b-boolean'],
          expected: createExecuteResult({
            bBoolean: {
              type: 'boolean',
              value: true,
            },
          }),
        },
        {
          input: ['--a-boolean', '--b-boolean'],
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createErrorResult("Unknown option 'u'."),
        },
        {
          input: ['-abU', 'value'],
          expected: createErrorResult("Unknown option 'u'."),
        },
        {
          input: ['-ab', 'value'],
          expected: createErrorResult(
            "Option list 'ab' does not take a value."
          ),
        },
        {
          input: ['-abc'],
          expected: createErrorResult(
            "'config' is not a boolean option. Only boolean options can be part of options list."
          ),
        },
        {
          input: ['--no-config'],
          expected: createErrorResult(
            "'config' is not a boolean option. Only boolean options can be negated."
          ),
        },
        {
          input: ['-C'],
          expected: createErrorResult(
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
          expected: createErrorResult("Missing required option 'config'."),
        },
        {
          input: ['-c', 'config.json'],
          expected: createExecuteResult({
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
          expected: createExecuteResult({}),
        },
        {
          input: ['-o', 'output'],
          expected: createErrorResult("Missing required option 'file'."),
        },
        {
          input: ['-o', 'output', '-f', 'file'],
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createExecuteResult({
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
          expected: createErrorResult(
            "Invalid option value: 'd'. Valid choices are: a,b,c."
          ),
        },
        {
          input: ['-m', 'a,d'],
          expected: createErrorResult(
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

function createExecuteResult(options: CliResultOptions): CliResultObject {
  return {
    type: 'execute',
    message: undefined,
    options,
  };
}

function createCompletedResult(message: string): CliResultObject {
  return {
    type: 'completed',
    message,
    options: {},
  };
}

function createErrorResult(message: string): CliResultObject {
  return {
    type: 'error',
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
