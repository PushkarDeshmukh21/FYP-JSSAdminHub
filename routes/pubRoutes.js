const express = require('express');
const router = express.Router();
const Professor = require('../models/professorModel');

// GET: View all publications of the logged-in professor
router.get('/', async (req, res) => {
    try {
        const userName = req.session.userName;
        if (!userName) {
            req.session.error = 'Please log in first';
            return res.redirect('/login');
        }

        const professor = await Professor.findOne({ userName });
        if (!professor) {
            req.session.error = 'Professor not found';
            return res.redirect('/login');
        }

        res.render('publications', { publications: professor.publications, professorName: professor.professorName });
    } catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST: Add a new publication (no file upload)
// POST: Add a new publication (no file upload)
router.post('/addPublication', async (req, res) => {
    try {
        const userName = req.session.userName;
        if (!userName) {
            return res.status(401).json({ error: 'Please log in first' });
        }

        const professor = await Professor.findOne({ userName });
        if (!professor) {
            return res.status(404).json({ error: 'Professor not found' });
        }

        // Convert year to a number explicitly
        const publicationData = {
            conference: req.body.conference,
            facultyName: req.body.facultyName,
            conferenceOrJournalName: req.body.conferenceOrJournalName,
            isbn: req.body.isbn,
            issue: req.body.issue,
            volume: req.body.volume,
            year: parseInt(req.body.year, 10)  // Ensure year is stored as a number
        };

        // Validate the parsed year
        if (isNaN(publicationData.year) || publicationData.year < 1900 || publicationData.year > new Date().getFullYear()) {
            return res.status(400).json({ error: 'Invalid year provided' });
        }

        professor.publications.push(publicationData);
        await professor.save();

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error adding publication:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
