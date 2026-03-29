import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail} from '../models/userModel.js';
import { validateRegistrationInput, validateLoginInput } from '../utils/validators.js';

function generateToken(user) {

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '1d';

    return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    },
    jwtSecret,
    { expiresIn: jwtExpiry });
}

export async function register(req, res) {
    try{
        const { name, email, password } = req.body;
        const validationError = validateRegistrationInput({ name, email, password });

        if(!validationError.valid){
            return res.status(400).json({ success: false, message: validationError.message });
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await getUserByEmail(normalizedEmail);

        if(existingUser){
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await createUser({
            name:name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'buyer'
        })

        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                },
                token
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function login(req, res) {
    try{
        const { email, password } = req.body;
        const validationError = validateLoginInput({ email, password });

        if(!validationError.valid){
            return res.status(400).json({ success: false, message: validationError.message });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await getUserByEmail(normalizedEmail);

        if(!user){
            return res.status(401).json({ success: false, message: 'Invalid email and password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}