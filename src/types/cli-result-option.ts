import { OptionType } from './option-type';

export interface CliResultOptionBase {
  readonly type: OptionType;
}

export interface CliResultOptionStringBase extends CliResultOptionBase {
  readonly type: 'string';
  readonly multiple: boolean;
}

export interface CliResultOptionStringSingle extends CliResultOptionStringBase {
  readonly multiple: false;
  readonly value: string;
}

export interface CliResultOptionStringMultiple
  extends CliResultOptionStringBase {
  readonly multiple: true;
  readonly value: readonly string[];
}

export interface CliResultOptionBoolean extends CliResultOptionBase {
  readonly type: 'boolean';
  readonly value: boolean;
}

export type CliResultOption =
  | CliResultOptionStringSingle
  | CliResultOptionStringMultiple
  | CliResultOptionBoolean;
