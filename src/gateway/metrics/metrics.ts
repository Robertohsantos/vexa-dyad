// src/metrics/metrics.ts (placeholder)
export const metrics = {
  counter: (_name: string) => ({ inc: (_v: number = 1) => {} }),
  gauge: (_name: string) => ({ set: (_v: number) => {} })
};
