/**
 * NOESIS — Shared Memory Operations Logic
 * =======================================
 * Single source of truth for array step-counting and exam validation.
 * Imported by BOTH the server (exam validator) AND the client (practice visualizer).
 *
 * Step counting rules:
 *   insert at index i  →  (n - i) shifts + 1 write  =  n - i + 1 total steps
 *   insert at end (i===n) → 1 step  [O(1)]
 *   delete at index i  →  (n - 1 - i) shifts + 1    =  n - i total steps
 *   update at index i  →  1 step always
 *   access at index i  →  1 step always
 *
 * Max array size: 8 elements (8 memory blocks)
 */

export const MAX_ARRAY_SIZE = 8;

export const OPS = { INSERT: 'insert', DELETE: 'delete', UPDATE: 'update', ACCESS: 'access' };

/**
 * Count steps for a single operation (does NOT mutate array).
 * @param {string} op     - 'insert' | 'delete' | 'update' | 'access'
 * @param {number} index  - target index
 * @param {number} n      - current array length (before op)
 * @returns {{ steps: number, timeComplexity: string, spaceComplexity: string, detail: string }}
 */
export function getStepsForOp(op, index, n) {
  switch (op) {
    case OPS.INSERT: {
      const atEnd = index === n;
      const steps = atEnd ? 1 : n - index + 1;
      return {
        steps,
        timeComplexity: atEnd ? 'O(1)' : 'O(n)',
        spaceComplexity: 'O(1)',
        detail: atEnd
          ? `Insert at end → 1 write (O(1))`
          : `Insert at [${index}] → ${n - index} shift${n - index !== 1 ? 's' : ''} + 1 write = ${steps} steps (O(n))`,
      };
    }
    case OPS.DELETE: {
      const steps = n - index;
      return {
        steps,
        timeComplexity: index === n - 1 ? 'O(1)' : 'O(n)',
        spaceComplexity: 'O(1)',
        detail: index === n - 1
          ? `Delete last element → 1 step (O(1))`
          : `Delete at [${index}] → ${n - 1 - index} shift${n - 1 - index !== 1 ? 's' : ''} + 1 remove = ${steps} steps (O(n))`,
      };
    }
    case OPS.UPDATE:
      return { steps: 1, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', detail: `Update at [${index}] → 1 write (O(1))` };
    case OPS.ACCESS:
      return { steps: 1, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', detail: `Access at [${index}] → 1 read (O(1))` };
    default:
      return { steps: 0, timeComplexity: 'O(?)', spaceComplexity: 'O(?)', detail: 'Unknown op' };
  }
}

/**
 * Apply a sequence of operations to a start array.
 * Returns the final array state, total steps used, and any error.
 *
 * @param {number[]} startArray - initial array (copied — not mutated)
 * @param {Array<{op, index, value?}>} operations
 * @returns {{ finalArray: number[], steps: number, opLog: string[], error: string|null }}
 */
export function applyOperations(startArray, operations) {
  const arr = [...startArray];
  let steps = 0;
  const opLog = [];

  for (const { op, index, value } of operations) {
    const n = arr.length;

    // Validate op type
    if (!Object.values(OPS).includes(op)) {
      return { finalArray: arr, steps, opLog, error: `Unknown operation: ${op}` };
    }

    // Boundary checks
    if (op === OPS.INSERT) {
      if (n >= MAX_ARRAY_SIZE) return { finalArray: arr, steps, opLog, error: 'Memory full. RAM is not a clown car.' };
      if (index < 0 || index > n) return { finalArray: arr, steps, opLog, error: `Insert index ${index} out of range [0, ${n}]` };
      const info = getStepsForOp(op, index, n);
      arr.splice(index, 0, value ?? 0);
      steps += info.steps;
      opLog.push(`insert(${index}, ${value ?? 0}) → ${info.detail}`);
    } else if (op === OPS.DELETE) {
      if (n === 0) return { finalArray: arr, steps, opLog, error: 'Array is empty — nothing to delete!' };
      if (index < 0 || index >= n) return { finalArray: arr, steps, opLog, error: `Delete index ${index} out of range [0, ${n - 1}]` };
      const info = getStepsForOp(op, index, n);
      arr.splice(index, 1);
      steps += info.steps;
      opLog.push(`delete(${index}) → ${info.detail}`);
    } else if (op === OPS.UPDATE) {
      if (index < 0 || index >= n) return { finalArray: arr, steps, opLog, error: `Update index ${index} out of range [0, ${n - 1}]` };
      const info = getStepsForOp(op, index, n);
      arr[index] = value ?? 0;
      steps += info.steps;
      opLog.push(`update(${index}, ${value ?? 0}) → ${info.detail}`);
    } else if (op === OPS.ACCESS) {
      if (index < 0 || index >= n) return { finalArray: arr, steps, opLog, error: `Access index ${index} out of range [0, ${n - 1}]` };
      const info = getStepsForOp(op, index, n);
      steps += info.steps;
      opLog.push(`access(${index}) → ${info.detail}`);
    }
  }

  return { finalArray: arr, steps, opLog, error: null };
}

/**
 * Validate an exam submission server-side.
 * @returns {{ passed: boolean, steps: number, stars: number, error: string|null }}
 */
export function validateExam(startArray, operations, goalArray, maxSteps) {
  const { finalArray, steps, error } = applyOperations(startArray, operations);

  if (error) return { passed: false, steps, stars: 0, error };

  const arraysMatch = finalArray.length === goalArray.length &&
    finalArray.every((v, i) => v === goalArray[i]);

  if (!arraysMatch) {
    return {
      passed: false, steps, stars: 0,
      error: `Final array [${finalArray}] doesn't match goal [${goalArray}]`,
    };
  }

  if (steps > maxSteps) {
    return {
      passed: false, steps, stars: 0,
      error: `Too many steps: used ${steps}, budget is ${maxSteps}`,
    };
  }

  // Stars: 1 operation → 3 stars, 2 → 2 stars, 3+ → 1 star
  const stars = operations.length === 1 ? 3 : operations.length === 2 ? 2 : 1;

  return { passed: true, steps, stars, error: null };
}
