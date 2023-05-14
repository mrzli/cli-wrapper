# CLI Wrapper Library

## Installation

```bash
npm install --save @gmjs/cli-wrapper
```

## Usage

As an example, we are implementing a command called `jsgen`, but this is arbitrary.

```ts
import { join } from 'node:path';
import { cli } from '@gmjs/cli-wrapper';
import { readPackageJsonSync } from '@gmjs/package-json';

export function run(): void {
  const result = cli(
    `
Usage
  $ jsgen <input>

Options
  --config, -c  Path to config file
  --output, -o  Output directory
  --project-name, -p  Project name

Examples
  $ jsgen --config config.json --output . --project-name my-project
`,
    {
      meta: {
        version: readPackageJsonSync(join(__dirname, '..')).version ?? '',
      },
      options: {
        config: {
          type: 'string',
          short: 'c',
          required: true,
        },
        output: {
          type: 'string',
          short: 'o',
          required: false,
        },
        projectName: {
          type: 'string',
          short: 'p',
          required: false,
        },
      },
    }
  );

  console.log(result);
  // use result here however you want
}

run();
```

After executing `jsgen -c config.json -o output -p project`, the above code will output (from `console.log(result)`):

```
{
  success: true,
  options: {
    config: { type: 'string', multiple: false, value: 'config.json' },
    output: { type: 'string', multiple: false, value: 'output' },
    projectName: { type: 'string', multiple: false, value: 'project' }
  }
}
```

If there is an error, for example, if we omit a required parameter, like if we just used `jsgen`.

`cli()` function would output:

```
Missing required option 'config'.
```

And `console.log(result)` would output:

```
{ success: false, options: {} }
```

### Built-in Options

#### Version

Use `--version` or `-v` to output version.

#### Help

Use `--help` or `-h` to output help (which is the description passed in as the first parameter to `cli()`).
