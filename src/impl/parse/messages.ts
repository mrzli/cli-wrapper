export function getErrorMessageSpecialOptionNeedsToBeStandalone(
  optionName: string
): string {
  return `'${optionName}' option should not be used with other options. It does not accept any parameters.`;
}

export function getErrorMessageInvalidOptionFormat(optionStr: string): string {
  if (!optionStr.startsWith('-')) {
    return `Expected option, got '${optionStr}'.`;
  }

  return [
    `Invalid option format '${optionStr}'.`,
    'Allowed long form option formats are: --(no-)?-[a-z][a-z0-9]+ or --(no-)?-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)* .',
    'Allowed short form option formats are: -[A-Za-z] or for boolean option list -[A-Za-z]+ .',
  ].join(' ');
}
