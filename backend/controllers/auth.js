import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// @desc Login
// @route POST /auth
// @access Public
const authController = {
    login: async (req, res) => {
        try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const foundUser = await User.findOne({ username }).exec()

        if (!foundUser || !foundUser.active) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const match = await bcrypt.compare(password, foundUser.password)

        if (!match) return res.status(401).json({ message: 'Unauthorized' })

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": foundUser.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '180m' }
        )

        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        // Create secure cookie with refresh token 
        res.cookie('jwt', refreshToken, {
            httpOnly: true, //accessible only by web server 
            secure: true, //https
            sameSite: 'None', //cross-site cookie 
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        })

        // Send accessToken containing username and roles 
        res.json({ accessToken })
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
},
    // @desc Refresh
    // @route GET /auth/refresh
    // @access Public - because access token has expired
    refresh: async (req, res) => {
    const cookies = req.cookies;

    try {
    
     
        const refreshToken = cookies.jwt;

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    console.error('Refresh token verification error:', err);
                    return res.status(403).json({ message: 'Forbidden' });
                }

                const foundUser = await User.findOne({ username: decoded.username }).exec();

                if (!foundUser) {
                    console.error('User not found during token refresh');
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            username: foundUser.username,
                            roles: foundUser.roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '150m' }
                );

                res.json({ accessToken });
            }
        );
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
},

    // @desc Logout
    // @route POST /auth/logout
    // @access Public - just to clear cookie if exists
    logout: async (req, res) => {
        const cookies = req.cookies
        if (!cookies?.jwt) return res.sendStatus(204) //No content
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.json({ message: 'Cookie cleared' })
    }
}

export default authController;