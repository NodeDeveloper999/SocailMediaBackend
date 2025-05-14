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



router.post('/create', createPost);

router.post('/like', toggleLikePost);

router.post('/comment', addComment);


router.get('/paginated', getPaginatedPosts);

router.get('/:postId/likers', getLikersOfPost);
router.delete('/deletepost/:id', deletePost);
router.put('/updatepost/:id', updatePost);
router.put('/like-comment', likeOrUnlikeComment);


export default router;