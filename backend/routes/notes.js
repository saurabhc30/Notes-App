const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

//Route 1 : Get all the Notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 2 : Add a New Notes
router.post('/addnote', [
    body('title', 'Enter a Valid title').isLength({ min: 3 }),
    body('description', 'description Must be atleast 5 characters').isLength({ min: 5 }),
], fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //if there are errors, return Bad Request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 3 : Update a Notes
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, tag, description } = req.body;
    try {

        //create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).send("Not Found");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 4 : Delete a Notes
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const { title, tag, description } = req.body;

    try {

        //Find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).send("Not Found");
        }

        //allow deletetion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

module.exports = router