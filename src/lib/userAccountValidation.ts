export type ValidationResult = { valid: boolean; error?: string };

export function validateUserName(name: string): ValidationResult {
    const trimmed = name.trim();

    if (!trimmed) {
        return { valid: false, error: 'Name is required' };
    }
    if (trimmed.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
        return { valid: false, error: 'Name must not exceed 50 characters' };
    }
    if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
        return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { valid: true };
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function validateUserEmail(email: string): ValidationResult {
    const normalized = normalizeEmail(email);

    if (!normalized) {
        return { valid: false, error: 'Email is required' };
    }
    if (normalized.length > 100) {
        return { valid: false, error: 'Email must not exceed 100 characters' };
    }
    if (normalized.includes(' ')) {
        return { valid: false, error: 'Email cannot contain spaces' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { valid: false, error: 'A valid email is required (e.g. user@company.com)' };
    }

    return { valid: true };
}

export function normalizePhoneDigits(input: string): string {
    return String(input).replace(/\D/g, '').slice(0, 10);
}

export function normalizePhoneDigitsLast10(input: string): string {
    return String(input).replace(/\D/g, '').slice(-10);
}

export function validatePhoneDigits(digits: string): ValidationResult {
    const cleaned = normalizePhoneDigits(digits);

    if (!cleaned) {
        return { valid: false, error: 'Phone number is required' };
    }
    if (cleaned.length !== 10) {
        return { valid: false, error: `Phone number must be exactly 10 digits (${cleaned.length}/10)` };
    }

    return { valid: true };
}

export function formatPhoneDigitsForInput(input: string): string {
    const digits = normalizePhoneDigits(input);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function buildPHPhoneNumberFromDigits(digits: string): string {
    const cleaned = normalizePhoneDigits(digits);
    return cleaned ? `+63${cleaned}` : '';
}

export function normalizePHPhoneNumber(input: string): string {
    const last10 = normalizePhoneDigitsLast10(input);
    if (!last10 || last10.length !== 10) {
        return '';
    }
    return `+63${last10}`;
}

export function validatePHPhoneNumber(phoneNumber: string): ValidationResult {
    const normalized = normalizePHPhoneNumber(phoneNumber);

    if (!normalized) {
        const rawDigits = normalizePhoneDigitsLast10(phoneNumber);
        if (!rawDigits) {
            return { valid: false, error: 'Phone number is required' };
        }
        return { valid: false, error: 'Phone number must be a valid PH number (10 digits after +63)' };
    }

    if (!/^\+63\d{10}$/.test(normalized)) {
        return { valid: false, error: 'Phone number must be a valid PH number (10 digits after +63)' };
    }

    return { valid: true };
}
