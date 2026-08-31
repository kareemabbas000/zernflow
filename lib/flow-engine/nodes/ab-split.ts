import type { ABSplitNodeData } from "../types";

export function executeABSplit(data: ABSplitNodeData): string {
  const totalWeight = data.paths.reduce((sum, p) => sum + p.weight, 0);
  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < data.paths.length; i++) {
    cumulative += data.paths[i].weight;
    if (random <= cumulative) {
      return `handle:${data.paths[i].name}`;
    }
  }

  return `handle:${data.paths[0].name}`;
}
