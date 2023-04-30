import type { JestConfigWithTsJest } from 'ts-jest';

export default async (): Promise<JestConfigWithTsJest> => {
  return {
    preset: 'ts-jest',
    verbose: true,
  };
};
