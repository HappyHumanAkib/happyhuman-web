const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const multer = require('multer');

// Image Upload Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage: storage });

// 1. READ: Home Feed
router.get('/', async (req, res) => {
    try {
        const query = req.query.q || "";
        const posts = await Content.find({ 
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ] 
        }).sort({ created: -1 });
        res.render('index', { posts });
    } catch (err) {
        res.status(500).send("Error loading feed");
    }
});

// 2. CREATE
router.get('/add', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('add_content');
});

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const newPost = new Content({
            title: req.body.title,
            category: req.body.category,
            body: req.body.body,
            image: req.file ? req.file.filename : '',
            author: req.session.user.name,
            authorEmail: req.session.user.email,
            authorId: req.session.user._id
        });
        await newPost.save();
        res.redirect('/');
    } catch (err) { res.redirect('/add'); }
});

// 3. UPDATE (Edit Page)
router.get('/edit/:id', async (req, res) => {
    try {
        const post = await Content.findById(req.params.id);
        if (!req.session.user || (post.authorEmail !== req.session.user.email && req.session.user.role !== 'admin')) {
            return res.redirect('/');
        }
        res.render('edit_content', { title: 'Edit Post', post });
    } catch (err) { res.redirect('/'); }
});

// POST Update Logic
router.post('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const post = await Content.findById(req.params.id);
        // Security check
        if (!req.session.user || (post.authorEmail !== req.session.user.email && req.session.user.role !== 'admin')) {
            return res.redirect('/');
        }

        let updateData = {
            title: req.body.title,
            category: req.body.category,
            body: req.body.body
        };
        if (req.file) updateData.image = req.file.filename;

        await Content.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/');
    } catch (err) { res.redirect(`/edit/${req.params.id}`); }
});

// GET Edit Page
router.get('/edit/:id', async (req, res) => {
    try {
        const post = await Content.findById(req.params.id);
        // Authorization check
        if (!req.session.user || (post.authorEmail !== req.session.user.email && req.session.user.role !== 'admin')) {
            return res.redirect('/');
        }
        res.render('edit_content', { title: 'Edit Post', post });
    } catch (err) {
        res.redirect('/');
    }
});

// POST Update Logic
router.post('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const post = await Content.findById(req.params.id);
        if (!req.session.user || (post.authorEmail !== req.session.user.email && req.session.user.role !== 'admin')) {
            return res.redirect('/');
        }

        let updateData = {
            title: req.body.title,
            category: req.body.category,
            body: req.body.body
        };
        if (req.file) updateData.image = req.file.filename;

        await Content.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/');
    } catch (err) {
        res.redirect(`/edit/${req.params.id}`);
    }
});

// 4. DELETE
router.get('/delete/:id', async (req, res) => {
    try {
        const post = await Content.findById(req.params.id);
        if (req.session.user && (post.authorEmail === req.session.user.email || req.session.user.role === 'admin')) {
            await Content.findByIdAndDelete(req.params.id);
        }
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
});

module.exports = router;