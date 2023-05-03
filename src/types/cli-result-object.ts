import { CliResultOptions } from './cli-result';

export interface CliResultObject {
  readonly success: boolean;
  readonly message: string | undefined;
  readonly options: CliResultOptions;
}
