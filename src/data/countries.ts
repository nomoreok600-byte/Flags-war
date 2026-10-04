import { Country } from '../types/game';

export const ALL_COUNTRIES: Record<string, Country> = {
  // Video 4 Stars:
  AF: {
    id: 'AF',
    name: 'Afghanistan',
    code: 'AF',
    emoji: '🇦🇫',
    primaryColor: '#000000',
    secondaryColor: '#d32011',
    accentColor: '#007a3d',
    textColor: '#ffffff',
    flagType: 'afghanistan',
    stripeColors: ['#000000', '#d32011', '#007a3d'],
    emblemText: '☪',
    region: 'Asia'
  },
  IR: {
    id: 'IR',
    name: 'Iran',
    code: 'IR',
    emoji: '🇮🇷',
    primaryColor: '#239f40',
    secondaryColor: '#ffffff',
    accentColor: '#da0000',
    textColor: '#ffffff',
    flagType: 'iran',
    stripeColors: ['#239f40', '#ffffff', '#da0000'],
    emblemText: '☫',
    region: 'Middle East'
  },
  IL: {
    id: 'IL',
    name: 'Israel',
    code: 'IL',
    emoji: '🇮🇱',
    primaryColor: '#0038b8',
    secondaryColor: '#ffffff',
    accentColor: '#002080',
    textColor: '#ffffff',
    flagType: 'israel',
    stripeColors: ['#ffffff', '#0038b8', '#ffffff'],
    emblemText: '✡',
    region: 'Middle East'
  },
  IN: {
    id: 'IN',
    name: 'India',
    code: 'IN',
    emoji: '🇮🇳',
    primaryColor: '#ff9933',
    secondaryColor: '#ffffff',
    accentColor: '#138808',
    textColor: '#ffffff',
    flagType: 'india',
    stripeColors: ['#ff9933', '#ffffff', '#138808'],
    emblemText: '☸',
    region: 'Asia'
  },

  // Asia & Oceania:
  PK: {
    id: 'PK',
    name: 'Pakistan',
    code: 'PK',
    emoji: '🇵🇰',
    primaryColor: '#01411c',
    secondaryColor: '#ffffff',
    accentColor: '#03682d',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#ffffff', '#01411c', '#01411c'],
    emblemText: '☪',
    region: 'Asia'
  },
  BD: {
    id: 'BD',
    name: 'Bangladesh',
    code: 'BD',
    emoji: '🇧🇩',
    primaryColor: '#006a4e',
    secondaryColor: '#f42a41',
    accentColor: '#004d38',
    textColor: '#ffffff',
    flagType: 'japan',
    stripeColors: ['#006a4e', '#f42a41', '#006a4e'],
    emblemText: '●',
    region: 'Asia'
  },
  JP: {
    id: 'JP',
    name: 'Japan',
    code: 'JP',
    emoji: '🇯🇵',
    primaryColor: '#bc002d',
    secondaryColor: '#ffffff',
    accentColor: '#800020',
    textColor: '#ffffff',
    flagType: 'japan',
    stripeColors: ['#ffffff', '#bc002d', '#ffffff'],
    emblemText: '●',
    region: 'Asia'
  },
  CN: {
    id: 'CN',
    name: 'China',
    code: 'CN',
    emoji: '🇨🇳',
    primaryColor: '#de2910',
    secondaryColor: '#ffde00',
    accentColor: '#aa1c08',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Asia'
  },
  KR: {
    id: 'KR',
    name: 'South Korea',
    code: 'KR',
    emoji: '🇰🇷',
    primaryColor: '#0047a0',
    secondaryColor: '#cd2e3a',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '☯',
    region: 'Asia'
  },
  ID: {
    id: 'ID',
    name: 'Indonesia',
    code: 'ID',
    emoji: '🇮🇩',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    accentColor: '#cc0000',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#ff0000', '#ffffff', '#ffffff'],
    region: 'Asia'
  },
  PH: {
    id: 'PH',
    name: 'Philippines',
    code: 'PH',
    emoji: '🇵🇭',
    primaryColor: '#0038a8',
    secondaryColor: '#ce1126',
    accentColor: '#fcd116',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '☀',
    region: 'Asia'
  },
  VN: {
    id: 'VN',
    name: 'Vietnam',
    code: 'VN',
    emoji: '🇻🇳',
    primaryColor: '#da251d',
    secondaryColor: '#ffff00',
    accentColor: '#99120b',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Asia'
  },
  TH: {
    id: 'TH',
    name: 'Thailand',
    code: 'TH',
    emoji: '🇹🇭',
    primaryColor: '#2d2a4a',
    secondaryColor: '#a51931',
    accentColor: '#f4f5f8',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#a51931', '#2d2a4a', '#a51931'],
    region: 'Asia'
  },
  MY: {
    id: 'MY',
    name: 'Malaysia',
    code: 'MY',
    emoji: '🇲🇾',
    primaryColor: '#010066',
    secondaryColor: '#cc0000',
    accentColor: '#ffcc00',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '☪',
    region: 'Asia'
  },
  SA: {
    id: 'SA',
    name: 'Saudi Arabia',
    code: 'SA',
    emoji: '🇸🇦',
    primaryColor: '#006c35',
    secondaryColor: '#ffffff',
    accentColor: '#004a24',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '⚔',
    region: 'Middle East'
  },
  AE: {
    id: 'AE',
    name: 'UAE',
    code: 'AE',
    emoji: '🇦🇪',
    primaryColor: '#00732f',
    secondaryColor: '#ff0000',
    accentColor: '#000000',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#00732f', '#ffffff', '#000000'],
    region: 'Middle East'
  },
  IQ: {
    id: 'IQ',
    name: 'Iraq',
    code: 'IQ',
    emoji: '🇮🇶',
    primaryColor: '#ce1126',
    secondaryColor: '#007a3d',
    accentColor: '#000000',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#ce1126', '#ffffff', '#000000'],
    region: 'Middle East'
  },
  AU: {
    id: 'AU',
    name: 'Australia',
    code: 'AU',
    emoji: '🇦🇺',
    primaryColor: '#00008b',
    secondaryColor: '#ff0000',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Oceania'
  },
  NZ: {
    id: 'NZ',
    name: 'New Zealand',
    code: 'NZ',
    emoji: '🇳🇿',
    primaryColor: '#00247d',
    secondaryColor: '#cc142b',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Oceania'
  },

  // Americas:
  US: {
    id: 'US',
    name: 'United States',
    code: 'US',
    emoji: '🇺🇸',
    primaryColor: '#b22234',
    secondaryColor: '#ffffff',
    accentColor: '#3c3b6e',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#b22234', '#ffffff', '#3c3b6e'],
    emblemText: '★',
    region: 'Americas'
  },
  BR: {
    id: 'BR',
    name: 'Brazil',
    code: 'BR',
    emoji: '🇧🇷',
    primaryColor: '#009739',
    secondaryColor: '#fedd00',
    accentColor: '#012169',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#009739', '#fedd00', '#012169'],
    emblemText: '◆',
    region: 'Americas'
  },
  AR: {
    id: 'AR',
    name: 'Argentina',
    code: 'AR',
    emoji: '🇦🇷',
    primaryColor: '#74acdf',
    secondaryColor: '#ffffff',
    accentColor: '#f6b40e',
    textColor: '#0f172a',
    flagType: 'horizontal_3',
    stripeColors: ['#74acdf', '#ffffff', '#74acdf'],
    emblemText: '☀',
    region: 'Americas'
  },
  CA: {
    id: 'CA',
    name: 'Canada',
    code: 'CA',
    emoji: '🇨🇦',
    primaryColor: '#d80621',
    secondaryColor: '#ffffff',
    accentColor: '#960316',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#d80621', '#ffffff', '#d80621'],
    emblemText: '🍁',
    region: 'Americas'
  },
  MX: {
    id: 'MX',
    name: 'Mexico',
    code: 'MX',
    emoji: '🇲🇽',
    primaryColor: '#006847',
    secondaryColor: '#ce1126',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#006847', '#ffffff', '#ce1126'],
    emblemText: '🦅',
    region: 'Americas'
  },
  CO: {
    id: 'CO',
    name: 'Colombia',
    code: 'CO',
    emoji: '🇨🇴',
    primaryColor: '#fcd116',
    secondaryColor: '#003893',
    accentColor: '#ce1126',
    textColor: '#0f172a',
    flagType: 'horizontal_3',
    stripeColors: ['#fcd116', '#003893', '#ce1126'],
    region: 'Americas'
  },
  CL: {
    id: 'CL',
    name: 'Chile',
    code: 'CL',
    emoji: '🇨🇱',
    primaryColor: '#0039a6',
    secondaryColor: '#d52b1e',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Americas'
  },
  PE: {
    id: 'PE',
    name: 'Peru',
    code: 'PE',
    emoji: '🇵🇪',
    primaryColor: '#d91023',
    secondaryColor: '#ffffff',
    accentColor: '#960815',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#d91023', '#ffffff', '#d91023'],
    region: 'Americas'
  },

  // Europe:
  DE: {
    id: 'DE',
    name: 'Germany',
    code: 'DE',
    emoji: '🇩🇪',
    primaryColor: '#000000',
    secondaryColor: '#dd0000',
    accentColor: '#ffce00',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#000000', '#dd0000', '#ffce00'],
    region: 'Europe'
  },
  FR: {
    id: 'FR',
    name: 'France',
    code: 'FR',
    emoji: '🇫🇷',
    primaryColor: '#0055a4',
    secondaryColor: '#ffffff',
    accentColor: '#ef4135',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#0055a4', '#ffffff', '#ef4135'],
    region: 'Europe'
  },
  GB: {
    id: 'GB',
    name: 'United Kingdom',
    code: 'GB',
    emoji: '🇬🇧',
    primaryColor: '#012169',
    secondaryColor: '#c8102e',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#012169', '#c8102e', '#ffffff'],
    emblemText: '✚',
    region: 'Europe'
  },
  IT: {
    id: 'IT',
    name: 'Italy',
    code: 'IT',
    emoji: '🇮🇹',
    primaryColor: '#008c45',
    secondaryColor: '#f4f5f0',
    accentColor: '#cd212a',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#008c45', '#f4f5f0', '#cd212a'],
    region: 'Europe'
  },
  ES: {
    id: 'ES',
    name: 'Spain',
    code: 'ES',
    emoji: '🇪🇸',
    primaryColor: '#aa151b',
    secondaryColor: '#f1bf00',
    accentColor: '#aa151b',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#aa151b', '#f1bf00', '#aa151b'],
    emblemText: '♛',
    region: 'Europe'
  },
  PT: {
    id: 'PT',
    name: 'Portugal',
    code: 'PT',
    emoji: '🇵🇹',
    primaryColor: '#046a38',
    secondaryColor: '#da291c',
    accentColor: '#fed100',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#046a38', '#da291c', '#da291c'],
    emblemText: '🛡',
    region: 'Europe'
  },
  NL: {
    id: 'NL',
    name: 'Netherlands',
    code: 'NL',
    emoji: '🇳🇱',
    primaryColor: '#ae1c28',
    secondaryColor: '#ffffff',
    accentColor: '#21468b',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#ae1c28', '#ffffff', '#21468b'],
    region: 'Europe'
  },
  TR: {
    id: 'TR',
    name: 'Turkey',
    code: 'TR',
    emoji: '🇹🇷',
    primaryColor: '#e30a17',
    secondaryColor: '#ffffff',
    accentColor: '#b00711',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#e30a17', '#ffffff', '#e30a17'],
    emblemText: '☪',
    region: 'Europe'
  },
  SE: {
    id: 'SE',
    name: 'Sweden',
    code: 'SE',
    emoji: '🇸🇪',
    primaryColor: '#006aa7',
    secondaryColor: '#fecc00',
    accentColor: '#004b77',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '✚',
    region: 'Europe'
  },
  NO: {
    id: 'NO',
    name: 'Norway',
    code: 'NO',
    emoji: '🇳🇴',
    primaryColor: '#ba0c2f',
    secondaryColor: '#00205b',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '✚',
    region: 'Europe'
  },
  PL: {
    id: 'PL',
    name: 'Poland',
    code: 'PL',
    emoji: '🇵🇱',
    primaryColor: '#dc143c',
    secondaryColor: '#ffffff',
    accentColor: '#960925',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#ffffff', '#dc143c', '#dc143c'],
    region: 'Europe'
  },
  UA: {
    id: 'UA',
    name: 'Ukraine',
    code: 'UA',
    emoji: '🇺🇦',
    primaryColor: '#0057b7',
    secondaryColor: '#ffd700',
    accentColor: '#003a7a',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#0057b7', '#ffd700', '#ffd700'],
    region: 'Europe'
  },
  GR: {
    id: 'GR',
    name: 'Greece',
    code: 'GR',
    emoji: '🇬🇷',
    primaryColor: '#0d5eaf',
    secondaryColor: '#ffffff',
    accentColor: '#09427d',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '✚',
    region: 'Europe'
  },
  CH: {
    id: 'CH',
    name: 'Switzerland',
    code: 'CH',
    emoji: '🇨🇭',
    primaryColor: '#d52b1e',
    secondaryColor: '#ffffff',
    accentColor: '#9e1a10',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '✚',
    region: 'Europe'
  },

  // Africa:
  ZA: {
    id: 'ZA',
    name: 'South Africa',
    code: 'ZA',
    emoji: '🇿🇦',
    primaryColor: '#007a4d',
    secondaryColor: '#ffb612',
    accentColor: '#de3831',
    textColor: '#ffffff',
    flagType: 'custom',
    stripeColors: ['#007a4d', '#ffb612', '#de3831'],
    region: 'Africa'
  },
  NG: {
    id: 'NG',
    name: 'Nigeria',
    code: 'NG',
    emoji: '🇳🇬',
    primaryColor: '#008751',
    secondaryColor: '#ffffff',
    accentColor: '#005c37',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#008751', '#ffffff', '#008751'],
    region: 'Africa'
  },
  EG: {
    id: 'EG',
    name: 'Egypt',
    code: 'EG',
    emoji: '🇪🇬',
    primaryColor: '#c8102e',
    secondaryColor: '#ffffff',
    accentColor: '#000000',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#c8102e', '#ffffff', '#000000'],
    emblemText: '🦅',
    region: 'Africa'
  },
  MA: {
    id: 'MA',
    name: 'Morocco',
    code: 'MA',
    emoji: '🇲🇦',
    primaryColor: '#c1272d',
    secondaryColor: '#006233',
    accentColor: '#8a161b',
    textColor: '#ffffff',
    flagType: 'custom',
    emblemText: '★',
    region: 'Africa'
  },
  GH: {
    id: 'GH',
    name: 'Ghana',
    code: 'GH',
    emoji: '🇬🇭',
    primaryColor: '#cf102d',
    secondaryColor: '#fcd116',
    accentColor: '#006b3f',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#cf102d', '#fcd116', '#006b3f'],
    emblemText: '★',
    region: 'Africa'
  },
  KE: {
    id: 'KE',
    name: 'Kenya',
    code: 'KE',
    emoji: '🇰🇪',
    primaryColor: '#bb0000',
    secondaryColor: '#006600',
    accentColor: '#000000',
    textColor: '#ffffff',
    flagType: 'horizontal_3',
    stripeColors: ['#000000', '#bb0000', '#006600'],
    emblemText: '🛡',
    region: 'Africa'
  },
  DZ: {
    id: 'DZ',
    name: 'Algeria',
    code: 'DZ',
    emoji: '🇩🇿',
    primaryColor: '#006633',
    secondaryColor: '#ffffff',
    accentColor: '#d21034',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#006633', '#ffffff', '#ffffff'],
    emblemText: '☪',
    region: 'Africa'
  },
  SN: {
    id: 'SN',
    name: 'Senegal',
    code: 'SN',
    emoji: '🇸🇳',
    primaryColor: '#00853f',
    secondaryColor: '#fdef42',
    accentColor: '#e31b23',
    textColor: '#ffffff',
    flagType: 'vertical_3',
    stripeColors: ['#00853f', '#fdef42', '#e31b23'],
    emblemText: '★',
    region: 'Africa'
  },
};

export const ALL_COUNTRY_LIST = Object.values(ALL_COUNTRIES);

export interface MatchupPreset {
  id: string;
  name: string;
  description: string;
  countries: [string, string, string, string];
}

export const MATCHUP_PRESETS: MatchupPreset[] = [
  {
    id: 'video_featured',
    name: 'Original Video: AF x IR x IL x IN',
    description: 'Afghanistan 🇦🇫 vs Iran 🇮🇷 vs Israel 🇮🇱 vs India 🇮🇳 (Official Video Matchup)',
    countries: ['AF', 'IR', 'IL', 'IN']
  },
  {
    id: 'world_clash',
    name: 'Global Titans: USA x BR x DE x JP',
    description: 'USA 🇺🇸 vs Brazil 🇧🇷 vs Germany 🇩🇪 vs Japan 🇯🇵',
    countries: ['US', 'BR', 'DE', 'JP']
  },
  {
    id: 'asia_derby',
    name: 'Asia Rivalry: IN x PK x CN x BD',
    description: 'India 🇮🇳 vs Pakistan 🇵🇰 vs China 🇨🇳 vs Bangladesh 🇧🇩',
    countries: ['IN', 'PK', 'CN', 'BD']
  },
  {
    id: 'euro_battle',
    name: 'Euro Championship: FR x DE x GB x IT',
    description: 'France 🇫🇷 vs Germany 🇩🇪 vs United Kingdom 🇬🇧 vs Italy 🇮🇹',
    countries: ['FR', 'DE', 'GB', 'IT']
  },
  {
    id: 'copa_classic',
    name: 'Americas Cup: BR x AR x MX x CO',
    description: 'Brazil 🇧🇷 vs Argentina 🇦🇷 vs Mexico 🇲🇽 vs Colombia 🇨🇴',
    countries: ['BR', 'AR', 'MX', 'CO']
  },
  {
    id: 'africa_cup',
    name: 'Africa Giants: NG x EG x ZA x MA',
    description: 'Nigeria 🇳🇬 vs Egypt 🇪🇬 vs South Africa 🇿🇦 vs Morocco 🇲🇦',
    countries: ['NG', 'EG', 'ZA', 'MA']
  }
];

export const DEFAULT_PRESET = MATCHUP_PRESETS[0];

/**
 * Returns 4 random unique countries from the worldwide catalog.
 */
export function getRandom4Countries(): Country[] {
  const shuffled = [...ALL_COUNTRY_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

/**
 * Returns 16 random unique countries drafted from all over the world.
 * Guarantees a fresh, exciting world clash every single match!
 */
export function getRandom16Countries(): Country[] {
  const shuffled = [...ALL_COUNTRY_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 16);
}

/**
 * Returns 16 countries for the World Battle Royale.
 */
export function getMegaWorldCountries(count: number = 16): Country[] {
  return getRandom16Countries();
}
