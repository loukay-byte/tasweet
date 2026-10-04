export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

// Arabic-first: Arabic is the default for anyone without a stated preference.
export const defaultLocale: Locale = "ar";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

// Western digits in both languages, matching common Saudi web usage.
// Switch "ar" to "ar-SA" for Arabic-Indic digits.
export const numberLocale: Record<Locale, string> = { ar: "ar-SA-u-nu-latn", en: "en-US" };

export const formatNumber = (locale: Locale, value: number) =>
  new Intl.NumberFormat(numberLocale[locale]).format(value);

// Fills {placeholders} in dictionary strings.
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

// Picks the plural form for a count (Arabic has zero/one/two/few/many/other)
// and fills in {count}. "zero" is used for 0 when provided, in any language.
export const plural = (locale: Locale, forms: PluralForms, count: number) => {
  const rule = count === 0 && forms.zero ? "zero" : new Intl.PluralRules(locale).select(count);
  return fill(forms[rule] ?? forms.other, { count: formatNumber(locale, count) });
};

// A percentage isolated from surrounding text direction, so "100%" never
// reorders next to Arabic punctuation.
export const formatPercent = (locale: Locale, value: number) =>
  `\u2066${formatNumber(locale, value)}%\u2069`;
