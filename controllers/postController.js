


import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { userId, caption, images } = req.body;

    console.log(userId, images, caption)
    if (!userId || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'User ID and image URLs are required.' });
    }

    const newPost = new Post({
      user: userId,
      caption,
      images,
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully.', post: newPost });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error creating post.' });
  }
};



export const deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting post' });
    }
};

export const updatePost = async (req, res) => {
  try {
    const { caption, images } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { caption, images },
      { new: true }
    );

    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    res.status(200).json({ message: 'Post updated', post: updatedPost });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Error updating post' });
  }
};


export const likeOrUnlikeComment = async (req, res) => {
    try {
        const { postId, commentId, userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const alreadyLiked = comment.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike
            comment.likes = comment.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
            likes: comment.likes,
        });

    } catch (err) {
        console.error('Like/unlike comment error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};



export const getPaginatedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user') 
      .populate('likes', 'username _id') 
      .lean();

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const allComments = await Comment.find({ post: post._id })
          .populate('user') 
          .lean();

        const commentMap = {};
        allComments.forEach(comment => {
          comment.replies = [];
          commentMap[comment._id.toString()] = comment;
        });

        const commentTree = [];
        allComments.forEach(comment => {
          if (comment.parentComment) {
            const parent = commentMap[comment.parentComment.toString()];
            if (parent) {
              parent.replies.push(comment);
            }
          } else {
            commentTree.push(comment);
          }
        });

        return {
          ...post,
          user: post.user,
          likes: post.likes,
          comments: commentTree,
          likesCount: post.likes?.length || 0
        };
      })
    );

    res.json(postsWithDetails);
  } catch (err) {
    console.error('Error fetching paginated posts:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};






export const addComment = async (req, res) => {
  try {
    const { postId, userId, text, parentComment } = req.body;

    if (!postId || !userId || !text) {
      return res.status(400).json({ message: 'Post ID, user ID, and comment text are required.' });
    }

    const comment = new Comment({
      post: postId,
      user: userId,
      text,
      parentComment: parentComment || null
    });

    await comment.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    res.status(201).json({ message: 'Comment added.', comment });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Server error adding comment.' });
  }
};



export const toggleLikePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    console.log(req.body)
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId); 
    } else {
      post.likes.push(userId); 
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked.' : 'Post liked.',
      likes: post.likes
    });
  } catch (err) {
    console.error('Like toggle error:', err);
    res.status(500).json({ message: 'Server error toggling like.' });
  }
};


export const getLikersOfPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const totalLikers = post.likes.length;
    const totalPages = Math.ceil(totalLikers / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIds = post.likes.slice(startIndex, endIndex);

    const usersMap = await User.find({ _id: { $in: paginatedIds } })
      .select('username profilePicture bio')
      .then(users =>
        users.reduce((map, user) => {
          map[user._id.toString()] = user;
          return map;
        }, {})
      );

    const orderedUsers = paginatedIds
      .map(id => usersMap[id.toString()])
      .filter(Boolean); 

   
    res.status(200).json({
      currentPage: page,
      totalUsers: totalLikers,
      totalPages,
      users: orderedUsers,
    });

  } catch (err) {
    console.error('Get likers error:', err);
    res.status(500).json({ message: 'Failed to get likers.' });
  }
};