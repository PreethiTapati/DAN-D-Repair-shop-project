import express from 'express';
import noteControllers from '../controllers/note.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// Apply JWT verification middleware to all routes defined after this line
router.use(verifyJWT);


router.route('/')
    .get(noteControllers.getAllNotes)
    .post(noteControllers.createNewNote)
    .patch(noteControllers.updateNote)
    .delete(noteControllers.deleteNote)
export default router;
