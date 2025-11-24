const express = require('express');
const multer = require('multer');
const { processImage } = require('../controllers/imageController');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post("/processed", upload.single('image'), processImage);

module.exports = router;
