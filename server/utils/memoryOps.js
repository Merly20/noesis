// Shared logic for both client and server to calculate steps and validate operations.
// Operations: 
// { type: 'insert', index: number, value: number }
// { type: 'update', index: number, value: number }
// { type: 'delete', index: number }
// { type: 'access', index: number }

const memoryOps = {
  applyOperations: (startArray, operations) => {
    let arr = [...startArray];
    let totalSteps = 0;
    const log = [];

    for (const op of operations) {
      if (op.type === 'insert') {
        if (op.index < 0 || op.index > arr.length) throw new Error('Invalid index');
        // steps: n - index shifts + 1 write
        const shifts = arr.length - op.index;
        const steps = shifts + 1;
        arr.splice(op.index, 0, op.value);
        totalSteps += steps;
        log.push({ op, steps, arr: [...arr] });
      } else if (op.type === 'delete') {
        if (op.index < 0 || op.index >= arr.length) throw new Error('Invalid index');
        // steps: n - 1 - index shifts + 1
        const shifts = arr.length - 1 - op.index;
        const steps = shifts + 1;
        arr.splice(op.index, 1);
        totalSteps += steps;
        log.push({ op, steps, arr: [...arr] });
      } else if (op.type === 'update') {
        if (op.index < 0 || op.index >= arr.length) throw new Error('Invalid index');
        arr[op.index] = op.value;
        totalSteps += 1;
        log.push({ op, steps: 1, arr: [...arr] });
      } else if (op.type === 'access') {
        if (op.index < 0 || op.index >= arr.length) throw new Error('Invalid index');
        totalSteps += 1;
        log.push({ op, steps: 1, arr: [...arr] });
      } else {
        throw new Error('Unknown operation type');
      }
    }

    return { finalArray: arr, totalSteps, log };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = memoryOps;
} else {
  window.memoryOps = memoryOps;
}
