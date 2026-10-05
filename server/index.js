const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/levels', require('./routes/levels'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/tutor', require('./routes/tutor'));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/noesis')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
