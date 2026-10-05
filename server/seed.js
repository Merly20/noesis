/**
 * NOESIS Comprehensive Seed Script
 * Seeds: Levels 1-8 (Full Syllabus for Arrays, Sorting, Two Pointers, Linked Lists, Stacks, Hash Maps, Trees, Graphs),
 *        Topics, Exam Tasks, Demo Accounts (alice, bob, admin), Settings
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Level from './models/Level.js';
import Topic from './models/Topic.js';
import ExamTask from './models/ExamTask.js';
import Progress from './models/Progress.js';
import Settings from './models/Settings.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB');

// Clear existing data
await Promise.all([
  User.deleteMany({}), Level.deleteMany({}), Topic.deleteMany({}),
  ExamTask.deleteMany({}), Progress.deleteMany({}), Settings.deleteMany({}),
]);
console.log('🗑️  Cleared existing data');

// ── USERS ──────────────────────────────────────────────────────────────────
const adminHash = await bcrypt.hash('admin123', 12);
const learner1Hash = await bcrypt.hash('learn123', 12);
const learner2Hash = await bcrypt.hash('demo123', 12);

const [admin, learner1, learner2] = await User.create([
  { username: 'admin',   email: 'admin@noesis.dev',   passwordHash: adminHash,    role: 'admin',   points: 0 },
  { username: 'alice',   email: 'alice@noesis.dev',   passwordHash: learner1Hash, role: 'learner', points: 450 },
  { username: 'bob',     email: 'bob@noesis.dev',     passwordHash: learner2Hash, role: 'learner', points: 180 },
]);
console.log('👤 Users created: admin / admin123, alice / learn123, bob / demo123');

// ── LEVELS SYLLABUS ────────────────────────────────────────────────────────
const levelsData = [
  { number: 1, title: 'Array Mechanics & Memory',  icon: '📦', description: 'Contiguous RAM allocation, index arithmetic, insertion & deletion costs.', order: 1, comingSoon: false },
  { number: 2, title: 'Array Sorting & Complexity', icon: '🔢', description: 'Bubble, Selection, Insertion, and Merge sort. Why Big-O changes.', order: 2, comingSoon: false },
  { number: 3, title: 'Two Pointers & Sliding Window', icon: '🎯', description: 'Two Pointers, Fast & Slow, and Sliding Window memory patterns.', order: 3, comingSoon: false },
  { number: 4, title: 'Linked Lists Mastery',       icon: '🔗', description: 'Singly Linked Lists, Doubly Linked Lists, Cycle Detection & Reversal.', order: 4, comingSoon: false },
  { number: 5, title: 'Stacks & Queues',           icon: '📚', description: 'LIFO Call Stack memory frames & FIFO Queue buffers.', order: 5, comingSoon: false },
  { number: 6, title: 'Hash Maps & O(1) Memory',    icon: '#️⃣', description: 'Direct address hashing, bucket collisions, and O(1) lookups.', order: 6, comingSoon: false },
  { number: 7, title: 'Binary Trees & BST',        icon: '🌳', description: 'Root, Left/Right child pointers, Traversal, and Tree Inversion.', order: 7, comingSoon: false },
  { number: 8, title: 'Graphs & Heaps',            icon: '🏆', description: 'Adjacency Lists, BFS/DFS traversal, and Min-Heap array indexing (2i+1).', order: 8, comingSoon: false },
];

const levels = await Level.create(levelsData);
console.log(`📊 Created ${levels.length} complete curriculum levels`);

// ── TOPICS SYLLABUS ────────────────────────────────────────────────────────
const topicsData = [
  // LEVEL 1: ARRAY MECHANICS
  {
    levelId: levels[0]._id, title: 'Array Allocation in RAM', order: 1,
    learnContent: '<h2>Array Contiguous RAM Allocation</h2><p>Arrays store elements in consecutive memory slots. Base_address + Index * Size computes target memory instantly in O(1) time.</p>',
    complexityNotes: { time: 'O(1) access', space: 'O(N) memory', summary: 'Direct memory index computation.' },
    startArray: [10, 20, 30, 40],
    missionText: 'Explore contiguous RAM addresses from 0x1000 onwards!',
    leetcodeLinks: [{ label: 'LeetCode #1929: Concatenation of Array', url: 'https://leetcode.com/problems/concatenation-of-array/', number: 1929 }]
  },
  {
    levelId: levels[0]._id, title: 'Array Insertion & Shifting', order: 2,
    learnContent: '<h2>Array Insertion Cost</h2><p>Inserting at index 0 forces all subsequent elements to shift right in RAM, costing O(N) steps!</p>',
    complexityNotes: { time: 'O(N) shift cost', space: 'O(1) aux', summary: 'Shifting elements requires copying each slot.' },
    startArray: [10, 20, 30],
    missionText: 'Insert value 15 at index 0 and count the shift operations.',
    leetcodeLinks: [{ label: 'LeetCode #35: Search Insert Position', url: 'https://leetcode.com/problems/search-insert-position/', number: 35 }]
  },

  // LEVEL 2: SORTING & COMPLEXITY
  {
    levelId: levels[1]._id, title: 'Bubble Sort RAM Swaps', order: 1,
    learnContent: '<h2>Bubble Sort</h2><p>Compares adjacent elements and swaps them if out of order. Takes O(N²) quadratic time in memory.</p>',
    complexityNotes: { time: 'O(N²)', space: 'O(1)', summary: 'Repeatedly swaps adjacent elements.' },
    startArray: [5, 3, 1, 4, 2],
    missionText: 'Sort array elements using adjacent swaps.',
    leetcodeLinks: [{ label: 'LeetCode #912: Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/', number: 912 }]
  },

  // LEVEL 3: TWO POINTERS
  {
    levelId: levels[2]._id, title: 'Two Pointers Pattern', order: 1,
    learnContent: '<h2>Two Pointers</h2><p>Maintains two index pointers (Left & Right) moving inwards, reducing O(N²) time down to O(N)!</p>',
    complexityNotes: { time: 'O(N)', space: 'O(1)', summary: 'Two pointers moving inwards.' },
    startArray: [1, 2, 3, 4, 6],
    missionText: 'Find target sum using Left and Right pointers.',
    leetcodeLinks: [{ label: 'LeetCode #167: Two Sum II', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', number: 167 }]
  },

  // LEVEL 4: LINKED LISTS MASTERY
  {
    levelId: levels[3]._id, title: 'Singly Linked List Nodes & Next Pointers', order: 1,
    learnContent: '<h2>Singly Linked List</h2><p>Linked list nodes are scattered across RAM, connected via <code>next</code> pointer fields containing target addresses.</p>',
    complexityNotes: { time: 'O(N) traversal', space: 'O(N)', summary: 'Pointers dynamically link heap nodes.' },
    startArray: [1, 2, 3, 4],
    missionText: 'Follow next pointers from Head to NULL.',
    leetcodeLinks: [{ label: 'LeetCode #206: Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', number: 206 }]
  },
  {
    levelId: levels[3]._id, title: 'Cycle Detection (Floyd\'s Algorithm)', order: 2,
    learnContent: '<h2>Floyd\'s Tortoise & Hare</h2><p>Advance Slow (1x step) and Fast (2x steps) pointers. A collision confirms a loop in O(N) time and O(1) space!</p>',
    complexityNotes: { time: 'O(N)', space: 'O(1)', summary: 'Two pointers at different speeds detect cycles.' },
    startArray: [3, 2, 0, -4],
    missionText: 'Run Slow and Fast pointers until collision at cycle node.',
    leetcodeLinks: [{ label: 'LeetCode #141: Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/', number: 141 }]
  },

  // LEVEL 5: STACKS & QUEUES
  {
    levelId: levels[4]._id, title: 'Stack LIFO & Call Stack Frames', order: 1,
    learnContent: '<h2>Stack LIFO Mechanics</h2><p>Last-In, First-Out (LIFO). Push & Pop operate at Top pointer in O(1) time.</p>',
    complexityNotes: { time: 'O(1) Push/Pop', space: 'O(N)', summary: 'LIFO memory order.' },
    startArray: [10, 20, 30],
    missionText: 'Push and Pop elements at the Top of the stack.',
    leetcodeLinks: [{ label: 'LeetCode #20: Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', number: 20 }]
  },

  // LEVEL 6: HASH MAPS
  {
    levelId: levels[5]._id, title: 'Hash Table Direct Indexing', order: 1,
    learnContent: '<h2>Hash Maps</h2><p>Hashes keys to RAM bucket addresses, achieving O(1) expected time lookups!</p>',
    complexityNotes: { time: 'O(1) average', space: 'O(N)', summary: 'Hash function maps keys directly to memory.' },
    startArray: [2, 7, 11, 15],
    missionText: 'Lookup complement in O(1) time using Hash Map.',
    leetcodeLinks: [{ label: 'LeetCode #1: Two Sum', url: 'https://leetcode.com/problems/two-sum/', number: 1 }]
  },

  // LEVEL 7: TREES & BST
  {
    levelId: levels[6]._id, title: 'Binary Tree Nodes (Left & Right Children)', order: 1,
    learnContent: '<h2>Binary Trees</h2><p>Each node holds a value and two child pointers: <code>left</code> and <code>right</code>.</p>',
    complexityNotes: { time: 'O(log N) search', space: 'O(N)', summary: 'Hierarchical node structure.' },
    startArray: [4, 2, 7, 1, 3],
    missionText: 'Traverse left and right child pointers.',
    leetcodeLinks: [{ label: 'LeetCode #226: Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', number: 226 }]
  },

  // LEVEL 8: GRAPHS & HEAPS
  {
    levelId: levels[7]._id, title: 'Min-Heap Array Storage (2i + 1)', order: 1,
    learnContent: '<h2>Min-Heap Array Representation</h2><p>Binary Heaps store tree nodes inside contiguous arrays: <code>left_child = 2i + 1</code>, <code>right_child = 2i + 2</code>.</p>',
    complexityNotes: { time: 'O(log N) push/pop', space: 'O(N)', summary: 'Tree stored inside array indices.' },
    startArray: [1, 3, 6, 5, 9, 8],
    missionText: 'Calculate child indices using 2i+1 formula.',
    leetcodeLinks: [{ label: 'LeetCode #703: Kth Largest Element in a Stream', url: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', number: 703 }]
  }
];

const topics = await Topic.create(topicsData);
console.log(`📝 Created ${topics.length} topics across all curriculum levels`);

// ── EXAM TASKS ──────────────────────────────────────────────────────────
await ExamTask.create([
  {
    levelId: levels[0]._id, order: 1,
    title: 'The Sneaky Insert',
    description: 'Transform start array into goal array in minimum operations.',
    startArray: [1, 2, 4], goalArray: [1, 2, 3, 4], maxSteps: 3, points: 100,
    hint: 'Think about where 3 needs to go.',
  },
  {
    levelId: levels[3]._id, order: 1,
    title: 'Pointer Reversal Challenge',
    description: 'Reverse linked list next pointers to point backwards.',
    startArray: [10, 20, 30], goalArray: [30, 20, 10], maxSteps: 4, points: 150,
    hint: 'Use prev, curr, and nextTemp pointers.',
  }
]);

// ── PROGRESS RECORDS ────────────────────────────────────────────────────
await Progress.create([
  { userId: admin._id, unlockedLevel: 1 },
  { userId: learner1._id, unlockedLevel: 4, practicedTopics: [topics[0]._id, topics[1]._id, topics[2]._id, topics[4]._id] },
  { userId: learner2._id, unlockedLevel: 1, practicedTopics: [topics[0]._id] },
]);

// ── SETTINGS ────────────────────────────────────────────────────────────
await Settings.create([{ key: 'tutorEnabled', value: true }]);

console.log('🎉 Comprehensive Syllabus Seed Complete!');
await mongoose.disconnect();
process.exit(0);
