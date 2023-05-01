import type { Option } from './option';

export interface CliConfig {
  readonly meta: Meta;
  readonly options: Options;
}

export interface Meta {
  readonly version: string;
}

export interface Options {
  readonly [key: string]: Option;
}
