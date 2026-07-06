/**
 * Country dial-code data for the Sign-In country picker (Figma 6522:27090).
 * `suggested` marks the region-relevant codes surfaced above the full list.
 */
export type Country = {
  iso: string; // ISO 3166-1 alpha-2, used as stable key
  name: string;
  dialCode: string;
  flag: string; // emoji flag
  suggested?: boolean;
};

export const COUNTRIES: Country[] = [
  {iso: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', suggested: true},
  {iso: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', suggested: true},
  {iso: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', suggested: true},
  {iso: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', suggested: true},
  {iso: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', suggested: true},
  {iso: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', suggested: true},
  {iso: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', suggested: true},

  {iso: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺'},
  {iso: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭'},
  {iso: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩'},
  {iso: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦'},
  {iso: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳'},
  {iso: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷'},
  {iso: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪'},
  {iso: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩'},
  {iso: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷'},
  {iso: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶'},
  {iso: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹'},
  {iso: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵'},
  {iso: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴'},
  {iso: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼'},
  {iso: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧'},
  {iso: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾'},
  {iso: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦'},
  {iso: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵'},
  {iso: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱'},
  {iso: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿'},
  {iso: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬'},
  {iso: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲'},
  {iso: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦'},
  {iso: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺'},
  {iso: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬'},
  {iso: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦'},
  {iso: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷'},
  {iso: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸'},
  {iso: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰'},
  {iso: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭'},
  {iso: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷'},
  {iso: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸'},
];

export const SUGGESTED_COUNTRIES = COUNTRIES.filter(c => c.suggested);

/** Default selection for the Sign-In screen. */
export const DEFAULT_COUNTRY: Country =
  COUNTRIES.find(c => c.iso === 'AE') ?? COUNTRIES[0];
