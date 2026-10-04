// Values safe to use on both server and client.
export const categories = ["social", "entertainment", "gaming", "sports", "economy", "technology", "other"] as const;
export type Category = (typeof categories)[number];
