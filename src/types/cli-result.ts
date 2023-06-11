import { CliResultOption } from './cli-result-option';
import { CliResultType } from './cli-result-type';

export interface CliResult {
  readonly type: CliResultType;
  readonly options: CliResultOptions;
}

export interface CliResultOptions {
  readonly [key: string]: CliResultOption;
}
