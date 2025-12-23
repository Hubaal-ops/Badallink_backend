import express from 'express';
import Post from '../models/Post.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();
//create a post
router.post('/', protectRoute, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const newPost = new Post({
            title,
            description,
            user: req.user._id
            
        });

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//get all posts
router.get('/', async (req, res) => {
    
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profileImage');

            const totalPosts = await Post.countDocuments();

        res.status(200).json({
            posts,
            currentPage: page,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit)
        });
    
    }catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get recommened posts by the logged in user
router.get('/user', protectRoute, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(posts);

    }catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// delete a post
router.delete('/:id', protectRoute,  async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        //check if the logged in user is the owner of the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });

    }catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;