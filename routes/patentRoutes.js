const express = require('express');
const router = express.Router();
const Professor = require('../models/professorModel');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

// GET: View all patents of the logged-in professor
router.get('/', async (req, res) => {
    try {
        const userName = req.session.userName;
        if (!userName) {
            req.session.error = 'Please log in first';
            return res.redirect('/login');
        }

        // Find the professor by userName
        const professor = await Professor.findOne({ userName });
        if (!professor) {
            req.session.error = 'Professor not found';
            return res.redirect('/login');
        }

        // Render patents.ejs with the professor's patents
        res.render('patents', { patents: professor.patents, professorName: professor.professorName });
    } catch (error) {
        console.error('Error fetching patents:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Add a new patent
router.post('/addPatent', upload.single('file'), async (req, res) => {
    try {
        const userName = req.session.userName;
        if (!userName) {
            req.session.error = 'Please log in first';
            return res.redirect('/login');
        }

        // Find the professor by userName
        const professor = await Professor.findOne({ userName });
        if (!professor) {
            req.session.error = 'Professor not found';
            return res.redirect('/login');
        }

        const { type, agency, name, year } = req.body;

        if (!req.file) {
            req.session.error = 'Please attach a file';
            return res.redirect('/patents');
        }

        console.log('Uploaded file details:', req.file);


        // Add new patent to the professor's patents array
        professor.patents.push({
            type,
            agency,
            name,
            year,
            file: {
                data: req.file.buffer, // Binary file data
                contentType: req.file.mimetype // File MIME type
            }
        });

        // Save the professor with the new patent
        await professor.save();
        console.log('Patent saved:', professor.patents);

        // Redirect back to the patents page
        res.status(201).json({success: true});
    } catch (error) {
        console.error('Error adding patent:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/download/:patentId', async (req, res) => {
    try {
        const professor = await Professor.findOne({ userName: req.session.userName });

        if (!professor) {
            return res.status(404).send('Professor not found');
        }

        const patent = professor.patents.id(req.params.patentId);
        if (!patent || !patent.file || !patent.file.data) {
            return res.status(404).send('File not found');
        }

        res.set('Content-Type', patent.file.contentType);
        res.set('Content-Disposition', `attachment; filename="${patent.name}.pdf"`);
        res.send(patent.file.data);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
