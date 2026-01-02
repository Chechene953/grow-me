// TOTP (Time-based One-Time Password) Service
// For Google Authenticator, Authy, and other authenticator apps

// Note: For production, you should use a library like 'otplib' for TOTP
// npm install otplib
// and store secrets securely on your backend

interface TOTPSecret {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

interface TOTPVerifyResult {
  valid: boolean;
  error?: string;
}

// Configuration
const TOTP_CONFIG = {
  appName: 'GrowMe',
  issuer: 'GrowMe Plant Shop',
  algorithm: 'SHA1',
  digits: 6,
  period: 30, // seconds
};

// Generate a random base32 secret (for demo purposes)
// In production, use a proper TOTP library
const generateRandomSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

// Format secret for display (groups of 4)
const formatSecretForDisplay = (secret: string): string => {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
};

// Generate the otpauth:// URL for QR code
const generateOTPAuthURL = (email: string, secret: string): string => {
  const encodedIssuer = encodeURIComponent(TOTP_CONFIG.issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_CONFIG.algorithm}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`;
};

// Generate QR code URL using a QR code API (for demo)
// In production, generate QR codes locally or use your backend
const generateQRCodeUrl = (otpauthUrl: string): string => {
  // Using a public QR code API for demo
  // In production, use a library like 'react-native-qrcode-svg'
  const encodedUrl = encodeURIComponent(otpauthUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
};

// Simple TOTP validation for demo
// In production, use 'otplib' or similar library
const generateTOTP = (secret: string, timestamp?: number): string => {
  // This is a simplified version for demo purposes
  // In production, use proper TOTP implementation with HMAC-SHA1

  const time = Math.floor((timestamp || Date.now()) / 1000 / TOTP_CONFIG.period);

  // For demo, we'll use a simple hash simulation
  // This is NOT cryptographically secure - use otplib in production!
  let hash = 0;
  const str = secret + time.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate 6-digit code
  const code = Math.abs(hash) % 1000000;
  return code.toString().padStart(TOTP_CONFIG.digits, '0');
};

// Store for user secrets (in production, this should be on your backend)
const userSecrets: Map<string, string> = new Map();

export const totpService = {
  // Generate a new TOTP secret for a user
  async generateSecret(userId: string, email: string): Promise<TOTPSecret> {
    const secret = generateRandomSecret();
    const otpauthUrl = generateOTPAuthURL(email, secret);
    const qrCodeUrl = generateQRCodeUrl(otpauthUrl);

    // Store the secret (in production, store this securely on your backend)
    userSecrets.set(userId, secret);

    return {
      secret,
      qrCodeUrl,
      manualEntryKey: formatSecretForDisplay(secret),
    };
  },

  // Verify a TOTP code
  async verifyCode(userId: string, code: string): Promise<TOTPVerifyResult> {
    const secret = userSecrets.get(userId);

    if (!secret) {
      return { valid: false, error: '2FA not set up for this user' };
    }

    // Clean the code
    const cleanCode = code.replace(/\s/g, '');

    if (!/^\d{6}$/.test(cleanCode)) {
      return { valid: false, error: 'Code must be 6 digits' };
    }

    // In production, use otplib to verify with time drift tolerance
    // const isValid = authenticator.verify({ token: cleanCode, secret });

    // For demo, generate current code and check
    const currentCode = generateTOTP(secret);

    // Also check previous and next period for time drift
    const prevCode = generateTOTP(secret, Date.now() - TOTP_CONFIG.period * 1000);
    const nextCode = generateTOTP(secret, Date.now() + TOTP_CONFIG.period * 1000);

    const isValid = cleanCode === currentCode || cleanCode === prevCode || cleanCode === nextCode;

    return { valid: isValid, error: isValid ? undefined : 'Invalid verification code' };
  },

  // Enable 2FA for a user after successful verification
  async enable2FA(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const verifyResult = await this.verifyCode(userId, code);

    if (!verifyResult.valid) {
      return { success: false, error: verifyResult.error };
    }

    // In production, mark the user's 2FA as enabled in the database
    // and store the secret securely

    return { success: true };
  },

  // Disable 2FA for a user
  async disable2FA(userId: string): Promise<{ success: boolean }> {
    userSecrets.delete(userId);
    return { success: true };
  },

  // Check if 2FA is enabled for a user
  is2FAEnabled(userId: string): boolean {
    return userSecrets.has(userId);
  },

  // Get recovery codes (for backup)
  generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      let code = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXX-XXXX
      codes.push(code.slice(0, 4) + '-' + code.slice(4));
    }
    return codes;
  },

  // Get the app configuration for display
  getConfig() {
    return {
      appName: TOTP_CONFIG.appName,
      period: TOTP_CONFIG.period,
      digits: TOTP_CONFIG.digits,
    };
  },
};

export type { TOTPSecret, TOTPVerifyResult };
