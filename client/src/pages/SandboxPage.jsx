import React, { useState, useRef, useCallback, useEffect } from 'react';

let _uid = 1;
const uid = () => `m${_uid++}`;

const BASE = 0x1000;
const ADDR_POOL = Array.from({ length: 64 }, (_, i) => BASE + i * 4);
const usedAddrs = new Set();

function allocAddr() {
  for (const a of ADDR_POOL) {
    if (!usedAddrs.has(a)) { usedAddrs.add(a); return a; }
  }
  return 0xDEAD;
}
function freeAddr(a) { usedAddrs.delete(a); }
function fmt(a) { return '0x' + (a || 0).toString(16).toUpperCase(); }

/* ── MULTI-LANGUAGE LEETCODE CHALLENGES DATA ────────────────────────────── */
const LEETCODE_CHALLENGES = [
  {
    id: 'lc206',
    number: 206,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    targetTime: 'O(N)',
    targetSpace: 'O(1)',
    description: 'Given the head of a singly linked list, reverse the list and return the reversed head.',
    codeByLang: {
      js: [
        'function reverseList(head) {',
        '  let prev = null;',
        '  let curr = head;',
        '  while (curr !== null) {',
        '    let nextTemp = curr.next;',
        '    curr.next = prev;',
        '    prev = curr;',
        '    curr = nextTemp;',
        '  }',
        '  return prev;',
        '}'
      ],
      python: [
        'def reverseList(head: ListNode) -> ListNode:',
        '    prev, curr = None, head',
        '    while curr:',
        '        next_temp = curr.next',
        '        curr.next = prev',
        '        prev = curr',
        '        curr = next_temp',
        '    return prev'
      ],
      cpp: [
        'ListNode* reverseList(ListNode* head) {',
        '    ListNode *prev = nullptr;',
        '    ListNode *curr = head;',
        '    while (curr != nullptr) {',
        '        ListNode* nextTemp = curr->next;',
        '        curr->next = prev;',
        '        prev = curr;',
        '        curr = nextTemp;',
        '    }',
        '    return prev;',
        '}'
      ],
      java: [
        'public ListNode reverseList(ListNode head) {',
        '    ListNode prev = null;',
        '    ListNode curr = head;',
        '    while (curr != null) {',
        '        ListNode nextTemp = curr.next;',
        '        curr.next = prev;',
        '        prev = curr;',
        '        curr = nextTemp;',
        '    }',
        '    return prev;',
        '}'
      ]
    },
    initialNodes: [
      { id: 'n1', type: 'llnode', color: '#2F6BFF', value: '1', addr: 0x1000, x: 140, y: 160 },
      { id: 'n2', type: 'llnode', color: '#2F6BFF', value: '2', addr: 0x1004, x: 300, y: 160 },
      { id: 'n3', type: 'llnode', color: '#2F6BFF', value: '3', addr: 0x1008, x: 460, y: 160 },
      { id: 'n4', type: 'llnode', color: '#2F6BFF', value: '4', addr: 0x100C, x: 620, y: 160 },
      { id: 'null1', type: 'nulln', color: '#FF5D5D', value: '', addr: 0x1010, x: 780, y: 170 },
      { id: 'headPtr', type: 'ptr', color: '#FFC93C', value: 'HEAD', addr: 0x1014, x: 140, y: 60 }
    ],
    initialEdges: [
      { id: 'e0', from: 'headPtr', to: 'n1', label: 'head' },
      { id: 'e1', from: 'n1', to: 'n2', label: 'next' },
      { id: 'e2', from: 'n2', to: 'n3', label: 'next' },
      { id: 'e3', from: 'n3', to: 'n4', label: 'next' },
      { id: 'e4', from: 'n4', to: 'null1', label: 'next' }
    ],
    steps: [
      { line: 1, text: 'Initialize prev = null', op: 'connect', detail: 'prev pointer initialized to NULL (0x0000)', codeLine: 1 },
      { line: 2, text: 'Initialize curr = head', op: 'connect', detail: 'curr pointer initialized to node 1 at 0x1000', codeLine: 2 },
      { line: 4, text: 'Loop Step 1: nextTemp = curr.next (node 2)', op: 'connect', detail: 'Save node 2 address (0x1004) to prevent losing reference', codeLine: 4 },
      { line: 5, text: 'Loop Step 1: curr.next = prev (null)', op: 'disconnect', detail: 'Rewire node 1 next pointer to NULL (0x0000)', codeLine: 5, action: 'reverse1' },
      { line: 6, text: 'Loop Step 1: prev = curr (node 1)', op: 'connect', detail: 'Advance prev to node 1 (0x1000)', codeLine: 6 },
      { line: 7, text: 'Loop Step 1: curr = nextTemp (node 2)', op: 'connect', detail: 'Advance curr to node 2 (0x1004)', codeLine: 7 },
      { line: 4, text: 'Loop Step 2: nextTemp = curr.next (node 3)', op: 'connect', detail: 'Save node 3 address (0x1008)', codeLine: 4 },
      { line: 5, text: 'Loop Step 2: curr.next = prev (node 1)', op: 'connect', detail: 'Rewire node 2 next pointer to node 1 (0x1000)', codeLine: 5, action: 'reverse2' },
      { line: 6, text: 'Loop Step 2: prev = curr (node 2)', op: 'connect', detail: 'Advance prev to node 2', codeLine: 6 },
      { line: 7, text: 'Loop Step 2: curr = nextTemp (node 3)', op: 'connect', detail: 'Advance curr to node 3', codeLine: 7 },
      { line: 4, text: 'Loop Step 3: nextTemp = curr.next (node 4)', op: 'connect', detail: 'Save node 4 address (0x100C)', codeLine: 4 },
      { line: 5, text: 'Loop Step 3: curr.next = prev (node 2)', op: 'connect', detail: 'Rewire node 3 next pointer to node 2 (0x1004)', codeLine: 5, action: 'reverse3' },
      { line: 6, text: 'Loop Step 3: prev = curr (node 3)', op: 'connect', detail: 'Advance prev to node 3', codeLine: 6 },
      { line: 7, text: 'Loop Step 3: curr = nextTemp (node 4)', op: 'connect', detail: 'Advance curr to node 4', codeLine: 7 },
      { line: 5, text: 'Loop Step 4: curr.next = prev (node 3)', op: 'connect', detail: 'Rewire node 4 next pointer to node 3 (0x1008)', codeLine: 5, action: 'reverse4' },
      { line: 9, text: 'Return prev (node 4)', op: 'connect', detail: 'Reversal complete! HEAD now points to node 4 (0x100C)', codeLine: 9, action: 'finish' }
    ]
  },
  {
    id: 'lc141',
    number: 141,
    title: 'Linked List Cycle (Floyd\'s Algorithm)',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    targetTime: 'O(N)',
    targetSpace: 'O(1)',
    description: 'Determine if the linked list has a cycle using Floyd\'s Tortoise and Hare two-pointer approach.',
    codeByLang: {
      js: [
        'function hasCycle(head) {',
        '  let slow = head, fast = head;',
        '  while (fast !== null && fast.next !== null) {',
        '    slow = slow.next;',
        '    fast = fast.next.next;',
        '    if (slow === fast) return true; // Cycle detected!',
        '  }',
        '  return false;',
        '}'
      ],
      python: [
        'def hasCycle(head: ListNode) -> bool:',
        '    slow = fast = head',
        '    while fast and fast.next:',
        '        slow = slow.next',
        '        fast = fast.next.next',
        '        if slow == fast:',
        '            return True # Cycle detected!',
        '    return False'
      ],
      cpp: [
        'bool hasCycle(ListNode *head) {',
        '    ListNode *slow = head, *fast = head;',
        '    while (fast != nullptr && fast->next != nullptr) {',
        '        slow = slow->next;',
        '        fast = fast->next->next;',
        '        if (slow == fast) return true;',
        '    }',
        '    return false;',
        '}'
      ],
      java: [
        'public boolean hasCycle(ListNode head) {',
        '    ListNode slow = head, fast = head;',
        '    while (fast != null && fast.next != null) {',
        '        slow = slow.next;',
        '        fast = fast.next.next;',
        '        if (slow == fast) return true;',
        '    }',
        '    return false;',
        '}'
      ]
    },
    initialNodes: [
      { id: 'c1', type: 'llnode', color: '#2F6BFF', value: '3', addr: 0x2000, x: 120, y: 160 },
      { id: 'c2', type: 'llnode', color: '#2F6BFF', value: '2', addr: 0x2004, x: 280, y: 160 },
      { id: 'c3', type: 'llnode', color: '#2F6BFF', value: '0', addr: 0x2008, x: 440, y: 160 },
      { id: 'c4', type: 'llnode', color: '#2F6BFF', value: '-4', addr: 0x200C, x: 600, y: 160 },
      { id: 'slowPtr', type: 'ptr', color: '#17B26A', value: 'SLOW (1x)', addr: 0x2010, x: 120, y: 50 },
      { id: 'fastPtr', type: 'ptr', color: '#FFC93C', value: 'FAST (2x)', addr: 0x2014, x: 120, y: 260 }
    ],
    initialEdges: [
      { id: 'ce1', from: 'c1', to: 'c2', label: 'next' },
      { id: 'ce2', from: 'c2', to: 'c3', label: 'next' },
      { id: 'ce3', from: 'c3', to: 'c4', label: 'next' },
      { id: 'ce4', from: 'c4', to: 'c2', label: 'cycle -> node 2' },
      { id: 'se', from: 'slowPtr', to: 'c1', label: 'slow' },
      { id: 'fe', from: 'fastPtr', to: 'c1', label: 'fast' }
    ],
    steps: [
      { line: 1, text: 'Initialize slow = head, fast = head', op: 'connect', detail: 'Both pointers start at node 3 (0x2000)', codeLine: 1 },
      { line: 3, text: 'Step 1: slow = slow.next (node 2)', op: 'connect', detail: 'Slow moves 1 step forward -> node 2', codeLine: 3, action: 'cycleStep1Slow' },
      { line: 4, text: 'Step 1: fast = fast.next.next (node 0)', op: 'connect', detail: 'Fast moves 2 steps forward -> node 0', codeLine: 4, action: 'cycleStep1Fast' },
      { line: 3, text: 'Step 2: slow = slow.next (node 0)', op: 'connect', detail: 'Slow moves 1 step forward -> node 0', codeLine: 3, action: 'cycleStep2Slow' },
      { line: 4, text: 'Step 2: fast = fast.next.next (node 2)', op: 'connect', detail: 'Fast jumps loop -> node 2', codeLine: 4, action: 'cycleStep2Fast' },
      { line: 3, text: 'Step 3: slow = slow.next (node -4)', op: 'connect', detail: 'Slow moves 1 step -> node -4', codeLine: 3, action: 'cycleStep3Slow' },
      { line: 4, text: 'Step 3: fast = fast.next.next (node -4)', op: 'connect', detail: 'Fast jumps loop -> node -4', codeLine: 4, action: 'cycleStep3Fast' },
      { line: 5, text: 'Check: slow === fast (0x200C === 0x200C)!', op: 'connect', detail: 'COLLISION DETECTED! Both pointers meet at node -4. Cycle confirmed in O(N) time and O(1) space!', codeLine: 5, action: 'finish' }
    ]
  },
  {
    id: 'lc1',
    number: 1,
    title: 'Two Sum (Array vs Hash Map Memory)',
    difficulty: 'Easy',
    topic: 'Array / Hash Table',
    targetTime: 'O(N)',
    targetSpace: 'O(N)',
    description: 'Find two indices in [2, 7, 11, 15] that sum to target = 9. Compare O(N²) nested loops vs O(N) Hash Table allocation.',
    codeByLang: {
      js: [
        'function twoSum(nums, target) {',
        '  const map = new Map(); // Allocate Hash Map in RAM',
        '  for (let i = 0; i < nums.length; i++) {',
        '    let complement = target - nums[i];',
        '    if (map.has(complement)) {',
        '      return [map.get(complement), i];',
        '    }',
        '    map.set(nums[i], i);',
        '  }',
        '}'
      ],
      python: [
        'def twoSum(nums: List[int], target: int) -> List[int]:',
        '    seen = {} # Allocate Hash Map',
        '    for i, num in enumerate(nums):',
        '        complement = target - num',
        '        if complement in seen:',
        '            return [seen[complement], i]',
        '        seen[num] = i'
      ],
      cpp: [
        'vector<int> twoSum(vector<int>& nums, int target) {',
        '    unordered_map<int, int> mp; // Hash Map',
        '    for (int i = 0; i < nums.size(); i++) {',
        '        int complement = target - nums[i];',
        '        if (mp.count(complement)) {',
        '            return {mp[complement], i};',
        '        }',
        '        mp[nums[i]] = i;',
        '    }',
        '    return {};',
        '}'
      ],
      java: [
        'public int[] twoSum(int[] nums, int target) {',
        '    Map<Integer, Integer> map = new HashMap<>();',
        '    for (int i = 0; i < nums.length; i++) {',
        '        int complement = target - nums[i];',
        '        if (map.containsKey(complement)) {',
        '            return new int[]{map.get(complement), i};',
        '        }',
        '        map.put(nums[i], i);',
        '    }',
        '    return new int[]{};',
        '}'
      ]
    },
    initialNodes: [
      { id: 'a0', type: 'cell', color: '#17B26A', value: 'nums[0] = 2', addr: 0x3000, x: 100, y: 140 },
      { id: 'a1', type: 'cell', color: '#17B26A', value: 'nums[1] = 7', addr: 0x3004, x: 230, y: 140 },
      { id: 'a2', type: 'cell', color: '#17B26A', value: 'nums[2] = 11', addr: 0x3008, x: 360, y: 140 },
      { id: 'a3', type: 'cell', color: '#17B26A', value: 'nums[3] = 15', addr: 0x300C, x: 490, y: 140 },
      { id: 'targetBox', type: 'ptr', color: '#FFC93C', value: 'int target = 9', addr: 0x3020, x: 100, y: 50 },
      { id: 'hashTable', type: 'cell', color: '#7C3AED', value: 'Map: {}', addr: 0x4000, x: 630, y: 140 }
    ],
    initialEdges: [],
    steps: [
      { line: 1, text: 'Allocate Hash Map in RAM at 0x4000', op: 'alloc', detail: 'HashMap allocated with O(N) space capacity', codeLine: 1 },
      { line: 3, text: 'i=0: val=2, complement = 9 - 2 = 7', op: 'arrayAccess', detail: 'Access nums[0] = 2. Complement 7 not in map.', codeLine: 3 },
      { line: 7, text: 'map.set(2, 0)', op: 'alloc', detail: 'Store key 2 -> index 0 in Hash Map at 0x4000', codeLine: 7, action: 'ts1' },
      { line: 3, text: 'i=1: val=7, complement = 9 - 7 = 2', op: 'arrayAccess', detail: 'Access nums[1] = 7. Complement 2 FOUND in Hash Map!', codeLine: 3 },
      { line: 5, text: 'MATCH! Return [map.get(2), 1] -> [0, 1]', op: 'connect', detail: 'Found indices [0, 1] in O(N) time and O(N) auxiliary space!', codeLine: 5, action: 'finish' }
    ]
  }
];

const OPS = {
  alloc: {
    name: 'Allocate Memory / Variable',
    time: 'O(1)',
    space: 'O(1)',
    color: '#17B26A',
    steps: () => 1,
    why: (_n, extra) =>
      `Allocates contiguous memory or variable block in RAM. Cost is 1 step. Address ${fmt(extra && extra.addr)}.`,
    analogy: 'Like creating a new box on the shelf with a fresh address label.',
  },
  free: {
    name: 'Free Memory / Variable',
    time: 'O(1)',
    space: 'O(-1)',
    color: '#FF5D5D',
    steps: () => 1,
    why: () => `Deallocates memory address in RAM. Always 1 step.`,
    analogy: 'Like removing one box from the shelf.',
  },
  connect: {
    name: 'Set / Move Pointer Arrow',
    time: 'O(1)',
    space: 'O(1)',
    color: '#2F6BFF',
    steps: () => 1,
    why: (_n, extra) =>
      `Writing a pointer stores target address (${fmt(extra && extra.to)}) into the pointer variable. One write = O(1).`,
    analogy: 'Like moving a signpost arrow to point to a new address.',
  },
  disconnect: {
    name: 'Remove Pointer Arrow',
    time: 'O(1)',
    space: 'O(0)',
    color: '#FFC93C',
    steps: () => 1,
    why: () => `Overwrites pointer variable to NULL (0x0000). Always O(1).`,
    analogy: 'Like erasing a destination from a signpost.',
  },
  arrayAccess: {
    name: 'Array Index Read / Write',
    time: 'O(1)',
    space: 'O(1)',
    color: '#17B26A',
    steps: () => 1,
    why: () =>
      `Arrays store elements contiguously in RAM. Address = Base + Index * Size. One arithmetic lookup = O(1).`,
    analogy: 'Like going directly to flat 5 without knocking on every door.',
  }
};

/* PALETTE WITHOUT ARRAY CELL (User uses Popup Constructor for Arrays) */
const PALETTE = [
  { type: 'llnode', label: 'LL Node', color: '#2F6BFF', hint: 'Linked List node (val + next pointer)' },
  { type: 'tnode', label: 'Tree Node', color: '#7C3AED', hint: 'Binary tree node (left/right)' },
  { type: 'nulln', label: 'NULL', color: '#FF5D5D', hint: 'Null terminator' },
];

const PTR_LABELS = ['next', 'prev', 'slow', 'fast', 'left', 'right', 'head', 'tail', 'temp', '->'];

function MemNode({ node, selected, onDown, onDblClick }) {
  const { type, color, value, addr, x, y } = node;
  const addrStr = fmt(addr);
  const glow = selected
    ? `0 0 0 3px ${color}, 0 0 28px ${color}66`
    : '0 4px 18px rgba(0,0,0,0.5)';

  const base = {
    position: 'absolute', left: x, top: y,
    cursor: 'grab', userSelect: 'none',
    boxShadow: glow, zIndex: selected ? 20 : 5,
    transition: 'box-shadow 0.12s, left 0.3s ease, top 0.3s ease',
  };

  if (type === 'llnode') return (
    <div onMouseDown={onDown} onDoubleClick={onDblClick} style={{
      ...base, width: 112, height: 52, borderRadius: 10,
      background: `linear-gradient(135deg,${color}bb,${color}66)`,
      border: `2px solid ${color}`,
      display: 'flex', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1.5px solid rgba(255,255,255,0.15)' }}>
        <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>val</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{value || '?'}</span>
      </div>
      <div style={{ width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>next</span>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>-&gt;</span>
      </div>
      <span style={{ position: 'absolute', bottom: 2, left: 4, fontSize: '0.46rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{addrStr}</span>
    </div>
  );

  if (type === 'cell') return (
    <div onMouseDown={onDown} onDoubleClick={onDblClick} style={{
      ...base, width: 120, height: 55, borderRadius: 10,
      background: `linear-gradient(145deg,${color}cc,${color}66)`,
      border: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
    }}>
      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{value || '·'}</span>
      <span style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{addrStr}</span>
    </div>
  );

  if (type === 'tnode') return (
    <div onMouseDown={onDown} onDoubleClick={onDblClick} style={{
      ...base, width: 78, height: 78, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%,${color}cc,${color}66)`,
      border: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
    }}>
      <span style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>BST</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{value || '?'}</span>
      <span style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{addrStr}</span>
    </div>
  );

  if (type === 'ptr') return (
    <div onMouseDown={onDown} onDoubleClick={onDblClick} style={{
      ...base, width: 125, height: 40, borderRadius: 8,
      background: 'rgba(255,201,60,0.2)', border: '2px solid #FFC93C',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    }}>
      <span style={{ fontWeight: 800, color: '#ffd96a', fontSize: '0.78rem' }}>{value || 'ptr'}</span>
      <span style={{ color: '#ffd96a', fontSize: '0.85rem' }}>-&gt;</span>
    </div>
  );

  if (type === 'nulln') return (
    <div onMouseDown={onDown} style={{
      ...base, width: 58, height: 34, borderRadius: 7,
      background: 'rgba(255,93,93,0.15)', border: '2px solid #FF5D5D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: 900, color: '#FF5D5D', fontFamily: 'monospace',
    }}>NULL</div>
  );
  return null;
}

function AnalysisCard({ op }) {
  const cfg = OPS[op.type];
  if (!cfg) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${cfg.color}44`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 10, padding: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{cfg.name}</span>
        <span style={{
          fontFamily: 'monospace', fontWeight: 900, fontSize: '0.75rem',
          color: op.steps === 1 ? '#6ee4a8' : '#ff9090',
          background: op.steps === 1 ? 'rgba(23,178,106,0.15)' : 'rgba(255,93,93,0.15)',
          padding: '1px 7px', borderRadius: 4,
        }}>{op.steps} step{op.steps !== 1 ? 's' : ''}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace',
          background: 'rgba(23,178,106,0.2)', color: '#6ee4a8',
          padding: '2px 7px', borderRadius: 4,
        }}>Time: {cfg.time}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace', background: 'rgba(47,107,255,0.15)', color: '#90b8ff', padding: '2px 7px', borderRadius: 4 }}>
          Space: {cfg.space}
        </span>
      </div>
      <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
        {op.detail || cfg.why(op.n || 0, op.extra)}
      </p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', lineHeight: 1.4 }}>
        {cfg.analogy}
      </p>
    </div>
  );
}

function getCenter(node) {
  if (node.type === 'tnode') return { x: node.x + 39, y: node.y + 39 };
  if (node.type === 'nulln') return { x: node.x + 29, y: node.y + 17 };
  if (node.type === 'ptr')   return { x: node.x + 62, y: node.y + 20 };
  if (node.type === 'cell')  return { x: node.x + 60, y: node.y + 27 };
  return { x: node.x + 56, y: node.y + 26 };
}

function getRadius(node) {
  if (node.type === 'tnode') return 39;
  if (node.type === 'nulln') return 4;
  return 10;
}

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState('challenge'); // 'challenge' | 'free'
  const [lang, setLang] = useState('js'); // 'js' | 'python' | 'cpp' | 'java'
  const [codeMode, setCodeMode] = useState('preset'); // 'preset' | 'custom'
  const [customCode, setCustomCode] = useState('');

  // Challenge State
  const [challengeId, setChallengeId] = useState('lc206');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winModal, setWinModal] = useState(false);

  // Modals for Creating Array / Variable
  const [showArrayModal, setShowArrayModal] = useState(false);
  const [arrayName, setArrayName] = useState('nums');
  const [arraySize, setArraySize] = useState(5);
  const [arrayDataType, setArrayDataType] = useState('int'); // 'int' | 'float' | 'char' | 'pointer'

  const [showVarModal, setShowVarModal] = useState(false);
  const [varName, setVarName] = useState('prev');
  const [varType, setVarType] = useState('pointer'); // 'pointer' | 'int' | 'float' | 'char'
  const [varVal, setVarVal] = useState('0x0000');

  // Memory Canvas State
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tool, setTool] = useState('move');
  const [selected, setSelected] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [ptrLbl, setPtrLbl] = useState('next');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [ops, setOps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [offset, setOffset] = useState({ x: 60, y: 60 });

  const canvasRef = useRef(null);
  const dragging = useRef(null);
  const panning = useRef(null);
  const playTimer = useRef(null);

  const currChallenge = LEETCODE_CHALLENGES.find(c => c.id === challengeId) || LEETCODE_CHALLENGES[0];

  // Load LeetCode Challenge
  const loadChallenge = (ch) => {
    setChallengeId(ch.id);
    setStepIdx(0);
    setIsPlaying(false);
    setWinModal(false);
    setNodes(JSON.parse(JSON.stringify(ch.initialNodes)));
    setEdges(JSON.parse(JSON.stringify(ch.initialEdges)));
    setOps([]);
    setTotalSteps(0);
  };

  useEffect(() => {
    if (activeTab === 'challenge') {
      loadChallenge(currChallenge);
    } else {
      clearAll();
    }
  }, [activeTab]);

  const pushOp = (type, extra, overrideSteps, customDetail) => {
    const cfg = OPS[type];
    if (!cfg) return;
    const n = nodes.length;
    const steps = overrideSteps !== undefined ? overrideSteps : cfg.steps(n, extra);
    setOps(prev => [{ id: uid(), type, extra: extra || {}, steps, n, detail: customDetail }, ...prev].slice(0, 30));
    setTotalSteps(t => t + steps);
  };

  // Create Custom Array via Popup Modal (Name, Size, DataType)
  const createArrayOfSize = () => {
    const startX = 100, startY = 160;
    const newArrayNodes = [];
    const baseAddr = allocAddr();
    const bytesPerElement = arrayDataType === 'char' ? 1 : arrayDataType === 'pointer' ? 8 : 4;

    for (let i = 0; i < arraySize; i++) {
      newArrayNodes.push({
        id: uid(),
        type: 'cell',
        color: '#17B26A',
        value: `${arrayDataType} ${arrayName}[${i}]`,
        addr: baseAddr + i * bytesPerElement,
        x: startX + i * 135,
        y: startY
      });
    }
    setNodes(ns => [...ns, ...newArrayNodes]);
    pushOp('alloc', { addr: baseAddr }, arraySize, `Allocated Array '${arrayDataType} ${arrayName}[${arraySize}]' at contiguous RAM address ${fmt(baseAddr)} (${bytesPerElement} bytes/element)`);
    setShowArrayModal(false);
  };

  // Create Variable via Popup Modal (Name, Type, Value)
  const createVariable = () => {
    const addr = allocAddr();
    const formattedVal = varType === 'pointer' ? varVal : `${varName} = ${varVal}`;
    const displayLabel = varType === 'pointer' ? `${varName}` : `${varType} ${varName} = ${varVal}`;

    const varNode = {
      id: uid(),
      type: 'ptr',
      color: '#FFC93C',
      value: displayLabel,
      addr: addr,
      x: 140 + (nodes.length % 5) * 130,
      y: 60
    };
    setNodes(ns => [...ns, varNode]);
    pushOp('alloc', { addr }, 1, `Created variable '${varType} ${varName}' initialized to ${varVal} at RAM address ${fmt(addr)}`);
    setShowVarModal(false);
  };

  // Step Algorithm Execution for LeetCode Challenge
  const nextChallengeStep = () => {
    if (stepIdx >= currChallenge.steps.length) {
      setWinModal(true);
      return;
    }
    const currentStep = currChallenge.steps[stepIdx];
    pushOp(currentStep.op, {}, 1, currentStep.detail);

    if (currentStep.action) {
      if (currentStep.action === 'reverse1') {
        setEdges(es => es.map(e => e.id === 'e1' ? { ...e, to: 'null1', label: 'next=null' } : e));
      } else if (currentStep.action === 'reverse2') {
        setEdges(es => es.map(e => e.id === 'e2' ? { ...e, to: 'n1', label: 'next' } : e));
      } else if (currentStep.action === 'reverse3') {
        setEdges(es => es.map(e => e.id === 'e3' ? { ...e, to: 'n2', label: 'next' } : e));
      } else if (currentStep.action === 'reverse4') {
        setEdges(es => es.map(e => e.id === 'e4' ? { ...e, to: 'n3', label: 'next' } : e));
      } else if (currentStep.action === 'finish') {
        setEdges(es => es.map(e => e.id === 'e0' ? { ...e, to: 'n4' } : e));
        setWinModal(true);
      } else if (currentStep.action === 'cycleStep1Slow') {
        setEdges(es => es.map(e => e.id === 'se' ? { ...e, to: 'c2' } : e));
      } else if (currentStep.action === 'cycleStep1Fast') {
        setEdges(es => es.map(e => e.id === 'fe' ? { ...e, to: 'c3' } : e));
      } else if (currentStep.action === 'cycleStep2Slow') {
        setEdges(es => es.map(e => e.id === 'se' ? { ...e, to: 'c3' } : e));
      } else if (currentStep.action === 'cycleStep2Fast') {
        setEdges(es => es.map(e => e.id === 'fe' ? { ...e, to: 'c2' } : e));
      } else if (currentStep.action === 'cycleStep3Slow') {
        setEdges(es => es.map(e => e.id === 'se' ? { ...e, to: 'c4' } : e));
      } else if (currentStep.action === 'cycleStep3Fast') {
        setEdges(es => es.map(e => e.id === 'fe' ? { ...e, to: 'c4' } : e));
      } else if (currentStep.action === 'ts1') {
        setNodes(ns => ns.map(n => n.id === 'hashTable' ? { ...n, value: 'Map: {2:0}' } : n));
      }
    }

    if (stepIdx + 1 >= currChallenge.steps.length) {
      setWinModal(true);
    }
    setStepIdx(i => i + 1);
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      clearInterval(playTimer.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playTimer.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= currChallenge.steps.length - 1) {
            clearInterval(playTimer.current);
            setIsPlaying(false);
            setWinModal(true);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1200);
    }
  };

  const onMouseMove = useCallback(e => {
    if (dragging.current) {
      const { id, ox, oy } = dragging.current;
      setNodes(ns => ns.map(n => n.id === id ? { ...n, x: e.clientX - ox, y: e.clientY - oy } : n));
    }
    if (panning.current) {
      const { sx, sy, ox, oy } = panning.current;
      setOffset({ x: ox + e.clientX - sx, y: oy + e.clientY - sy });
    }
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = null; panning.current = null; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [onMouseMove, onMouseUp]);

  const onDrop = (e) => {
    e.preventDefault();
    const ptype = e.dataTransfer.getData('ptype');
    const pt = PALETTE.find(p => p.type === ptype);
    if (!pt) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x - 50;
    const y = e.clientY - rect.top - offset.y - 35;
    const addr = allocAddr();
    const node = { id: uid(), type: ptype, color: pt.color, value: '', addr, x, y };
    setNodes(ns => [...ns, node]);
    pushOp('alloc', { addr }, 1);
  };

  const onNodeDown = (e, node) => {
    e.stopPropagation();
    if (tool === 'delete') {
      freeAddr(node.addr);
      setNodes(ns => ns.filter(n => n.id !== node.id));
      setEdges(es => es.filter(e => e.from !== node.id && e.to !== node.id));
      pushOp('free', {}, 1);
      return;
    }
    if (tool === 'connect') {
      if (!connecting) {
        setConnecting(node.id);
      } else if (connecting !== node.id) {
        const toNode = nodes.find(n => n.id === node.id);
        setEdges(es => [...es, { id: uid(), from: connecting, to: node.id, label: ptrLbl }]);
        setConnecting(null);
        pushOp('connect', { to: toNode ? toNode.addr : 0 }, 1);
      }
      return;
    }
    setSelected(node.id);
    dragging.current = { id: node.id, ox: e.clientX - node.x, oy: e.clientY - node.y };
  };

  const onNodeDblClick = (e, node) => {
    e.stopPropagation();
    setEditId(node.id);
    setEditVal(node.value || '');
  };

  const commitEdit = () => {
    setNodes(ns => ns.map(n => n.id === editId ? { ...n, value: editVal } : n));
    setEditId(null); setEditVal('');
  };

  const onCanvasDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      setSelected(null);
      if (tool !== 'connect') setConnecting(null);
      panning.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const deleteEdge = (id) => {
    if (tool === 'delete') { setEdges(es => es.filter(e => e.id !== id)); pushOp('disconnect', {}, 1); }
  };

  const clearAll = () => {
    nodes.forEach(n => freeAddr(n.addr));
    setNodes([]); setEdges([]); setOps([]); setTotalSteps(0);
    setSelected(null); setConnecting(null);
  };

  const codeLines = codeMode === 'preset' ? (currChallenge.codeByLang[lang] || currChallenge.codeByLang['js']) : customCode.split('\n');
  const currentCodeLine = activeTab === 'challenge' && currChallenge.steps[stepIdx] ? currChallenge.steps[stepIdx].codeLine : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', background: '#0b1126' }}>
      
      {/* ══ TOP MODE & LANGUAGE BAR ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 1.25rem', background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 40
      }}>
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('challenge')}
            style={{
              padding: '0.45rem 1rem', borderRadius: 8, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              background: activeTab === 'challenge' ? '#2F6BFF' : 'rgba(255,255,255,0.06)',
              border: activeTab === 'challenge' ? '1px solid #5585ff' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', boxShadow: activeTab === 'challenge' ? '0 0 16px rgba(47,107,255,0.4)' : 'none'
            }}
          >
            ⚔️ LeetCode Memory Games
          </button>
          <button
            onClick={() => setActiveTab('free')}
            style={{
              padding: '0.45rem 1rem', borderRadius: 8, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              background: activeTab === 'free' ? '#17B26A' : 'rgba(255,255,255,0.06)',
              border: activeTab === 'free' ? '1px solid #17B26A' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', boxShadow: activeTab === 'free' ? '0 0 16px rgba(23,178,106,0.4)' : 'none'
            }}
          >
            🛠️ Free Memory Architect
          </button>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>Language:</span>
          {[
            { id: 'js', label: 'JavaScript 📜' },
            { id: 'python', label: 'Python 🐍' },
            { id: 'cpp', label: 'C++ ⚡' },
            { id: 'java', label: 'Java ☕' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              style={{
                padding: '0.35rem 0.65rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                background: lang === l.id ? 'rgba(47,107,255,0.25)' : 'rgba(255,255,255,0.05)',
                border: lang === l.id ? '1px solid #5585ff' : '1px solid rgba(255,255,255,0.1)',
                color: lang === l.id ? '#90b8ff' : 'rgba(255,255,255,0.6)'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* LeetCode Challenge Picker */}
        {activeTab === 'challenge' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {LEETCODE_CHALLENGES.map(c => (
              <button
                key={c.id}
                onClick={() => loadChallenge(c)}
                style={{
                  padding: '0.35rem 0.65rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                  background: challengeId === c.id ? 'rgba(255,201,60,0.2)' : 'rgba(255,255,255,0.05)',
                  border: challengeId === c.id ? '1px solid #FFC93C' : '1px solid rgba(255,255,255,0.1)',
                  color: challengeId === c.id ? '#FFC93C' : 'rgba(255,255,255,0.7)'
                }}
              >
                #{c.number} {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ MAIN WORKSPACE ══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ══ LEFT COLUMN: CODE & CONSTRUCTOR POPUPS ══ */}
        <div style={{ width: 320, flexShrink: 0, background: 'rgba(0,0,0,0.6)', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', zIndex: 30 }}>

          {activeTab === 'challenge' ? (
            <>
              {/* Challenge Card Header */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FFC93C', fontFamily: 'monospace' }}>LeetCode #{currChallenge.number}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(23,178,106,0.2)', color: '#6ee4a8', padding: '2px 6px', borderRadius: 4 }}>{currChallenge.difficulty}</span>
                </div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 800 }}>{currChallenge.title}</h3>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{currChallenge.description}</p>
              </div>

              {/* Step Controls */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={nextChallengeStep}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: 8, background: '#2F6BFF', border: 'none',
                    color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(47,107,255,0.4)'
                  }}
                >
                  ▶ Step Algorithm
                </button>
                <button
                  onClick={toggleAutoPlay}
                  style={{
                    padding: '0.55rem 0.85rem', borderRadius: 8,
                    background: isPlaying ? '#FF5D5D' : 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  {isPlaying ? '⏸ Pause' : '⚡ Auto'}
                </button>
                <button
                  onClick={() => loadChallenge(currChallenge)}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                >
                  ↺
                </button>
              </div>

              {/* Code Mode Switcher */}
              <div style={{ display: 'flex', gap: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                <button
                  onClick={() => setCodeMode('preset')}
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                    background: codeMode === 'preset' ? 'rgba(47,107,255,0.2)' : 'transparent',
                    color: codeMode === 'preset' ? '#90b8ff' : 'rgba(255,255,255,0.5)', border: 'none'
                  }}
                >
                  Algorithm View
                </button>
                <button
                  onClick={() => setCodeMode('custom')}
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                    background: codeMode === 'custom' ? 'rgba(23,178,106,0.2)' : 'transparent',
                    color: codeMode === 'custom' ? '#6ee4a8' : 'rgba(255,255,255,0.5)', border: 'none'
                  }}
                >
                  📝 Custom Code
                </button>
              </div>

              {/* Code Viewer / Editor */}
              {codeMode === 'preset' ? (
                <div style={{ background: '#070b19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem', overflowX: 'auto' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Active Code ({lang.toUpperCase()})
                  </div>
                  <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.73rem', lineHeight: 1.5 }}>
                    {codeLines.map((line, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: currentCodeLine === idx ? 'rgba(255,201,60,0.25)' : 'transparent',
                          color: currentCodeLine === idx ? '#FFC93C' : 'rgba(255,255,255,0.7)',
                          padding: '1px 4px', borderRadius: 3, fontWeight: currentCodeLine === idx ? 800 : 400
                        }}
                      >
                        <span style={{ display: 'inline-block', width: 22, color: 'rgba(255,255,255,0.2)', select: 'none' }}>{idx + 1}</span>
                        {line}
                      </div>
                    ))}
                  </pre>
                </div>
              ) : (
                <div style={{ background: '#070b19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Write Custom {lang.toUpperCase()} Code
                  </div>
                  <textarea
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    placeholder={`// Write your custom ${lang.toUpperCase()} code here...`}
                    style={{
                      width: '100%', height: 160, background: 'transparent', border: 'none',
                      color: '#6ee4a8', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* RAM Constructor Buttons */}
              <p style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>RAM Constructors</p>

              <button
                onClick={() => setShowArrayModal(true)}
                style={{
                  padding: '0.65rem 0.85rem', borderRadius: 8, background: 'rgba(23,178,106,0.2)',
                  border: '1px solid #17B26A', color: '#6ee4a8', fontWeight: 800, fontSize: '0.82rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                📦 Create Array (Name, Size, Type)
              </button>

              <button
                onClick={() => setShowVarModal(true)}
                style={{
                  padding: '0.65rem 0.85rem', borderRadius: 8, background: 'rgba(255,201,60,0.2)',
                  border: '1px solid #FFC93C', color: '#FFC93C', fontWeight: 800, fontSize: '0.82rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                📌 Create Variable (Name, Type, Value)
              </button>

              <p style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.4rem' }}>Heap Node Palette</p>

              {PALETTE.map(pt => (
                <div key={pt.type} draggable onDragStart={e => e.dataTransfer.setData('ptype', pt.type)} title={pt.hint}
                  style={{ padding: '0.5rem 0.65rem', borderRadius: 9, cursor: 'grab', userSelect: 'none', background: pt.color + '18', border: '1.5px solid ' + pt.color + '44', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: pt.color, flexShrink: 0 }} />
                  {pt.label}
                </div>
              ))}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem' }}>
                <p style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>Pointer Arrow Label</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.22rem' }}>
                  {PTR_LABELS.map(l => (
                    <button key={l} onClick={() => setPtrLbl(l)} style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer', background: ptrLbl === l ? '#2F6BFF' : 'rgba(255,255,255,0.07)', border: ptrLbl === l ? '1px solid #5585ff' : '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem' }}>
                <p style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem' }}>Action Tool</p>
                {[
                  { id: 'move', label: 'Move / Position' },
                  { id: 'connect', label: 'Connect Pointer Arrow' },
                  { id: 'delete', label: 'Delete' },
                ].map(t => (
                  <button key={t.id} onClick={() => { setTool(t.id); setConnecting(null); }} style={{ width: '100%', marginBottom: '0.28rem', padding: '0.42rem 0.65rem', borderRadius: 7, cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', background: tool === t.id ? 'rgba(47,107,255,0.3)' : 'rgba(255,255,255,0.05)', border: tool === t.id ? '1.5px solid #5585ff' : '1.5px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                    {t.id === 'move' ? '✋' : t.id === 'connect' ? '🔗' : '🗑'} {t.label}
                  </button>
                ))}
                <button onClick={clearAll} style={{ width: '100%', padding: '0.38rem 0.65rem', borderRadius: 7, cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', background: 'rgba(255,93,93,0.12)', border: '1.5px solid rgba(255,93,93,0.3)', color: '#ff9090' }}>
                  Clear all RAM
                </button>
              </div>
            </>
          )}
        </div>

        {/* ══ MIDDLE COLUMN: INTERACTIVE MEMORY CANVAS ══ */}
        <div ref={canvasRef} onDrop={onDrop} onDragOver={e => e.preventDefault()} onMouseDown={onCanvasDown}
          onClick={e => { if (e.target === canvasRef.current || e.target.tagName === 'svg') setSelected(null); }}
          style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: tool === 'connect' ? 'crosshair' : 'default' }}
        >
          {/* Dot grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="dots" x={offset.x % 28} y={offset.y % 28} width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* World */}
          <div style={{ position: 'absolute', inset: 0, transform: `translate(${offset.x}px,${offset.y}px)` }}>
            {/* Arrows */}
            <svg style={{ position: 'absolute', inset: 0, width: '9999px', height: '9999px', overflow: 'visible', pointerEvents: 'none' }}>
              <defs>
                <marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.65)" />
                </marker>
                <marker id="ahd" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#FF5D5D" />
                </marker>
              </defs>
              {edges.map(edge => {
                const fn = nodes.find(n => n.id === edge.from);
                const tn = nodes.find(n => n.id === edge.to);
                if (!fn || !tn) return null;
                const fc = getCenter(fn), tc = getCenter(tn);
                const dx = tc.x - fc.x, dy = tc.y - fc.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const r1 = getRadius(fn), r2 = getRadius(tn);
                const x1 = fc.x + (dx / len) * r1, y1 = fc.y + (dy / len) * r1;
                const x2 = tc.x - (dx / len) * r2, y2 = tc.y - (dy / len) * r2;
                const mx = (fc.x + tc.x) / 2, my = (fc.y + tc.y) / 2;
                const isDel = tool === 'delete';
                return (
                  <g key={edge.id} style={{ pointerEvents: 'all', cursor: isDel ? 'pointer' : 'default' }} onClick={() => deleteEdge(edge.id)}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={14} />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isDel ? 'rgba(255,93,93,0.7)' : 'rgba(255,255,255,0.55)'} strokeWidth="2" markerEnd={isDel ? 'url(#ahd)' : 'url(#ah)'} />
                    <text x={mx} y={my - 9} textAnchor="middle" style={{ fontSize: '0.66rem', fill: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}>{edge.label}</text>
                    <text x={mx} y={my + 4} textAnchor="middle" style={{ fontSize: '0.5rem', fill: 'rgba(140,190,255,0.45)', fontFamily: 'monospace', pointerEvents: 'none' }}>{fmt(tn.addr)}</text>
                  </g>
                );
              })}
            </svg>

            {nodes.map(node => (
              <MemNode key={node.id} node={node} selected={selected === node.id}
                onDown={e => onNodeDown(e, node)}
                onDblClick={e => onNodeDblClick(e, node)} />
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '1rem' }}>
            <span>{nodes.length} RAM nodes</span>
            <span>{edges.length} pointers</span>
            <span style={{ color: '#90b8ff' }}>{totalSteps} total steps</span>
          </div>
        </div>

        {/* ══ RIGHT COLUMN: REAL-TIME COMPLEXITY ANALYSIS ══ */}
        <div style={{ width: 300, flexShrink: 0, background: 'rgba(0,0,0,0.6)', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', zIndex: 30 }}>
          <div style={{ padding: '0.8rem 0.9rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(47,107,255,0.1)' }}>
            <div style={{ fontWeight: 900, color: '#fff', fontSize: '0.88rem', marginBottom: '0.2rem' }}>Complexity Analysis</div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
              <span>Steps: <b style={{ color: '#90b8ff' }}>{totalSteps}</b></span>
              <span>Operations: <b style={{ color: '#6ee4a8' }}>{ops.length}</b></span>
            </div>
          </div>

          {/* Live op log */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {ops.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.82rem', marginTop: '2.5rem', lineHeight: 1.6 }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</p>
                <p>Click "Create Array" or "Create Variable" to instantiate memory blocks and observe complexity!</p>
              </div>
            ) : ops.map(op => <AnalysisCard key={op.id} op={op} />)}
          </div>
        </div>

      </div>

      {/* CREATE ARRAY POPUP MODAL (NAME, SIZE, DATATYPE) */}
      {showArrayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#131a3e', border: '1.5px solid #17B26A', borderRadius: 14, padding: '1.5rem', width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: 0, color: '#6ee4a8', fontSize: '1rem', fontWeight: 800 }}>📦 Create Contiguous Array</h3>

            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Array Name:</label>
                <input
                  value={arrayName}
                  onChange={e => setArrayName(e.target.value)}
                  placeholder="e.g. nums, arr, prices"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Size (N):</label>
                  <input
                    type="number"
                    min="1" max="10"
                    value={arraySize}
                    onChange={e => setArraySize(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Data Type:</label>
                  <select
                    value={arrayDataType}
                    onChange={e => setArrayDataType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: '#1a234a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="int">int (4B)</option>
                    <option value="float">float (4B)</option>
                    <option value="char">char (1B)</option>
                    <option value="pointer">pointer (8B)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={createArrayOfSize} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: '#17B26A', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Instantiate Array</button>
              <button onClick={() => setShowArrayModal(false)} style={{ padding: '0.6rem 0.85rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE VARIABLE POPUP MODAL (NAME, TYPE, VALUE) */}
      {showVarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#131a3e', border: '1.5px solid #FFC93C', borderRadius: 14, padding: '1.5rem', width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: 0, color: '#FFC93C', fontSize: '1rem', fontWeight: 800 }}>📌 Create Variable / Pointer</h3>

            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Variable Name:</label>
                  <input
                    value={varName}
                    onChange={e => setVarName(e.target.value)}
                    placeholder="e.g. i, prev, curr"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Variable Type:</label>
                  <select
                    value={varType}
                    onChange={e => setVarType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: '#1a234a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="pointer">pointer</option>
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="char">char</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 3 }}>Initial Value / Address:</label>
                <input
                  value={varVal}
                  onChange={e => setVarVal(e.target.value)}
                  placeholder="e.g. 0x1000 or 0 or null"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={createVariable} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: '#FFC93C', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Create Variable</button>
              <button onClick={() => setShowVarModal(false)} style={{ padding: '0.6rem 0.85rem', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* WIN MODAL */}
      {winModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#131a3e', border: '2px solid #17B26A', borderRadius: 16,
            padding: '2rem', width: 340, textAlign: 'center', boxShadow: '0 20px 60px rgba(23,178,106,0.4)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 900 }}>Challenge Solved!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              You solved <b style={{ color: '#FFC93C' }}>#{currChallenge.number} {currChallenge.title}</b> with optimal memory operations!
            </p>
            <div style={{ background: 'rgba(23,178,106,0.15)', border: '1px solid #17B26A', borderRadius: 10, padding: '0.85rem', margin: '1.25rem 0' }}>
              <div style={{ fontSize: '0.8rem', color: '#6ee4a8', fontWeight: 800 }}>⚡ Runtime: 0ms (Beats 100%)</div>
              <div style={{ fontSize: '0.8rem', color: '#90b8ff', fontWeight: 800, marginTop: '0.3rem' }}>💾 Memory: {currChallenge.targetSpace} (Optimal)</div>
            </div>
            <button
              onClick={() => setWinModal(false)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 10, background: '#17B26A',
                border: 'none', color: '#fff', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer'
              }}
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
