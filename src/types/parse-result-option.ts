import { OptionType } from './option';

export interface ParseResultOptionBase {
  readonly type: OptionType;
  readonly name: string;
}

export interface ParseResultOptionStringBase extends ParseResultOptionBase {
  readonly type: 'string';
  readonly multiple?: boolean;
}

export interface ParseResultOptionStringSingle
  extends ParseResultOptionStringBase {
  readonly multiple?: false;
  readonly value?: string | undefined;
}

export interface ParseResultOptionStringMultiple
  extends ParseResultOptionStringBase {
  readonly multiple: true;
  readonly value?: readonly string[] | undefined;
}

export interface ParseResultOptionBoolean extends ParseResultOptionBase {
  readonly type: 'boolean';
  readonly value?: boolean | undefined;
}

export type ParseResultOption =
  | ParseResultOptionStringSingle
  | ParseResultOptionStringMultiple
  | ParseResultOptionBoolean;
