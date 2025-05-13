// models/Comment.js
import mongoose from 'mongoose';
const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the comment
}, { timestamps: true });

// Virtual to get child comments
CommentSchema.virtual('repliesData', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Comment', CommentSchema);
