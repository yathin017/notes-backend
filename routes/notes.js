const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/Users');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/notes - Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      author: req.user._id
    });

    await note.save();
    res.status(201).send(note);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET /api/notes/search - Search notes for the authenticated user
router.get('/search', auth, async (req, res) => {
  try {
    // Extract the search query parameter
    const searchQuery = req.query.q;
    const userId = req.user._id;

    // Find notes that match the search query
    // or are shared with the authenticated user
    const notes = await Note.find({
      $text: { $search: searchQuery },
      $or: [{ author: userId }, { sharedWith: userId }]
    });
    
    res.send(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// GET /api/notes - Get all notes for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({
      $or: [{ author: userId }, { sharedWith: userId }]
    });

    res.send(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});
  
// GET /api/notes/:id - Get a single note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const note = await Note.findOne({
      _id: noteId,
      $or: [{ author: userId }, { sharedWith: userId }]
    });

    if (!note) {
      return res.status(404).send({ error: 'Note not found or access denied' });
    }

    res.send(note);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});


// PUT /api/notes/:id - Update a note by ID
router.put('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'content'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ author: req.user._id }, { sharedWith: req.user._id }]
    });

    if (!note) {
      return res.status(404).send({ error: 'Note not found or access denied' });
    }

    updates.forEach((update) => note[update] = req.body[update]);
    await note.save();

    res.send(note);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE /api/notes/:id - Delete a note by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });

    if (!note) {
      return res.status(404).send({ error: 'Note not found' });
    }

    // Only the owner can delete the note
    if (note.author.equals(req.user._id)) {
      await note.remove();
      return res.send(note);
    } 

    // If a shared user tries to delete, remove them from the sharedWith array
    const sharedIndex = note.sharedWith.indexOf(req.user._id);
    if (sharedIndex > -1) {
      note.sharedWith.splice(sharedIndex, 1);
      await note.save();
      return res.send({ message: 'Removed from shared notes' });
    }

    // If the user is neither the owner nor a shared user
    res.status(403).send({ error: 'Access denied' });
  } catch (error) {
    res.status(500).send();
  }
});

// POST /api/notes/:id/share - Share a note with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, author: req.user._id });

    if (!note) {
      return res.status(404).send({ error: 'Note not found or access denied' });
    }
    
    const userIdToShareWith = req.body.userId;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userIdToShareWith)) {
      return res.status(400).send({ error: 'Invalid user ID format' });
    }

    // Check user existance
    const userToShareWith = await User.findById(userIdToShareWith);
    if (!userToShareWith) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Add the user to the sharedWith array if not already present
    if (!note.sharedWith.includes(userIdToShareWith)) {
      note.sharedWith.push(userIdToShareWith);
      await note.save();
    }

    res.status(200).send({ message: 'Note shared successfully' });
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;