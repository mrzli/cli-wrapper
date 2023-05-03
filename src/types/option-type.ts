export const OPTION_TYPE_LIST = ['string', 'boolean'] as const;

export type OptionType = (typeof OPTION_TYPE_LIST)[number];
