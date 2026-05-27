export { ELEMENTARY_WORDS } from "./elementary";
export { MIDDLE_WORDS } from "./middle";
export { MIDDLE_REST_WORDS } from "./middle_rest";
export { HIGH1_WORDS } from "./high1";
export { HIGH2_WORDS } from "./high2";

import { ELEMENTARY_WORDS } from "./elementary";
import { MIDDLE_WORDS } from "./middle";
import { MIDDLE_REST_WORDS } from "./middle_rest";
import { HIGH1_WORDS } from "./high1";
import { HIGH2_WORDS } from "./high2";

export const ALL_WORDS = [
  ...ELEMENTARY_WORDS,
  ...MIDDLE_WORDS,
  ...MIDDLE_REST_WORDS,
  ...HIGH1_WORDS,
  ...HIGH2_WORDS,
];
