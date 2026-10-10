// Storage service for saving payment accounts and persisting active checkout state
// Automatically remembers the user's account numbers per payment method (bKash, Nagad, etc.)
// and ensures checkout state (including QR Code screen) is never lost when navigating to Payout History.

const ACCOUNTS_STORAGE_PREFIX = 'coinbridge_saved_payment_accounts';
const CHECKOUT_SESSION_PREFIX = 'coinbridge_active_checkout_session';

export function getActiveUserEmail(): string {
  try {
    const raw = localStorage.getItem('coinbridge_saved_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed.email.toLowerCase().trim();
    }
    const direct = localStorage.getItem('coinbridge_active_user_email');
    if (direct) return direct.toLowerCase().trim();
  } catch {}
  return '';
}

function getAccountsKey(userEmail?: string): string {
  const email = (userEmail || getActiveUserEmail()).toLowerCase().trim();
  return email ? `${ACCOUNTS_STORAGE_PREFIX}_${email}` : ACCOUNTS_STORAGE_PREFIX;
}

function getSessionKey(userEmail?: string): string {
  const email = (userEmail || getActiveUserEmail()).toLowerCase().trim();
  return email ? `${CHECKOUT_SESSION_PREFIX}_${email}` : CHECKOUT_SESSION_PREFIX;
}

export interface SavedAccountData {
  accountNumber: string;
  accountType?: string;
  bankName?: string;
  accountHolderName?: string;
  branchName?: string;
  updatedAt: string;
}

/**
 * Automatically saves the user's account number for a given payment method (strictly isolated per user email)
 */
export function savePaymentAccount(
  methodName: string,
  accountNumber: string,
  extra?: { accountType?: string; bankName?: string; accountHolderName?: string; branchName?: string },
  userEmail?: string
): void {
  if (!methodName || !accountNumber) return;
  try {
    const storageKey = getAccountsKey(userEmail);
    const raw = localStorage.getItem(storageKey);
    const map: Record<string, SavedAccountData> = raw ? JSON.parse(raw) : {};
    const normalizedKey = methodName.trim().toLowerCase();
    map[normalizedKey] = {
      accountNumber: accountNumber.trim(),
      accountType: extra?.accountType || 'Personal',
      bankName: extra?.bankName,
      accountHolderName: extra?.accountHolderName,
      branchName: extra?.branchName,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(map));
  } catch (err) {
    console.warn('Error saving payment account:', err);
  }
}

/**
 * Retrieves the previously saved account number for a payment method (strictly isolated per user email)
 */
export function getSavedPaymentAccount(methodName: string, userEmail?: string): string {
  if (!methodName) return '';
  try {
    const storageKey = getAccountsKey(userEmail);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return '';
    const map: Record<string, SavedAccountData> = JSON.parse(raw);
    const normalizedKey = methodName.trim().toLowerCase();
    return map[normalizedKey]?.accountNumber || '';
  } catch {
    return '';
  }
}

/**
 * Retrieves the complete saved metadata for a payment method
 */
export function getSavedPaymentMeta(methodName: string, userEmail?: string): SavedAccountData | null {
  if (!methodName) return null;
  try {
    const storageKey = getAccountsKey(userEmail);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const map: Record<string, SavedAccountData> = JSON.parse(raw);
    const normalizedKey = methodName.trim().toLowerCase();
    return map[normalizedKey] || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves all saved accounts for this specific user
 */
export function getAllSavedPaymentAccounts(userEmail?: string): Record<string, SavedAccountData> {
  try {
    const storageKey = getAccountsKey(userEmail);
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export interface ActiveCheckoutSession {
  currentPage: 'swap' | 'summary' | 'qrcode';
  currentOrderId?: string;
  payAmount: number;
  tokenSymbol: string;
  tokenNetwork?: string;
  fiatCode: string;
  paymentMethod: string;
  accountNumber: string;
  accountType: string;
  updatedAt: string;
}

/**
 * Persists the active in-progress checkout session (strictly isolated per user email)
 */
export function saveActiveCheckoutSession(session: ActiveCheckoutSession, userEmail?: string): void {
  try {
    const storageKey = getSessionKey(userEmail);
    const serialized = JSON.stringify(session);
    sessionStorage.setItem(storageKey, serialized);
    localStorage.setItem(storageKey, serialized);
  } catch (err) {
    console.warn('Error saving checkout session:', err);
  }
}

/**
 * Loads the active checkout session if one exists for this user email
 */
export function getActiveCheckoutSession(userEmail?: string): ActiveCheckoutSession | null {
  try {
    const storageKey = getSessionKey(userEmail);
    const raw = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears the active checkout session when user starts a fresh new order or signs out
 */
export function clearActiveCheckoutSession(userEmail?: string): void {
  try {
    const storageKey = getSessionKey(userEmail);
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey);
    // Also clear default generic keys if any
    sessionStorage.removeItem(CHECKOUT_SESSION_PREFIX);
    localStorage.removeItem(CHECKOUT_SESSION_PREFIX);
  } catch (err) {
    console.warn('Error clearing checkout session:', err);
  }
}
