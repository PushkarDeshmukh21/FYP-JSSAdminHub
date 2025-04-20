const express = require('express');
const router = express.Router();
const Professor = require('../models/professorModel');
const multer = require('multer');

// Configure Multer for file uploads (store in memory as Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET: View all FDP workshops of the logged-in professor
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

        // Render fdp.ejs with the professor's FDP workshops
        res.render('fdp', { fdpWorkshops: professor.fdpWorkshops, professorName: professor.professorName });
    } catch (error) {
        console.error('Error fetching FDP workshops:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Add a new FDP workshop
router.post('/addFdp', upload.single('certificate'), async (req, res) => {
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

        const { conductedBy, eventType, institution, startDate, endDate } = req.body;

        if (!req.file) {
            req.session.error = 'Please attach a certificate';
            return res.redirect('/fdp');
        }

        console.log('Uploaded certificate details:', req.file);

        // Add new FDP workshop to the professor's array
        professor.fdpWorkshops.push({
            conductedBy,
            eventType,
            institution,
            startDate,
            endDate,
            certificate: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        // Save the professor with the new FDP workshop
        await professor.save();
        console.log('FDP Workshop saved:', professor.fdpWorkshops);

        // Redirect back to the FDP page
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error adding FDP workshop:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET: Download certificate for an FDP workshop
router.get('/download/:fdpId', async (req, res) => {
    try {
        const professor = await Professor.findOne({ userName: req.session.userName });

        if (!professor) {
            return res.status(404).send('Professor not found');
        }

        const fdp = professor.fdpWorkshops.id(req.params.fdpId);
        if (!fdp || !fdp.certificate || !fdp.certificate.data) {
            return res.status(404).send('Certificate not found');
        }

        res.set('Content-Type', fdp.certificate.contentType);
        res.set('Content-Disposition', `attachment; filename="certificate.pdf"`);
        res.send(fdp.certificate.data);
    } catch (error) {
        console.error('Error retrieving certificate:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
