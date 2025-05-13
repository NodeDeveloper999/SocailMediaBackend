import express from 'express';

import { 
  addComment,
  createPost, 

  deletePost, 

  getLikersOfPost, 

  getPaginatedPosts, 

  likeOrUnlikeComment, 

  toggleLikePost,
  updatePost
} from '../controllers/postController.js';

const router = express.Router();

// router.route('/')
//   .post(protect, upload.array('images', 10), createPost)
//   .get(getPosts);

// router.route('/:id/like').put(protect, likePost);

router.post('/create', createPost);

// Like or unlike a post
router.post('/like', toggleLikePost);

// Add a comment to a post
router.post('/comment', addComment);


router.get('/paginated', getPaginatedPosts);

router.get('/:postId/likers', getLikersOfPost);
router.delete('/deletepost/:id', deletePost);
router.put('/updatepost/:id', updatePost);
router.put('/like-comment', likeOrUnlikeComment);


export default router;