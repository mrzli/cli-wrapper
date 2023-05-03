import type { CliOption } from './option';

export interface CliConfig {
  readonly meta: CliMeta;
  readonly options: CliOptions;
}

export interface CliMeta {
  readonly version: string;
}

export interface CliOptions {
  readonly [key: string]: CliOption;
}
