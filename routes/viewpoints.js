const express = require('express');
const router = express.Router();
const viewpoints = require('../controllers/viewpoints');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateViewpoint } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(viewpoints.index))
    .post(isLoggedIn, upload.array('image'), validateViewpoint, catchAsync(viewpoints.createViewpoint))


router.get('/new', isLoggedIn, viewpoints.renderNewForm)

router.route('/:id')
    .get(catchAsync(viewpoints.showViewpoint))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateViewpoint, catchAsync(viewpoints.updateViewpoint))
    .delete(isLoggedIn, isAuthor, catchAsync(viewpoints.deleteViewpoint));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(viewpoints.renderEditForm))



module.exports = router;