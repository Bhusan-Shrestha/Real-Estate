export function isvalidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPassword(password) {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

export function validateRegistrationInput({ name, email, password }) {
    if(!name || !email || !password) {
        return { valid: false, message: 'All fields are required' };
    }

    if (!isvalidEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    if (!isValidPassword(password)) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        };
    }

    return { valid: true };

}

export function validateLoginInput({ email, password }) {
    if(!email || !password) {
        return { valid: false, message: 'Email and password are required' };
    }

    if (!isvalidEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    return { valid: true };
}

export function validateFavouritePayload({ propertyId }) {
    if (!propertyId) {
        return { valid: false, message: 'Property ID is required' };
    }
    return { valid: true };
}