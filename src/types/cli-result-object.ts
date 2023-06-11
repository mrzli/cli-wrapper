import { CliResultOptions } from './cli-result';
import { CliResultType } from './cli-result-type';

export interface CliResultObject {
  readonly type: CliResultType;
  readonly message: string | undefined;
  readonly options: CliResultOptions;
}
