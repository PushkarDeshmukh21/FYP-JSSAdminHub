const express = require('express');
const router = express.Router();
const Professor = require('../models/professorModel');
const multer = require('multer');

// Configure Multer for file uploads (store in memory as Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET: View all SDP workshops of the logged-in professor
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

        // Render sdp.ejs with the professor's SDP workshops
        res.render('sdp', { sdpWorkshops: professor.sdpWorkshops, professorName: professor.professorName });
    } catch (error) {
        console.error('Error fetching SDP workshops:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Add a new SDP workshop
router.post('/addSdp', upload.single('report'), async (req, res) => {
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
            return res.redirect('/sdp');
        }

        console.log('Uploaded report details:', req.file);

        // Add new SDP workshop to the professor's array
        professor.sdpWorkshops.push({
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

        // Save the professor with the new SDP workshop
        await professor.save();
        console.log('SDP Workshop saved:', professor.sdpWorkshops);

        // Redirect back to the SDP page
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error adding SDP workshop:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET: Download report for an SDP workshop
router.get('/download/:sdpId', async (req, res) => {
    try {
        const professor = await Professor.findOne({ userName: req.session.userName });

        if (!professor) {
            return res.status(404).send('Professor not found');
        }

        const sdp = professor.sdpWorkshops.id(req.params.sdpId);
        if (!sdp || !sdp.report || !sdp.report.data) {
            return res.status(404).send('Report not found');
        }

        res.set('Content-Type', sdp.report.contentType);
        res.set('Content-Disposition', `attachment; filename="report.pdf"`);
        res.send(sdp.report.data);
    } catch (error) {
        console.error('Error retrieving report:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
