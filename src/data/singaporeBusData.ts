export interface LtaBusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  mrtInterchange?: string[];
  services: string[];
}

export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export interface BusArrivalInfo {
  EstimatedArrival: string; // ISO String
  Latitude: number;
  Longitude: number;
  Load: BusLoad;
  Feature: 'WAB' | '';
  Type: BusType;
  SpeedKmh: number;
  DistanceMeters: number;
  StopsAway: number;
  ConfidencePct: number;
  VehiclePlate?: string;
}

export interface ServiceArrival {
  ServiceNo: string;
  Operator: BusOperator;
  NextBus: BusArrivalInfo;
  NextBus2?: BusArrivalInfo;
  NextBus3?: BusArrivalInfo;
}

export interface BusRouteStopInfo {
  BusStopCode: string;
  StopSequence: number;
  RoadName: string;
  Description: string;
  DistanceKm: number;
  Latitude: number;
  Longitude: number;
}

export interface BusServiceDetail {
  ServiceNo: string;
  Operator: BusOperator;
  Category: 'Trunk' | 'Feeder' | 'Express' | 'City Direct';
  Origin: string;
  Destination: string;
  OriginCode: string;
  DestinationCode: string;
  FirstBus: string;
  LastBus: string;
  FrequencyPeakMin: number;
  FrequencyOffPeakMin: number;
  Stops: BusRouteStopInfo[];
  Waypoints: [number, number][];
}

// Authentic Singapore Bus Stops across Key Hubs
export const SINGAPORE_BUS_STOPS: LtaBusStop[] = [
  // Orchard / Somerset
  {
    BusStopCode: "09048",
    RoadName: "Orchard Rd",
    Description: "Lucky Plaza",
    Latitude: 1.3044,
    Longitude: 103.8340,
    mrtInterchange: ["NS22", "TE14"],
    services: ["7", "14", "16", "65", "106", "111", "123", "175", "502"]
  },
  {
    BusStopCode: "09047",
    RoadName: "Orchard Rd",
    Description: "Orchard Stn/Tang Plaza",
    Latitude: 1.3051,
    Longitude: 103.8324,
    mrtInterchange: ["NS22", "TE14"],
    services: ["36", "77", "124", "143", "167", "174", "190", "972"]
  },
  {
    BusStopCode: "09038",
    RoadName: "Orchard Rd",
    Description: "Opp Mandarin Orchard",
    Latitude: 1.3025,
    Longitude: 103.8358,
    mrtInterchange: ["NS23"],
    services: ["7", "14", "16", "36", "65", "77", "106", "111", "123", "174", "175", "502"]
  },
  {
    BusStopCode: "08138",
    RoadName: "Orchard Rd",
    Description: "Dhoby Ghaut Stn Exit B",
    Latitude: 1.2993,
    Longitude: 103.8453,
    mrtInterchange: ["NS24", "NE6", "CC1"],
    services: ["7", "14", "16", "36", "65", "77", "106", "111", "124", "167", "174", "175", "190", "857"]
  },

  // Downtown / Marina Bay / Raffles Place
  {
    BusStopCode: "03223",
    RoadName: "North Bridge Rd",
    Description: "Opp The Treasury",
    Latitude: 1.2908,
    Longitude: 103.8504,
    mrtInterchange: ["EW13", "NS25"],
    services: ["51", "61", "63", "80", "124", "145", "166", "174", "197", "851"]
  },
  {
    BusStopCode: "04179",
    RoadName: "Collyer Quay",
    Description: "Ocean Financial Ctr / Raffles Pl",
    Latitude: 1.2828,
    Longitude: 103.8524,
    mrtInterchange: ["EW14", "NS26"],
    services: ["10", "57", "70", "100", "107", "130", "131", "167", "196"]
  },
  {
    BusStopCode: "03509",
    RoadName: "Bayfront Ave",
    Description: "Marina Bay Sands Hotel",
    Latitude: 1.2842,
    Longitude: 103.8596,
    mrtInterchange: ["DT16", "CE1"],
    services: ["97", "106", "133", "502", "518"]
  },
  {
    BusStopCode: "03511",
    RoadName: "Bayfront Ave",
    Description: "Marina Bay Sands Theatre",
    Latitude: 1.2849,
    Longitude: 103.8587,
    mrtInterchange: ["DT16", "CE1"],
    services: ["97", "106", "133", "502", "518"]
  },

  // Bugis / Bras Basah
  {
    BusStopCode: "01112",
    RoadName: "Victoria St",
    Description: "Bugis Stn Exit A",
    Latitude: 1.3006,
    Longitude: 103.8561,
    mrtInterchange: ["EW12", "DT14"],
    services: ["2", "12", "33", "130", "133", "960", "980"]
  },
  {
    BusStopCode: "01012",
    RoadName: "Bras Basah Rd",
    Description: "Hotel Rendezvous",
    Latitude: 1.2982,
    Longitude: 103.8497,
    mrtInterchange: ["CC2", "DT21"],
    services: ["7", "14", "16", "36", "77", "106", "111", "167", "174", "175", "502", "857"]
  },

  // Chinatown / Outram / HarbourFront
  {
    BusStopCode: "05013",
    RoadName: "Eu Tong Sen St",
    Description: "Chinatown Stn Exit C",
    Latitude: 1.2844,
    Longitude: 103.8441,
    mrtInterchange: ["NE4", "DT19"],
    services: ["2", "12", "33", "54", "61", "63", "80", "124", "143", "147", "190", "851", "961", "970"]
  },
  {
    BusStopCode: "10169",
    RoadName: "Telok Blangah Rd",
    Description: "VivoCity / HarbourFront Stn",
    Latitude: 1.2652,
    Longitude: 103.8223,
    mrtInterchange: ["NE1", "CC29"],
    services: ["10", "30", "57", "61", "65", "80", "97", "100", "131", "143", "145", "166"]
  },

  // Jurong East
  {
    BusStopCode: "28009",
    RoadName: "Jurong Gateway Rd",
    Description: "Jurong East Interchange",
    Latitude: 1.3332,
    Longitude: 103.7423,
    mrtInterchange: ["NS1", "EW24"],
    services: ["51", "52", "66", "78", "79", "97", "98", "105", "143", "183", "197", "334", "502"]
  },
  {
    BusStopCode: "28201",
    RoadName: "Jurong Town Hall Rd",
    Description: "Jurong East Library",
    Latitude: 1.3328,
    Longitude: 103.7388,
    services: ["51", "78", "97", "143", "176", "197", "198"]
  },

  // Clementi
  {
    BusStopCode: "17009",
    RoadName: "Clementi Ave 3",
    Description: "Clementi Interchange",
    Latitude: 1.3152,
    Longitude: 103.7651,
    mrtInterchange: ["EW23"],
    services: ["14", "52", "96", "99", "147", "156", "165", "166", "175", "196", "282", "284"]
  },

  // Eunos
  {
    BusStopCode: "83139",
    RoadName: "Sims Ave East / Jln Eunos",
    Description: "Opp Eunos Stn",
    Latitude: 1.3197,
    Longitude: 103.9029,
    mrtInterchange: ["EW7"],
    services: ["15", "21", "25", "51", "55", "60", "63", "93", "94", "854"]
  },

  // Serangoon
  {
    BusStopCode: "66009",
    RoadName: "Serangoon Ave 2",
    Description: "Serangoon Interchange / NEX",
    Latitude: 1.3506,
    Longitude: 103.8732,
    mrtInterchange: ["NE12", "CC13"],
    services: ["100", "101", "103", "105", "109", "158", "315", "317"]
  },

  // Bishan / Ang Mo Kio
  {
    BusStopCode: "53009",
    RoadName: "Bishan Pl",
    Description: "Bishan Interchange / Junction 8",
    Latitude: 1.3508,
    Longitude: 103.8488,
    mrtInterchange: ["NS17", "CC15"],
    services: ["52", "53", "54", "55", "56", "57", "58", "59", "410"]
  },
  {
    BusStopCode: "54009",
    RoadName: "Ang Mo Kio Ave 8",
    Description: "Ang Mo Kio Interchange / AMK Hub",
    Latitude: 1.3698,
    Longitude: 103.8496,
    mrtInterchange: ["NS16", "CR11"],
    services: ["22", "24", "25", "73", "86", "130", "133", "135", "136", "138", "166", "169", "261"]
  },

  // Tampines / Bedok
  {
    BusStopCode: "75009",
    RoadName: "Tampines Ctrl 1",
    Description: "Tampines Interchange",
    Latitude: 1.3541,
    Longitude: 103.9431,
    mrtInterchange: ["EW2", "DT32"],
    services: ["3", "4", "8", "10", "19", "20", "23", "28", "29", "31", "37", "38", "46", "65", "67", "68", "69", "72"]
  },
  {
    BusStopCode: "84009",
    RoadName: "Bedok North Dr",
    Description: "Bedok Interchange / Bedok Mall",
    Latitude: 1.3241,
    Longitude: 103.9300,
    mrtInterchange: ["EW5"],
    services: ["7", "9", "14", "16", "17", "18", "26", "30", "32", "33", "35", "40", "60", "66", "69", "87", "168", "196", "197", "222", "225", "228", "229"]
  },

  // Woodlands
  {
    BusStopCode: "46009",
    RoadName: "Woodlands Sq",
    Description: "Woodlands Integrated Transport Hub",
    Latitude: 1.4371,
    Longitude: 103.7865,
    mrtInterchange: ["NS9", "TE2"],
    services: ["161", "168", "169", "178", "187", "856", "900", "901", "902", "903", "904", "911", "912", "913", "925", "960", "961", "962", "963", "964", "965", "966", "969"]
  },

  // Changi Airport
  {
    BusStopCode: "95109",
    RoadName: "PTB3 B/ment",
    Description: "Changi Airport PTB3",
    Latitude: 1.3551,
    Longitude: 103.9868,
    mrtInterchange: ["CG2"],
    services: ["24", "27", "34", "36", "53", "110", "858"]
  }
];

// Rich Route Details with Real Geometric Coordinates across Singapore
export const BUS_SERVICE_DETAILS: Record<string, BusServiceDetail> = {
  "190": {
    ServiceNo: "190",
    Operator: "SMRT",
    Category: "Trunk",
    Origin: "Choa Chu Kang Int",
    Destination: "Kampong Bahru Ter",
    OriginCode: "44009",
    DestinationCode: "10041",
    FirstBus: "05:30",
    LastBus: "23:45",
    FrequencyPeakMin: 4,
    FrequencyOffPeakMin: 8,
    Waypoints: [
      [1.3854, 103.7443], // CCK
      [1.3780, 103.7630], // Bukit Panjang
      [1.3650, 103.7820], // BKE / PIE
      [1.3320, 103.8180], // Whitley Rd
      [1.3140, 103.8340], // Scotts Rd / Newton
      [1.3051, 103.8324], // Tang Plaza
      [1.2993, 103.8453], // Dhoby Ghaut
      [1.2925, 103.8488], // Clarke Quay
      [1.2844, 103.8441], // Chinatown
      [1.2750, 103.8370]  // Kampong Bahru
    ],
    Stops: [
      { BusStopCode: "44009", StopSequence: 1, RoadName: "Choa Chu Kang Ave 4", Description: "Choa Chu Kang Int", DistanceKm: 0.0, Latitude: 1.3854, Longitude: 103.7443 },
      { BusStopCode: "44539", StopSequence: 4, RoadName: "Teck Whye Ave", Description: "Blk 108", DistanceKm: 1.9, Latitude: 1.3792, Longitude: 103.7540 },
      { BusStopCode: "44031", StopSequence: 8, RoadName: "Bt Panjang Rd", Description: "Blk 223", DistanceKm: 4.2, Latitude: 1.3768, Longitude: 103.7698 },
      { BusStopCode: "40019", StopSequence: 13, RoadName: "Whitley Rd", Description: "Raffles Town Club", DistanceKm: 11.5, Latitude: 1.3201, Longitude: 103.8282 },
      { BusStopCode: "40189", StopSequence: 16, RoadName: "Scotts Rd", Description: "Far East Plaza", DistanceKm: 14.1, Latitude: 1.3072, Longitude: 103.8328 },
      { BusStopCode: "09047", StopSequence: 17, RoadName: "Orchard Rd", Description: "Orchard Stn/Tang Plaza", DistanceKm: 14.7, Latitude: 1.3051, Longitude: 103.8324 },
      { BusStopCode: "08138", StopSequence: 20, RoadName: "Orchard Rd", Description: "Dhoby Ghaut Stn Exit B", DistanceKm: 16.2, Latitude: 1.2993, Longitude: 103.8453 },
      { BusStopCode: "04222", StopSequence: 22, RoadName: "Eu Tong Sen St", Description: "Clarke Quay Stn", DistanceKm: 17.5, Latitude: 1.2885, Longitude: 103.8468 },
      { BusStopCode: "05013", StopSequence: 24, RoadName: "Eu Tong Sen St", Description: "Chinatown Stn Exit C", DistanceKm: 18.3, Latitude: 1.2844, Longitude: 103.8441 },
      { BusStopCode: "10041", StopSequence: 27, RoadName: "Spooner Rd", Description: "Kampong Bahru Ter", DistanceKm: 20.4, Latitude: 1.2750, Longitude: 103.8370 }
    ]
  },
  "65": {
    ServiceNo: "65",
    Operator: "SBST",
    Category: "Trunk",
    Origin: "Tampines Int",
    Destination: "HarbourFront Int",
    OriginCode: "75009",
    DestinationCode: "14141",
    FirstBus: "05:20",
    LastBus: "23:40",
    FrequencyPeakMin: 5,
    FrequencyOffPeakMin: 9,
    Waypoints: [
      [1.3541, 103.9431], // Tampines Int
      [1.3410, 103.9310], // Bedok Reservoir
      [1.3320, 103.8880], // MacPherson / Ubi
      [1.3210, 103.8620], // Bendemeer / Boon Keng
      [1.3090, 103.8520], // Little India
      [1.3044, 103.8340], // Lucky Plaza Orchard
      [1.2920, 103.8290], // River Valley
      [1.2830, 103.8240], // Lower Delta
      [1.2652, 103.8223]  // VivoCity / HarbourFront
    ],
    Stops: [
      { BusStopCode: "75009", StopSequence: 1, RoadName: "Tampines Ctrl 1", Description: "Tampines Interchange", DistanceKm: 0.0, Latitude: 1.3541, Longitude: 103.9431 },
      { BusStopCode: "75051", StopSequence: 6, RoadName: "Bedok Reservoir Rd", Description: "Opp Waterfront Waves", DistanceKm: 3.4, Latitude: 1.3385, Longitude: 103.9240 },
      { BusStopCode: "70119", StopSequence: 14, RoadName: "Ubi Ave 2", Description: "Ubi Stn Exit A", DistanceKm: 8.2, Latitude: 1.3298, Longitude: 103.8992 },
      { BusStopCode: "60111", StopSequence: 21, RoadName: "Serangoon Rd", Description: "Boon Keng Stn Exit B", DistanceKm: 12.8, Latitude: 1.3194, Longitude: 103.8618 },
      { BusStopCode: "40011", StopSequence: 27, RoadName: "Bukit Timah Rd", Description: "Little India Stn", DistanceKm: 15.6, Latitude: 1.3072, Longitude: 103.8492 },
      { BusStopCode: "09048", StopSequence: 32, RoadName: "Orchard Rd", Description: "Lucky Plaza", DistanceKm: 18.1, Latitude: 1.3044, Longitude: 103.8340 },
      { BusStopCode: "08138", StopSequence: 34, RoadName: "Orchard Rd", Description: "Dhoby Ghaut Stn Exit B", DistanceKm: 19.3, Latitude: 1.2993, Longitude: 103.8453 },
      { BusStopCode: "10169", StopSequence: 43, RoadName: "Telok Blangah Rd", Description: "VivoCity / HarbourFront Stn", DistanceKm: 25.4, Latitude: 1.2652, Longitude: 103.8223 },
      { BusStopCode: "14141", StopSequence: 44, RoadName: "Seah Im Rd", Description: "HarbourFront Int", DistanceKm: 25.9, Latitude: 1.2660, Longitude: 103.8190 }
    ]
  },
  "143": {
    ServiceNo: "143",
    Operator: "TTS",
    Category: "Trunk",
    Origin: "Toa Payoh Int",
    Destination: "Jurong East Int",
    OriginCode: "52009",
    DestinationCode: "28009",
    FirstBus: "05:30",
    LastBus: "23:45",
    FrequencyPeakMin: 6,
    FrequencyOffPeakMin: 10,
    Waypoints: [
      [1.3325, 103.8475], // Toa Payoh
      [1.3200, 103.8440], // Novena
      [1.3051, 103.8324], // Orchard Tang Plaza
      [1.2844, 103.8441], // Chinatown
      [1.2652, 103.8223], // HarbourFront
      [1.2810, 103.7950], // Pasir Panjang
      [1.2940, 103.7710], // West Coast
      [1.3152, 103.7651], // Clementi
      [1.3332, 103.7423]  // Jurong East
    ],
    Stops: [
      { BusStopCode: "52009", StopSequence: 1, RoadName: "Lor 6 Toa Payoh", Description: "Toa Payoh Int", DistanceKm: 0.0, Latitude: 1.3325, Longitude: 103.8475 },
      { BusStopCode: "50038", StopSequence: 5, RoadName: "Thomson Rd", Description: "Novena Stn", DistanceKm: 2.5, Latitude: 1.3204, Longitude: 103.8437 },
      { BusStopCode: "09047", StopSequence: 11, RoadName: "Orchard Rd", Description: "Orchard Stn/Tang Plaza", DistanceKm: 5.8, Latitude: 1.3051, Longitude: 103.8324 },
      { BusStopCode: "05013", StopSequence: 19, RoadName: "Eu Tong Sen St", Description: "Chinatown Stn Exit C", DistanceKm: 9.6, Latitude: 1.2844, Longitude: 103.8441 },
      { BusStopCode: "10169", StopSequence: 28, RoadName: "Telok Blangah Rd", Description: "VivoCity / HarbourFront Stn", DistanceKm: 14.8, Latitude: 1.2652, Longitude: 103.8223 },
      { BusStopCode: "15119", StopSequence: 34, RoadName: "Pasir Panjang Rd", Description: "Haw Par Villa Stn", DistanceKm: 18.6, Latitude: 1.2825, Longitude: 103.7820 },
      { BusStopCode: "17009", StopSequence: 41, RoadName: "Clementi Ave 3", Description: "Clementi Int", DistanceKm: 23.4, Latitude: 1.3152, Longitude: 103.7651 },
      { BusStopCode: "28009", StopSequence: 48, RoadName: "Jurong Gateway Rd", Description: "Jurong East Interchange", DistanceKm: 27.2, Latitude: 1.3332, Longitude: 103.7423 }
    ]
  },
  "14": {
    ServiceNo: "14",
    Operator: "SBST",
    Category: "Trunk",
    Origin: "Bedok Int",
    Destination: "Clementi Int",
    OriginCode: "84009",
    DestinationCode: "17009",
    FirstBus: "05:30",
    LastBus: "23:50",
    FrequencyPeakMin: 5,
    FrequencyOffPeakMin: 9,
    Waypoints: [
      [1.3241, 103.9300], // Bedok
      [1.3080, 103.9030], // Marine Parade
      [1.2980, 103.8650], // Mountbatten
      [1.2908, 103.8504], // City Hall / Treasury
      [1.3044, 103.8340], // Lucky Plaza
      [1.2920, 103.8180], // Tanglin
      [1.2940, 103.7920], // Buona Vista / Dover
      [1.3152, 103.7651]  // Clementi
    ],
    Stops: [
      { BusStopCode: "84009", StopSequence: 1, RoadName: "Bedok North Dr", Description: "Bedok Interchange / Bedok Mall", DistanceKm: 0.0, Latitude: 1.3241, Longitude: 103.9300 },
      { BusStopCode: "92049", StopSequence: 8, RoadName: "Marine Parade Rd", Description: "Parkway Parade", DistanceKm: 4.8, Latitude: 1.3015, Longitude: 103.9052 },
      { BusStopCode: "03223", StopSequence: 18, RoadName: "North Bridge Rd", Description: "Opp The Treasury", DistanceKm: 12.3, Latitude: 1.2908, Longitude: 103.8504 },
      { BusStopCode: "08138", StopSequence: 22, RoadName: "Orchard Rd", Description: "Dhoby Ghaut Stn Exit B", DistanceKm: 14.1, Latitude: 1.2993, Longitude: 103.8453 },
      { BusStopCode: "09048", StopSequence: 24, RoadName: "Orchard Rd", Description: "Lucky Plaza", DistanceKm: 15.6, Latitude: 1.3044, Longitude: 103.8340 },
      { BusStopCode: "11189", StopSequence: 33, RoadName: "Holland Rd", Description: "Holland Village Stn", DistanceKm: 20.2, Latitude: 1.3116, Longitude: 103.7958 },
      { BusStopCode: "17009", StopSequence: 40, RoadName: "Clementi Ave 3", Description: "Clementi Interchange", DistanceKm: 24.8, Latitude: 1.3152, Longitude: 103.7651 }
    ]
  },
  "36": {
    ServiceNo: "36",
    Operator: "GAS",
    Category: "Trunk",
    Origin: "Changi Airport PTB3",
    Destination: "Tomlinson Rd (Loop)",
    OriginCode: "95109",
    DestinationCode: "95109",
    FirstBus: "05:30",
    LastBus: "23:58",
    FrequencyPeakMin: 7,
    FrequencyOffPeakMin: 11,
    Waypoints: [
      [1.3551, 103.9868], // Changi Airport T3
      [1.3120, 103.9180], // ECP Express
      [1.3010, 103.8610], // Suntec City
      [1.2982, 103.8497], // Hotel Rendezvous
      [1.3051, 103.8324], // Tang Plaza
      [1.3080, 103.8240], // Tomlinson
      [1.3025, 103.8358], // Mandarin Orchard
      [1.3551, 103.9868]  // Return to Airport
    ],
    Stops: [
      { BusStopCode: "95109", StopSequence: 1, RoadName: "PTB3 B/ment", Description: "Changi Airport PTB3", DistanceKm: 0.0, Latitude: 1.3551, Longitude: 103.9868 },
      { BusStopCode: "02089", StopSequence: 12, RoadName: "Temasek Ave", Description: "Opp The Ritz-Carlton", DistanceKm: 19.4, Latitude: 1.2905, Longitude: 103.8592 },
      { BusStopCode: "01012", StopSequence: 15, RoadName: "Bras Basah Rd", Description: "Hotel Rendezvous", DistanceKm: 21.3, Latitude: 1.2982, Longitude: 103.8497 },
      { BusStopCode: "09047", StopSequence: 18, RoadName: "Orchard Rd", Description: "Orchard Stn/Tang Plaza", DistanceKm: 23.5, Latitude: 1.3051, Longitude: 103.8324 },
      { BusStopCode: "09038", StopSequence: 22, RoadName: "Orchard Rd", Description: "Opp Mandarin Orchard", DistanceKm: 26.2, Latitude: 1.3025, Longitude: 103.8358 },
      { BusStopCode: "95109", StopSequence: 38, RoadName: "PTB3 B/ment", Description: "Changi Airport PTB3", DistanceKm: 47.6, Latitude: 1.3551, Longitude: 103.9868 }
    ]
  },
  "106": {
    ServiceNo: "106",
    Operator: "TTS",
    Category: "Trunk",
    Origin: "Bukit Batok Int",
    Destination: "Shenton Way Ter",
    OriginCode: "43009",
    DestinationCode: "03239",
    FirstBus: "05:30",
    LastBus: "23:45",
    FrequencyPeakMin: 5,
    FrequencyOffPeakMin: 8,
    Waypoints: [
      [1.3490, 103.7490], // Bukit Batok
      [1.3250, 103.7780], // Clementi Rd / King Albert Park
      [1.3120, 103.8050], // Holland Rd
      [1.3044, 103.8340], // Lucky Plaza
      [1.2842, 103.8596], // Marina Bay Sands
      [1.2750, 103.8510]  // Shenton Way
    ],
    Stops: [
      { BusStopCode: "43009", StopSequence: 1, RoadName: "Bt Batok Ctrl", Description: "Bukit Batok Int", DistanceKm: 0.0, Latitude: 1.3490, Longitude: 103.7490 },
      { BusStopCode: "09048", StopSequence: 22, RoadName: "Orchard Rd", Description: "Lucky Plaza", DistanceKm: 14.8, Latitude: 1.3044, Longitude: 103.8340 },
      { BusStopCode: "08138", StopSequence: 24, RoadName: "Orchard Rd", Description: "Dhoby Ghaut Stn Exit B", DistanceKm: 16.1, Latitude: 1.2993, Longitude: 103.8453 },
      { BusStopCode: "03509", StopSequence: 30, RoadName: "Bayfront Ave", Description: "Marina Bay Sands Hotel", DistanceKm: 19.8, Latitude: 1.2842, Longitude: 103.8596 }
    ]
  },
  "960": {
    ServiceNo: "960",
    Operator: "SMRT",
    Category: "Trunk",
    Origin: "Woodlands Int",
    Destination: "Marina Ctr Ter",
    OriginCode: "46009",
    DestinationCode: "02099",
    FirstBus: "05:30",
    LastBus: "23:30",
    FrequencyPeakMin: 6,
    FrequencyOffPeakMin: 10,
    Waypoints: [
      [1.4371, 103.7865], // Woodlands
      [1.4120, 103.7650], // Marsiling
      [1.3780, 103.7630], // Bt Panjang
      [1.3190, 103.8430], // Novena
      [1.3006, 103.8561], // Bugis Stn
      [1.2910, 103.8580]  // Marina Ctr
    ],
    Stops: [
      { BusStopCode: "46009", StopSequence: 1, RoadName: "Woodlands Sq", Description: "Woodlands Int", DistanceKm: 0.0, Latitude: 1.4371, Longitude: 103.7865 },
      { BusStopCode: "01112", StopSequence: 28, RoadName: "Victoria St", Description: "Bugis Stn Exit A", DistanceKm: 24.3, Latitude: 1.3006, Longitude: 103.8561 }
    ]
  }
};
