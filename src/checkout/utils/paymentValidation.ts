export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  detectedType?: string;
}

/**
 * Validates country-specific payment account/phone numbers and strictly blocks
 * numbers/formats from other countries with clear, descriptive error messages.
 */
export function validatePaymentAccount(
  countryCode: string,
  methodIdOrName: string,
  rawInput: string
): ValidationResult {
  const input = (rawInput || '').trim();
  if (!input) {
    return {
      isValid: false,
      errorMessage: 'Please enter your account number or ID',
    };
  }

  const c = (countryCode || '').toLowerCase().trim();
  const m = (methodIdOrName || '').toLowerCase().trim();
  const digitsOnly = input.replace(/[^0-9]/g, '');

  // 1. BANGLADESH (bKash, Nagad, Rocket, Bank Transfer)
  if (c === 'bd' || c === 'bdt' || c === 'bangladesh') {
    if (m.includes('bank')) {
      if (digitsOnly.length < 6 || digitsOnly.length > 25) {
        return {
          isValid: false,
          errorMessage: 'Invalid Bangladeshi bank account number! Account number should be between 8 and 20 digits',
        };
      }
      return { isValid: true, detectedType: 'Bangladeshi Bank Account' };
    }

    if (
      input.startsWith('+91') ||
      (input.startsWith('91') && digitsOnly.length === 12) ||
      (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly))
    ) {
      return {
        isValid: false,
        errorMessage: 'This is an Indian phone number, not a Bangladeshi number! Please enter a valid 11-digit Bangladeshi mobile number (013/014/015/016/017/018/019).',
        detectedType: 'Indian Number',
      };
    }

    if (
      input.startsWith('+234') ||
      (input.startsWith('234') && digitsOnly.length >= 12) ||
      (digitsOnly.length === 11 && /^(070|080|081|090|091)/.test(digitsOnly))
    ) {
      return {
        isValid: false,
        errorMessage: 'This is a Nigerian phone number, not a Bangladeshi number! Please enter a valid 11-digit Bangladeshi mobile number (013/014/015/016/017/018/019).',
        detectedType: 'Nigerian Number',
      };
    }

    if (input.includes('@')) {
      return {
        isValid: false,
        errorMessage: 'This is an email address, not a mobile number! Please enter an 11-digit mobile number (e.g. 017XXXXXXXX).',
        detectedType: 'Email',
      };
    }

    // Must start with 013, 014, 015, 016, 017, 018, 019
    let cleanBd = digitsOnly;
    if (cleanBd.startsWith('8801') && cleanBd.length >= 13) {
      cleanBd = cleanBd.slice(2);
    }

    const isRocket = m.includes('rocket');
    const validLength = isRocket
      ? cleanBd.length === 11 || cleanBd.length === 12
      : cleanBd.length === 11;

    const validPrefix = /^(013|014|015|016|017|018|019)/.test(cleanBd);

    if (!validPrefix || !validLength) {
      return {
        isValid: false,
        errorMessage: `Invalid Bangladeshi mobile number! Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)${
          isRocket ? ' (Rocket account can be 11 or 12 digits)' : ''
        }`,
      };
    }

    return { isValid: true, detectedType: 'Bangladeshi Mobile' };
  }

  // 2. INDIA (UPI, Digital Rupee, Paytm, PhonePe, Bank Transfer)
  if (c === 'in' || c === 'inr' || c === 'india') {
    if ((digitsOnly.length === 11 && digitsOnly.startsWith('01')) || input.startsWith('+880')) {
      return {
        isValid: false,
        errorMessage: 'This is a Bangladeshi number, not an Indian number! Please enter a valid Indian account / mobile number.',
        detectedType: 'Bangladeshi Number',
      };
    }

    if (m === 'upi' || m.includes('upi')) {
      const isUpiId = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(input);
      let inDigits = digitsOnly;
      if (inDigits.startsWith('91') && inDigits.length === 12) {
        inDigits = inDigits.slice(2);
      }
      const isIndianPhone = inDigits.length === 10 && /^[6-9]/.test(inDigits);
      if (!isUpiId && !isIndianPhone) {
        return {
          isValid: false,
          errorMessage: 'Invalid Indian UPI ID or mobile number! (e.g. username@upi or 98XXXXXXXX)',
        };
      }
      return { isValid: true, detectedType: isUpiId ? 'UPI ID' : 'Indian Mobile' };
    }

    if (m.includes('paytm') || m.includes('phonepe')) {
      let inDigits = digitsOnly;
      if (inDigits.startsWith('91') && inDigits.length === 12) {
        inDigits = inDigits.slice(2);
      }
      const isIndianPhone = inDigits.length === 10 && /^[6-9]/.test(inDigits);
      if (!isIndianPhone) {
        return {
          isValid: false,
          errorMessage: 'Invalid Indian mobile number! Must be 10 digits starting with 6-9 (e.g. 98XXXXXXXX)',
        };
      }
      return { isValid: true, detectedType: 'Indian Mobile' };
    }

    if (m.includes('bank')) {
      if (digitsOnly.length < 9 || digitsOnly.length > 18) {
        return {
          isValid: false,
          errorMessage: 'Invalid Indian bank account number! Bank account must be 9 to 18 digits',
        };
      }
      return { isValid: true, detectedType: 'Indian Bank Account' };
    }

    return { isValid: true };
  }

  // 3. NIGERIA (Bank transfer, PalmPay, OPay, Kuda Bank, Union Bank)
  if (c === 'ng' || c === 'ngn' || c === 'nigeria') {
    if (
      m.includes('palmpay') ||
      m.includes('opay') ||
      m.includes('kuda') ||
      m.includes('union') ||
      m.includes('bank')
    ) {
      const is10Digit = digitsOnly.length === 10;
      let ngDigits = digitsOnly;
      if (ngDigits.startsWith('234') && ngDigits.length >= 12) {
        ngDigits = '0' + ngDigits.slice(3);
      }
      const is11DigitPhone = ngDigits.length === 11 && /^(070|080|081|090|091)/.test(ngDigits);

      if (!is10Digit && !is11DigitPhone) {
        return {
          isValid: false,
          errorMessage: 'Invalid account or phone number! Please enter 10-digit NUBAN or 11-digit mobile number',
        };
      }
      return { isValid: true, detectedType: is10Digit ? 'NUBAN Account' : 'Nigerian Phone' };
    }
    return { isValid: true };
  }

  // 4. GLOBAL USD (Airtm, Bank Transfer)
  if (c === 'global' || c === 'us' || c === 'usd') {
    if (m.includes('airtm')) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      const isHandle = input.startsWith('@') && input.length >= 3;
      if (!isEmail && !isHandle) {
        return {
          isValid: false,
          errorMessage: 'Invalid Airtm account! Please enter your registered email or @username',
        };
      }
      return { isValid: true, detectedType: isEmail ? 'Airtm Email' : 'Airtm Handle' };
    }

    if (m.includes('bank')) {
      if (input.length < 6 || input.length > 36) {
        return {
          isValid: false,
          errorMessage: 'Invalid USD bank account or IBAN! Must be between 6 and 36 characters',
        };
      }
      return { isValid: true, detectedType: 'USD Bank Account / IBAN' };
    }
    return { isValid: true };
  }

  return { isValid: true };
}
