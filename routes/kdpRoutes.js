const express = require('express');
const router = express.Router();
const Professor = require('../models/professorModel');
const multer = require('multer');

// Configure Multer for file uploads (store in memory as Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET: View all KDP workshops of the logged-in professor
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

        // Render kdp.ejs with the professor's KDP workshops
        res.render('kdp', { kdpWorkshops: professor.kdpWorkshops, professorName: professor.professorName });
    } catch (error) {
        console.error('Error fetching KDP workshops:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Add a new KDP workshop
router.post('/addKdp', upload.single('report'), async (req, res) => {
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

        const { eventType, startDate, endDate, forWhom, conductedOrAttended } = req.body;

        if (!req.file) {
            req.session.error = 'Please attach a report';
            return res.redirect('/kdp');
        }

        console.log('Uploaded report details:', req.file);

        // Add new KDP workshop to the professor's array
        professor.kdpWorkshops.push({
            eventType,
            startDate,
            endDate,
            forWhom,
            conductedOrAttended,
            report: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        // Save the professor with the new KDP workshop
        await professor.save();
        console.log('KDP Workshop saved:', professor.kdpWorkshops);

        // Redirect back to the KDP page
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error adding KDP workshop:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET: Download report for a KDP workshop
router.get('/download/:kdpId', async (req, res) => {
    try {
        const professor = await Professor.findOne({ userName: req.session.userName });

        if (!professor) {
            return res.status(404).send('Professor not found');
        }

        const kdp = professor.kdpWorkshops.id(req.params.kdpId);
        if (!kdp || !kdp.report || !kdp.report.data) {
            return res.status(404).send('Report not found');
        }

        res.set('Content-Type', kdp.report.contentType);
        res.set('Content-Disposition', `attachment; filename="report.pdf"`);
        res.send(kdp.report.data);
    } catch (error) {
        console.error('Error retrieving report:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
