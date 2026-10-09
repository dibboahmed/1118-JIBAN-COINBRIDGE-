export interface FiatCurrency {
  code: string;
  symbol: string;
  name: string;
  rateToEur: number;
  rateToUsd?: number;
  flag?: string;
  country: string;
}

export const FIAT_CURRENCIES: FiatCurrency[] = [
  // Top Global & Regional Heavyweights
  { code: 'BDT', symbol: 'Tk', name: 'Bangladeshi Taka', rateToEur: 140.02, rateToUsd: 125.0, flag: '🇧🇩', country: 'Bangladesh' },
  { code: 'USD', symbol: '$', name: 'Global USD', rateToEur: 1.1399, rateToUsd: 1.0, flag: '🌐', country: 'Global USD' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToEur: 109.33, rateToUsd: 90.0, flag: '🇮🇳', country: 'India' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToEur: 1180.0, rateToUsd: 1345.0, flag: '🇳🇬', country: 'Nigeria' },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToEur: 1, rateToUsd: 0.8773, flag: '🇪🇺', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToEur: 0.861, rateToUsd: 0.7554, flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rateToEur: 315.7, rateToUsd: 276.95, flag: '🇵🇰', country: 'Pakistan' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rateToEur: 4.27, rateToUsd: 3.75, flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rateToEur: 4.18, rateToUsd: 3.6725, flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', rateToEur: 4.14, rateToUsd: 3.64, flag: '🇶🇦', country: 'Qatar' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', rateToEur: 0.35, rateToUsd: 0.3085, flag: '🇰🇼', country: 'Kuwait' },
  { code: 'OMR', symbol: 'RO', name: 'Omani Rial', rateToEur: 0.43, rateToUsd: 0.3845, flag: '🇴🇲', country: 'Oman' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', rateToEur: 0.42, rateToUsd: 0.376, flag: '🇧🇭', country: 'Bahrain' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateToEur: 4.64, rateToUsd: 4.0759, flag: '🇲🇾', country: 'Malaysia' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToEur: 1.45, rateToUsd: 1.2778, flag: '🇸🇬', country: 'Singapore' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateToEur: 20406.5, rateToUsd: 15700.0, flag: '🇮🇩', country: 'Indonesia' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToEur: 1.61, rateToUsd: 1.4133, flag: '🇨🇦', country: 'Canada' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToEur: 1.62, rateToUsd: 1.4234, flag: '🇦🇺', country: 'Australia' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToEur: 179.58, rateToUsd: 157.53, flag: '🇯🇵', country: 'Japan' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateToEur: 7.66, rateToUsd: 6.7246, flag: '🇨🇳', country: 'China' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rateToEur: 0.94, rateToUsd: 0.8284, flag: '🇨🇭', country: 'Switzerland' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateToEur: 55.76, rateToUsd: 48.91, flag: '🇹🇷', country: 'Turkey' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rateToEur: 96.06, rateToUsd: 84.27, flag: '🇷🇺', country: 'Russia' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateToEur: 1547.3, rateToUsd: 1357.4, flag: '🇰🇷', country: 'South Korea' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToEur: 5.9, rateToUsd: 5.1843, flag: '🇧🇷', country: 'Brazil' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToEur: 18.58, rateToUsd: 16.3, flag: '🇿🇦', country: 'South Africa' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rateToEur: 38.0, rateToUsd: 35.0, flag: '🇹🇭', country: 'Thailand' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateToEur: 29598.3, rateToUsd: 25965.0, flag: '🇻🇳', country: 'Vietnam' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToEur: 71.25, rateToUsd: 62.5, flag: '🇵🇭', country: 'Philippines' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateToEur: 58.91, rateToUsd: 51.68, flag: '🇪🇬', country: 'Egypt' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', rateToEur: 78.0, rateToUsd: 68.5, flag: '🇦🇫', country: 'Afghanistan' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram', rateToEur: 440.0, rateToUsd: 388.0, flag: '🇦🇲', country: 'Armenia' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', rateToEur: 1.93, rateToUsd: 1.6998, flag: '🇦🇿', country: 'Azerbaijan' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', rateToEur: 1.45, rateToUsd: 1.2778, flag: '🇧🇳', country: 'Brunei' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari', rateToEur: 2.97, rateToUsd: 2.6074, flag: '🇬🇪', country: 'Georgia' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rateToEur: 8.94, rateToUsd: 7.8445, flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', rateToEur: 1493.5, rateToUsd: 1310.0, flag: '🇮🇶', country: 'Iraq' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rateToEur: 3.46, rateToUsd: 3.0437, flag: '🇮🇱', country: 'Israel' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', rateToEur: 0.8, rateToUsd: 0.709, flag: '🇯🇴', country: 'Jordan' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', rateToEur: 505.03, rateToUsd: 443.04, flag: '🇰🇿', country: 'Kazakhstan' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rateToEur: 376.08, rateToUsd: 329.92, flag: '🇱🇰', country: 'Sri Lanka' },
  { code: 'NPR', symbol: 'रु', name: 'Nepalese Rupee', rateToEur: 174.94, rateToUsd: 153.46, flag: '🇳🇵', country: 'Nepal' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateToEur: 2.01, rateToUsd: 1.765, flag: '🇳🇿', country: 'New Zealand' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateToEur: 4.3, rateToUsd: 3.95, flag: '🇵🇱', country: 'Poland' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateToEur: 11.29, rateToUsd: 9.9101, flag: '🇸🇪', country: 'Sweden' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateToEur: 10.83, rateToUsd: 9.5054, flag: '🇳🇴', country: 'Norway' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rateToEur: 7.47, rateToUsd: 6.5602, flag: '🇩🇰', country: 'Denmark' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rateToEur: 25.2, rateToUsd: 22.8, flag: '🇨🇿', country: 'Czech Republic' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rateToEur: 364.83, rateToUsd: 320.05, flag: '🇭🇺', country: 'Hungary' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', rateToEur: 20.14, rateToUsd: 17.6711, flag: '🇲🇽', country: 'Mexico' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', rateToEur: 1737.17, rateToUsd: 1523.9, flag: '🇦🇷', country: 'Argentina' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', rateToEur: 3711.8, rateToUsd: 3256.2, flag: '🇨🇴', country: 'Colombia' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', rateToEur: 1097.72, rateToUsd: 962.99, flag: '🇨🇱', country: 'Chile' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToEur: 147.63, rateToUsd: 129.51, flag: '🇰🇪', country: 'Kenya' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToEur: 13.18, rateToUsd: 11.56, flag: '🇬🇭', country: 'Ghana' },
];
