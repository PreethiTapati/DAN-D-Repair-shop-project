import express from 'express';

const router = express.Router();

import userControllers from '../controllers/user.js';
//import verifyJWT from '../middleware/verifyJWT.js';

//router.use(verifyJWT);

router.route('/')
    .get(userControllers.getAllUsers)
    .post(userControllers.createNewUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser)

export default router;