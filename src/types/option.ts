import { OptionType } from './option-type';
import { ParseResultOption } from './parse-result-option';

export type CliOptionRequiredFunction = (
  options: Readonly<Record<string, ParseResultOption>>
) => boolean;

export const OPTION_SHORT_NAME_LIST = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  // 'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  // 'v',
  'w',
  'x',
  'y',
  'z',
] as const;

export type CliOptionShortName = (typeof OPTION_SHORT_NAME_LIST)[number];

export interface CliOptionBase {
  readonly type: OptionType;
  readonly short?: CliOptionShortName;
  readonly required?: boolean | CliOptionRequiredFunction;
}

export interface CliOptionStringBase extends CliOptionBase {
  readonly type: 'string';
  readonly choices?: readonly string[];
  readonly multiple?: boolean;
}

export interface CliOptionStringSingle extends CliOptionStringBase {
  readonly multiple?: false;
  readonly defaultValue?: string;
}

export interface CliOptionStringMultiple extends CliOptionStringBase {
  readonly multiple: true;
  readonly defaultValue?: readonly string[];
}

export interface CliOptionBoolean extends CliOptionBase {
  readonly type: 'boolean';
  readonly defaultValue?: boolean;
}

export type CliOption =
  | CliOptionStringSingle
  | CliOptionStringMultiple
  | CliOptionBoolean;
