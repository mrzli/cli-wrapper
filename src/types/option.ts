import type { Options } from './cli-config';

export const OPTION_TYPE_LIST = ['string', 'boolean'] as const;

export type OptionType = (typeof OPTION_TYPE_LIST)[number];

export type OptionRequiredFunction = (options: Options) => boolean;

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

export type OptionShortName = (typeof OPTION_SHORT_NAME_LIST)[number];

export interface OptionBase {
  readonly type: OptionType;
  readonly description: string;
  readonly short?: OptionShortName;
  readonly required?: boolean | OptionRequiredFunction;
}

export interface OptionStringBase extends OptionBase {
  readonly type: 'string';
  readonly choices?: readonly string[];
  readonly multiple?: boolean;
}

export interface OptionStringSingle extends OptionStringBase {
  readonly multiple?: false;
  readonly defaultValue?: string;
}

export interface OptionStringMultiple extends OptionStringBase {
  readonly multiple: true;
  readonly defaultValue?: readonly string[];
}

export interface OptionBoolean extends OptionBase {
  readonly type: 'boolean';
  readonly defaultValue?: boolean;
}

export type Option = OptionStringSingle | OptionStringMultiple | OptionBoolean;
