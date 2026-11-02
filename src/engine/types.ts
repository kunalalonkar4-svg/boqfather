/** One line of the step-by-step working shown under every calculator. */
export interface Step {
  label: string;
  formula?: string;
  value: string;
}

/** Every engine function returns its numbers, the working, and the assumptions used. */
export interface CalcResult<T> {
  values: T;
  steps: Step[];
  assumptions: string[];
}
