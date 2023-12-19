import User from '../models/user.js';
import Note from '../models/note.js';
import bcrypt from 'bcryptjs';

// Get all users
const userControllers = {
    getAllUsers : async (req, res, next) => {
        try {
            const users = await User.find().select('-password').lean();

            if (!users?.length) {
                return res.status(400).json({ message: 'No users found' });
            }

            res.json(users);
        } catch (error) {
            next(error);
        }
    },

    // Create new user
    createNewUser : async (req, res, next) => {
        try {
            const { username, password, roles } = req.body;

            if (!username || !password ) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

            if (duplicate) {
                return res.status(409).json({ message: 'Duplicate username' });
            }

            const hashedPwd = await bcrypt.hash(password, 10);
            const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

            // Create and store new user 
            const user = await User.create(userObject);

            if (user) {
                res.status(201).json({ message: `New user ${username} created` });
            } else {
                res.status(400).json({ message: 'Invalid user data received' });
            }
        } catch (error) {
            next(error);
        }
    },

    // Update a user
updateUser: async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { id, username, roles, active, password } = req.body;

        // Check if all required fields are present
        if (!id || !username || !Array.isArray(roles) || !roles.length || active === undefined || active === null) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if password is present
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check for duplicate username
        const duplicateUser = await User.findOne({ username, _id: { $ne: id }}).collation({ locale: 'en', strength: 2 }).lean().exec();
        if (duplicateUser) {
            return res.status(409).json({ message: 'Duplicate username' });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(id, {
            username,
            roles,
            active,
            ...(password && { password: await bcrypt.hash(password, 10) })
        }, { new: true }).exec();

        // Check if user was found and updated
        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.json({ message: `${updatedUser.username} updated` });
    } catch (error) {
        // Handle errors here
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
},


    // Delete a user
    deleteUser : async (req, res, next) => {
        try {
            const { id } = req.body;
         
          // Confirm data
            if (!id) {
                return res.status(400).json({ message: 'User ID Required' });
            }
               // Does the user still have assigned notes?
            const note = await Note.findOne({ user: id }).lean().exec();

            if (note) {
                return res.status(400).json({ message: 'User has assigned notes' });
            }
                // Does the user exist to delete?
            const user = await User.findById(id).exec();

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const result = await user.deleteOne();

            const reply = `Username ${result.username} with ID ${result._id} deleted`;

            res.json(reply);
        } catch (error) {
            next(error);
        }
    },
}
    export  default userControllers;
