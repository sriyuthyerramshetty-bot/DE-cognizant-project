import employees from './data/employee_data.json';

// Basic email pattern check
function checkEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Password must be at least 8 characters long
function checkPassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

// Look up an employee by email (case-insensitive, trimmed).
// Returns the matching record (with its key as `id`) or null if none match.
function findEmployeeByEmail(email) {
    if (!email) return null;

    const normalizedEmail = email.trim().toLowerCase();

    for (const [id, employee] of Object.entries(employees)) {
        if (employee.email.toLowerCase() === normalizedEmail) {
            return { id, ...employee };
        }
    }

    return null;
}

// Main login check: does the email/password pair match an employee?
// Returns a result object. On success the user is returned WITHOUT the password.
function checkLogin(email, password) {
    // Reject malformed emails before touching the data
    if (!checkEmail(email)) {
        return { success: false, message: 'Invalid email format.' };
    }

    const employee = findEmployeeByEmail(email);

    // Use one generic message for both "no such email" and "wrong password"
    // so we don't reveal which emails exist in the system.
    if (!employee || employee.password !== password) {
        return { success: false, message: 'Invalid email or password.' };
    }

    // Never return the password to the caller
    console.log("Login successful for user:", employee.email);
    return {
        success: true,
        user: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
        },
    };
}

export { checkEmail, checkPassword, findEmployeeByEmail, checkLogin };