import { describe, expect, it } from '@jest/globals';
import { parse } from './parse';
import { CliConfig, Options, ParseResult } from '../../types';
import { createErrorResult, createSuccessResult } from './parse-util';
import {
  getErrorMessageSpecialOptionNeedsToBeStandalone,
  getErrorMessageInvalidOptionFormat,
} from './messages';

describe('parse', () => {
  describe('parse()', () => {
    describe('version and help', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleParseExample[] = [
        {
          input: ['-v'],
          expected: createSuccessResult([{ type: 'boolean', name: 'version' }]),
        },
        {
          input: ['--version'],
          expected: createSuccessResult([{ type: 'boolean', name: 'version' }]),
        },
        {
          input: ['-h'],
          expected: createSuccessResult([{ type: 'boolean', name: 'help' }]),
        },
        {
          input: ['--help'],
          expected: createSuccessResult([{ type: 'boolean', name: 'help' }]),
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

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    describe('empty', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleParseExample[] = [
        {
          input: [],
          expected: createSuccessResult([]),
        },
      ];

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    describe('simple string option', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
          description: 'Path to config file',
        },
        multiWord: {
          type: 'string',
          description: 'A multi word option',
        },
      });

      const EXAMPLES: readonly SimpleParseExample[] = [
        {
          input: ['--config', 'config.json'],
          expected: createSuccessResult([
            { type: 'string', name: 'config', value: 'config.json' },
          ]),
        },
        {
          input: ['-c', 'config.json'],
          expected: createSuccessResult([
            { type: 'string', name: 'config', value: 'config.json' },
          ]),
        },
        {
          input: ['--multi-word', 'value'],
          expected: createSuccessResult([
            { type: 'string', name: 'multi-word', value: 'value' },
          ]),
        },
        {
          input: ['--config', 'path with space/config.json'],
          expected: createSuccessResult([
            {
              type: 'string',
              name: 'config',
              value: 'path with space/config.json',
            },
          ]),
        },
      ];

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    describe('basic errors', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          short: 'c',
          description: 'Path to config file',
        },
        output: {
          type: 'string',
          short: 'o',
          description: 'Path to output directory',
        },
      });

      const EXAMPLES: readonly SimpleParseExample[] = [
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

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    describe('invalid option format', () => {
      const CONFIG = createConfig({});

      const EXAMPLES: readonly SimpleParseExample[] = [
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

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    // describe('required option', () => {
    //   const CONFIG = createConfig({
    //     config: {
    //       type: 'string',
    //       short: 'c',
    //       description: 'Path to config file',
    //       required: true,
    //     },
    //     output: {
    //       type: 'string',
    //       short: 'o',
    //       description: 'Path to output directory',
    //     },
    //     file: {
    //       type: 'string',
    //       description: 'File name',
    //       required: (options) => options['output'] !== undefined,
    //     },
    //   });

    //   const EXAMPLES: readonly SimpleParseExample[] = [
    //     {
    //       input: [],
    //       expected: createErrorResult("Missing required option 'config'."),
    //     },
    //     {
    //       input: ['-c', 'config.json'],
    //       expected: createSuccessResult([
    //         { type: 'string', name: 'config', value: 'config.json' },
    //       ]),
    //     },
    //     {
    //       input: ['-c', 'config.json', '-o', 'output'],
    //       expected: createErrorResult("Missing required option 'file'."),
    //     },
    //     {
    //       input: ['-c', 'config.json', '-o', 'output', '--file', 'file.txt'],
    //       expected: createSuccessResult([
    //         { type: 'string', name: 'config', value: 'config.json' },
    //         { type: 'string', name: 'output', value: 'output' },
    //         { type: 'string', name: 'file', value: 'file.txt' },
    //       ]),
    //     },
    //   ];

    //   testParseExamples(EXAMPLES, identityMapper, CONFIG);
    // });

    describe('multiple', () => {
      const CONFIG = createConfig({
        values: {
          type: 'string',
          description: 'Some values',
          multiple: true,
        },
      });

      const EXAMPLES: readonly SimpleParseExample[] = [
        {
          input: ['--values', 'a,b,c'],
          expected: createSuccessResult([
            {
              type: 'string',
              name: 'values',
              multiple: true,
              value: ['a', 'b', 'c'],
            },
          ]),
        },
      ];

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });

    describe('boolean', () => {
      const CONFIG = createConfig({
        config: {
          type: 'string',
          description: 'Path to config file',
          short: 'c',
        },
        aBoolean: {
          type: 'boolean',
          description: 'Some boolean',
          short: 'a',
        },
        bBoolean: {
          type: 'boolean',
          description: 'Some other boolean',
          short: 'b',
        },
      });

      const EXAMPLES: readonly SimpleParseExample[] = [
        {
          input: ['--a-boolean'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: true,
            },
          ]),
        },
        {
          input: ['--a-boolean', 'value'],
          expected: createErrorResult(
            "Boolean option 'a-boolean' does not take a value."
          ),
        },
        {
          input: ['--b-boolean'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'b-boolean',
              value: true,
            },
          ]),
        },
        {
          input: ['--a-boolean', '--b-boolean'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: true,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: true,
            },
          ]),
        },
        {
          input: ['-a', '-b'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: true,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: true,
            },
          ]),
        },
        {
          input: ['-ab'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: true,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: true,
            },
          ]),
        },
        {
          input: ['--no-a-boolean', '--no-b-boolean'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: false,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: false,
            },
          ]),
        },
        {
          input: ['-A', '-B'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: false,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: false,
            },
          ]),
        },
        {
          input: ['-AB'],
          expected: createSuccessResult([
            {
              type: 'boolean',
              name: 'a-boolean',
              value: false,
            },
            {
              type: 'boolean',
              name: 'b-boolean',
              value: false,
            },
          ]),
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

      testParseExamples(EXAMPLES, identityMapper, CONFIG);
    });
  });
});

function createConfig(options: Options): CliConfig {
  return {
    meta: {
      version: '1.0.0',
    },
    options,
  };
}

interface ParseExample<TInput> {
  readonly input: TInput;
  readonly expected: ParseResult;
}

type SimpleParseExample = ParseExample<readonly string[]>;

function testParseExamples<TInput>(
  examples: readonly ParseExample<TInput>[],
  inputMapper: (input: TInput) => readonly string[],
  config: CliConfig
): void {
  for (const example of examples) {
    it(JSON.stringify(example), () => {
      const actual = parse(inputMapper(example.input), config);
      expect(actual).toEqual(example.expected);
    });
  }
}

function identityMapper(input: readonly string[]): readonly string[] {
  return input;
}
