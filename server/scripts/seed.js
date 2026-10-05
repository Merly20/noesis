const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Level = require('../models/Level');
const Topic = require('../models/Topic');
const ExamTask = require('../models/ExamTask');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/noesis')
  .then(() => console.log('Connected to DB for seeding'))
  .catch(err => console.error(err));

async function seed() {
  await User.deleteMany({});
  await Level.deleteMany({});
  await Topic.deleteMany({});
  await ExamTask.deleteMany({});

  const adminHash = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', email: 'admin@noesis.com', passwordHash: adminHash, role: 'admin' });

  const learnerHash = await bcrypt.hash('password', 10);
  await User.create({ username: 'learner1', email: 'learner1@test.com', passwordHash: learnerHash, role: 'learner' });

  const level1 = await Level.create({ number: 1, title: 'Array Operations', description: 'Master the basics of arrays.', isPublished: true, badge: 'array-master' });
  const level2 = await Level.create({ number: 2, title: 'Array Sorting', description: 'Learn how to sort arrays efficiently.', isPublished: true });
  await Level.create({ number: 3, title: 'Array Patterns', description: 'Two pointers, sliding window, etc.', isPublished: true });
  await Level.create({ number: 4, title: 'String Basics', description: 'String operations', isPublished: true });
  await Level.create({ number: 5, title: 'String Patterns', description: 'Advanced string algorithms', isPublished: true });

  await Topic.create({
    levelId: level1._id,
    order: 1,
    title: 'Creation & Access',
    learnContent: '# Arrays\nArrays store data in contiguous memory blocks. Accessing an element by index takes O(1) time.',
    complexityNotes: 'Time: O(1) Access, Space: O(1)',
    startArray: [10, 20, 30],
    missionText: 'Try accessing the element at index 1.',
    leetcodeLinks: [{ title: 'Build Array from Permutation', url: 'https://leetcode.com/problems/build-array-from-permutation/' }]
  });

  await Topic.create({
    levelId: level1._id,
    order: 2,
    title: 'Insertion',
    learnContent: '# Insertion\nInserting an element at index i requires shifting all elements from i to the end one position to the right. Time complexity is O(n).',
    complexityNotes: 'Time: O(n) Insertion, Space: O(1)',
    startArray: [5, 10, 15, 20],
    missionText: 'Insert 12 at index 2.',
    leetcodeLinks: [{ title: 'Duplicate Zeros', url: 'https://leetcode.com/problems/duplicate-zeros/' }]
  });

  await ExamTask.create({
    levelId: level1._id,
    startArray: [1, 2, 4],
    goalArray: [1, 2, 3, 4],
    maxSteps: 3,
    points: 10
  });

  await ExamTask.create({
    levelId: level1._id,
    startArray: [5, 6, 7, 8],
    goalArray: [5, 7, 8],
    maxSteps: 3,
    points: 10
  });

  await ExamTask.create({
    levelId: level1._id,
    startArray: [9, 9, 9],
    goalArray: [9, 1, 9],
    maxSteps: 1,
    points: 10
  });

  console.log('Seeding complete');
  process.exit();
}

seed();
