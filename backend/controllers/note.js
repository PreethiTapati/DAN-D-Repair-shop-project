
import Note from '../models/note.js';
import User from '../models/user.js';

const noteControllers = {
    // @desc Get all notes
    // @route GET /notes
    // @access Private
getAllNotes: async (req, res) => {
  try {
    const notes = await Note.find().lean();

    if (!notes || notes.length === 0) {
      return res.status(400).json({ Success: false, message: 'No notes found' });
    }

    const notesWithUser = await Promise.all(
      notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec();
        return { ...note, username: user.username };
      })
    );

    return res.status(200).json({ Success: true, notes: notesWithUser });
  } catch (error) {
    return res.status(500).json({ Success: false, message: error.message });
  }
},

    // @desc Create new note
    // @route POST /notes
    // @access Private
    createNewNote: async (req, res) => {
        const { user, title, text } = req.body;
        console.log(req.body, 'req body');
        // Confirm data
        if (!user || !title || !text) {
            return res.status(400).json({ Success: true, message: 'All fields are required' });
        }

        // Check for duplicate title
        const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate note title' });
        }

        // Create and store the new note
        const noteObject = { user, title, text };

        const note = await Note.create(noteObject);

        if (note) {
    // Created
    return res.status(200).json({ Success: true, message: `New note ${note.title} has been created`  });
  } else {
    return res.status(500).json({ Success: false, message: 'Failed to create a new note' });
  }
},
    // @desc Update a note
    // @route PATCH /notes
    // @access Private
    updateNote: async (req, res) => {
        try {
            const { id, user, title, text, completed } = req.body;
            if (!id || !user || !title || !text || typeof completed !== 'boolean') return res.status(400).json({ Success: false, message: 'All fields are required' })
            const note = await Note.findById(id).exec()
            if (!note) {
                return res.status(400).json({ Success: false, message: 'Note not found' })
            }
            const duplicate = await Note.findOne({ title }).lean().exec()
            if (duplicate && duplicate?._id.toString() !== id) {
                return res.status(409).json({ message: 'Duplicate note title' })
            }
            note.user = user
            note.title = title
            note.text = text
            note.completed = completed
            const updatedNote = await note.save()
            return res.status(200).json({ Success: true, message: `‘${updatedNote.title}’ updated` })
        } catch (error) {
            return res.status(500).json({ Success: false, message: error.message })
        }
    },
    // @desc Delete a note
    // @route DELETE /notes
    // @access Private
    deleteNote: async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ Success: false, message: 'Note ID required' })
            }
            const note = await Note.findById(id).exec()
            if (!note) {
                return res.status(400).json({ Success: false, message: 'Note not found' })
            }
            const result = await note.deleteOne()
            if (result.deletedCount > 0) {
                return res.status(200).json({ Success: true, message: `Note with ${id} deleted!` })
            } else {
                return res.status(400).json({ Success: false, message: `Note with ${id} doesn’t exist` })
            }
        } catch (error) {
            return res.status(500).json({ Success: false, message: error.message })
        }
    }
}
export default noteControllers;