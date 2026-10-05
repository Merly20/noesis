import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, minlength: 3, maxlength: 20,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
  },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['learner', 'admin'], default: 'learner' },
  points: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

// Never return passwordHash in JSON responses
userSchema.set('toJSON', {
  transform(_, obj) {
    delete obj.passwordHash;
    return obj;
  },
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
