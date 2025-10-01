// Competition configuration
// This contains subdivisions, release dates, and division information for each competition-year
const COMPETITION_CONFIG = {
    'APIO': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230520',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 22.0 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240518',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 21.333333333333332 }
        }
      }
    },
    'BOI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230428',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 22.0 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240503',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 21.166666666666668 }
        }
      },
      '2025': { 
        subdivisions: ['contest'], 
        date: '20250424',
        divisions: {
          'contest': { division: 'Division 1', avg_difficulty: 23.666666666666668 }
        }
      }
    },
    'CCO': {
      '2023': { 
        subdivisions: ['Canadian_Computing_Competition_Junior', 'Canadian_Computing_Competition_Senior', 'Canadian_Computing_Olympiad'], 
        date: '20230606',
        divisions: {
          'Canadian_Computing_Competition_Junior': { division: 'Division 4', avg_difficulty: 5.0 },
          'Canadian_Computing_Competition_Senior': { division: 'Division 4', avg_difficulty: 15.4 },
          'Canadian_Computing_Olympiad': { division: 'Division 2', avg_difficulty: 22.0 }
        }
      },
      '2024': { 
        subdivisions: ['Canadian_Computing_Competition_Junior', 'Canadian_Computing_Competition_Senior', 'Canadian_Computing_Olympiad'], 
        date: '20240609',
        divisions: {
          'Canadian_Computing_Competition_Junior': { division: 'Division 4', avg_difficulty: 6.0 },
          'Canadian_Computing_Competition_Senior': { division: 'Division 4', avg_difficulty: 11.4 },
          'Canadian_Computing_Olympiad': { division: 'Division 3', avg_difficulty: 20.333333333333332 }
        }
      }
    },
    'CEOI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230813',
        divisions: {
          'contest': { division: 'Division 1', avg_difficulty: 24.0 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240730',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 20.666666666666668 }
        }
      }
    },
    'COCI': {
      '2023': { 
        subdivisions: ['CONTEST_#1', 'CONTEST_#2', 'CONTEST_#3', 'CONTEST_#4', 'CONTEST_#5'], 
        date: '20230411',
        divisions: {
          'CONTEST_#1': { division: 'Division 4', avg_difficulty: 15.6 },
          'CONTEST_#2': { division: 'Division 4', avg_difficulty: 14.8 },
          'CONTEST_#3': { division: 'Division 3', avg_difficulty: 16.0 },
          'CONTEST_#4': { division: 'Division 4', avg_difficulty: 15.4 },
          'CONTEST_#5': { division: 'Division 4', avg_difficulty: 15.2 }
        }
      },
      '2024': { 
        subdivisions: ['CONTEST_#1', 'CONTEST_#2', 'CONTEST_#3', 'CONTEST_#4', 'CONTEST_#5', 'CROATIAN_OLYMPIAD_IN_INFORMATICS'], 
        date: '20240510',
        divisions: {
          'CONTEST_#1': { division: 'Division 3', avg_difficulty: 16.6 },
          'CONTEST_#2': { division: 'Division 4', avg_difficulty: 14.2 },
          'CONTEST_#3': { division: 'Division 3', avg_difficulty: 17.2 },
          'CONTEST_#4': { division: 'Division 3', avg_difficulty: 17.2 },
          'CONTEST_#5': { division: 'Division 3', avg_difficulty: 20.2 },
          'CROATIAN_OLYMPIAD_IN_INFORMATICS': { division: 'Division 1', avg_difficulty: 24.0 }
        }
      },
      '2025': { 
        subdivisions: ['CONTEST_#1', 'CONTEST_#2', 'CONTEST_#3', 'CONTEST_#4', 'CONTEST_#5'], 
        date: '20250125',
        divisions: {
          'CONTEST_#1': { division: 'Division 4', avg_difficulty: 13.8 },
          'CONTEST_#2': { division: 'Division 3', avg_difficulty: 16.4 },
          'CONTEST_#3': { division: 'Division 4', avg_difficulty: 15.0 },
          'CONTEST_#4': { division: 'Division 3', avg_difficulty: 16.4 },
          'CONTEST_#5': { division: 'Division 4', avg_difficulty: 14.0 }
        }
      }
    },
    'EGOI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230715',
        divisions: {
          'contest': { division: 'Division 3', avg_difficulty: 17.625 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240721',
        divisions: {
          'contest': { division: 'Division 3', avg_difficulty: 19.375 }
        }
      }
    },
    'EJOI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230908',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 21.833333333333332 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240817',
        divisions: {
          'contest': { division: 'Division 3', avg_difficulty: 20.166666666666668 }
        }
      }
    },
    'IATI': {
      '2024': { 
        subdivisions: ['junior', 'senior'], 
        date: '20240417',
        divisions: {
          'junior': { division: 'Division 3', avg_difficulty: 19.666666666666668 },
          'senior': { division: 'Division 1', avg_difficulty: 24.4 }
        }
      }
    },
    'IOI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230828',
        divisions: {
          'contest': { division: 'Division 1', avg_difficulty: 25.333333333333332 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240901',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 20.333333333333332 }
        }
      }
    },
    'JOI': {
      '2023': { 
        subdivisions: ['JOI', 'JOI_open', 'JOI_spring'], 
        date: '20230309',
        divisions: {
          'JOI': { division: 'Division 3', avg_difficulty: 19.8 },
          'JOI_open': { division: 'Division 1', avg_difficulty: 23.0 },
          'JOI_spring': { division: 'Division 1', avg_difficulty: 22.5 }
        }
      },
      '2024': { 
        subdivisions: ['JOI', 'JOI_open', 'JOI_spring'], 
        date: '20240716',
        divisions: {
          'JOI': { division: 'Division 3', avg_difficulty: 20.0 },
          'JOI_open': { division: 'Division 2', avg_difficulty: 22.0 },
          'JOI_spring': { division: 'Division 2', avg_difficulty: 22.083333333333332 }
        }
      },
      '2025': { 
        subdivisions: ['JOI'], 
        date: '20250321',
        divisions: {
          'JOI': { division: 'Division 3', avg_difficulty: 18.8 }
        }
      }
    },
    'NOINordic': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20230305',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 20.333333333333332 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20240306',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 22.333333333333332 }
        }
      },
      '2025': { 
        subdivisions: ['contest'], 
        date: '20250305',
        divisions: {
          'contest': { division: 'Division 1', avg_difficulty: 23.0 }
        }
      }
    },
    'OOI': {
      '2023': { 
        subdivisions: ['final', 'qualification'], 
        date: '20230828',
        divisions: {
          'final': { division: 'Division 1', avg_difficulty: 24.125 },
          'qualification': { division: 'Division 1', avg_difficulty: 24.0 }
        }
      },
      '2024': { 
        subdivisions: ['final', 'qualification'], 
        date: '20240801',
        divisions: {
          'final': { division: 'Division 2', avg_difficulty: 20.5 },
          'qualification': { division: 'Division 1', avg_difficulty: 23.444444444444443 }
        }
      }
    },
    'RMI': {
      '2023': { 
        subdivisions: ['contest'], 
        date: '20231014',
        divisions: {
          'contest': { division: 'Division 1', avg_difficulty: 24.0 }
        }
      },
      '2024': { 
        subdivisions: ['contest'], 
        date: '20241127',
        divisions: {
          'contest': { division: 'Division 2', avg_difficulty: 22.0 }
        }
      }
    },
    'USACO': {
      '2023': { 
        subdivisions: ['December_Contest', 'January_Contest', 'February_Contest', 'US_Open_Contest'], 
        date: '20230201',
        divisions: {
          'December_Contest-combined': { division: 'Division 4', avg_difficulty: 15.444444444444445 },
          'December_Contest-platinum': { division: 'Division 1', avg_difficulty: 23.333333333333332 },
          'January_Contest-combined': { division: 'Division 4', avg_difficulty: 14.777777777777779 },
          'January_Contest-platinum': { division: 'Division 2', avg_difficulty: 21.666666666666668 },
          'February_Contest-combined': { division: 'Division 4', avg_difficulty: 14.11111111111111 },
          'February_Contest-platinum': { division: 'Division 2', avg_difficulty: 22.333333333333332 },
          'US_Open_Contest-combined': { division: 'Division 3', avg_difficulty: 17.88888888888889 },
          'US_Open_Contest-platinum': { division: 'Division 1', avg_difficulty: 24.666666666666668 }
        }
      },
      '2024': { 
        subdivisions: ['December_Contest', 'January_Contest', 'February_Contest', 'US_Open_Contest'], 
        date: '20240201',
        divisions: {
          'December_Contest-combined': { division: 'Division 4', avg_difficulty: 15.333333333333334 },
          'December_Contest-platinum': { division: 'Division 1', avg_difficulty: 23.666666666666668 },
          'January_Contest-combined': { division: 'Division 3', avg_difficulty: 16.0 },
          'January_Contest-platinum': { division: 'Division 1', avg_difficulty: 22.666666666666668 },
          'February_Contest-combined': { division: 'Division 4', avg_difficulty: 15.222222222222221 },
          'February_Contest-platinum': { division: 'Division 1', avg_difficulty: 22.666666666666668 },
          'US_Open_Contest-combined': { division: 'Division 3', avg_difficulty: 17.22222222222222 },
          'US_Open_Contest-platinum': { division: 'Division 2', avg_difficulty: 21.0 }
        }
      },
      '2025': { 
        subdivisions: ['January_Contest', 'February_Contest', 'US_Open_Contest'], 
        date: '20250201',
        divisions: {
          'January_Contest-combined': { division: 'Division 4', avg_difficulty: 15.777777777777779 },
          'January_Contest-platinum': { division: 'Division 2', avg_difficulty: 22.333333333333332 },
          'February_Contest-combined': { division: 'Division 3', avg_difficulty: 16.0 },
          'February_Contest-platinum': { division: 'Division 1', avg_difficulty: 22.666666666666668 },
          'US_Open_Contest-combined': { division: 'Division 4', avg_difficulty: 15.0 },
          'US_Open_Contest-platinum': { division: 'Division 2', avg_difficulty: 21.0 }
        }
      }
    }
  };
  
  // Full names for competitions
  const COMPETITION_FULL_NAMES = {
    'APIO': 'Asia-Pacific Informatics Olympiad',
    'BOI': 'Baltic Olympiad in Informatics',
    'CCO': 'Canadian Computing Olympiad',
    'CEOI': 'Central European Olympiad in Informatics',
    'COCI': 'Croatian Open Competition in Informatics',
    'EGOI': 'European Girls\' Olympiad in Informatics',
    'EJOI': 'European Junior Olympiad in Informatics',
    'IATI': 'International Algorithmic Thinking Initiative',
    'IOI': 'International Olympiad in Informatics',
    'JOI': 'Japanese Olympiad in Informatics',
    'NOINordic': 'Nordic Olympiad in Informatics',
    'OOI': 'Oceania Olympiad in Informatics',
    'RMI': 'Romanian Master of Informatics',
    'USACO': 'USA Computing Olympiad'
  };
  
  // Division information
  const DIVISION_INFO = {
    "Division 1": {
      min_difficulty: 22.5,
      max_difficulty: 25.333333333333332,
      avg_difficulty: 23.61867283950617
    },
    "Division 2": {
      min_difficulty: 20.333333333333332,
      max_difficulty: 22.333333333333332,
      avg_difficulty: 21.5219298245614
    },
    "Division 3": {
      min_difficulty: 16.0,
      max_difficulty: 20.333333333333332,
      avg_difficulty: 18.046198830409356
    },
    "Division 4": {
      min_difficulty: 5.0,
      max_difficulty: 15.777777777777779,
      avg_difficulty: 13.76140350877193
    }
  };
  
  // Problem difficulty thresholds
  const PROBLEM_THRESHOLDS = {
    easy_max: 17,
    medium_max: 22
  };
  
  // Helper function to get subdivisions for a specific competition and year
  function getCompetitionSubdivisions(competition, year) {
    return COMPETITION_CONFIG[competition]?.[year]?.subdivisions || [];
  }
  
  // Helper function to get release date for a specific competition and year
  function getCompetitionDate(competition, year) {
    const dateStr = COMPETITION_CONFIG[competition]?.[year]?.date;
    if (!dateStr) return null;
    
    // Convert YYYYMMDD to Date object
    const year_num = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year_num, month, day);
  }
  
  // Helper function to get all competition dates
  function getAllCompetitionDates() {
    const dates = {};
    Object.keys(COMPETITION_CONFIG).forEach(competition => {
      Object.keys(COMPETITION_CONFIG[competition]).forEach(year => {
        const key = `${competition}_${year}`;
        dates[key] = getCompetitionDate(competition, year);
      });
    });
    return dates;
  }
  
  // Helper function to get division information for a specific competition, year, and subdivision
  function getCompetitionDivision(competition, year, subdivision) {
    return COMPETITION_CONFIG[competition]?.[year]?.divisions?.[subdivision] || null;
  }
  
  // Helper function to get the highest division (most challenging) for a competition and year
  function getHighestDivision(competition, year) {
    const divisions = COMPETITION_CONFIG[competition]?.[year]?.divisions;
    if (!divisions) return null;
    
    let highestDivision = 4;
    let highestDifficultyInfo = null;
    
    Object.values(divisions).forEach(divInfo => {
      const divNum = parseInt(divInfo.division.match(/Division (\d)/)?.[1]);
      if (divNum && divNum < highestDivision) {
        highestDivision = divNum;
        highestDifficultyInfo = divInfo;
      }
    });
    
    return highestDifficultyInfo;
  }
  
  // Helper function to get all divisions for a competition and year
  function getAllDivisions(competition, year) {
    return COMPETITION_CONFIG[competition]?.[year]?.divisions || {};
  }
  
  // Helper function to get division boundaries
  function getDivisionBoundaries(division) {
    return DIVISION_INFO[division] || null;
  }
  
  // Helper function to get problem difficulty category
  function getProblemDifficultyCategory(difficulty) {
    if (difficulty <= PROBLEM_THRESHOLDS.easy_max) return 'easy';
    if (difficulty <= PROBLEM_THRESHOLDS.medium_max) return 'medium';
    return 'hard';
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
      COMPETITION_CONFIG,
      COMPETITION_FULL_NAMES,
      DIVISION_INFO,
      PROBLEM_THRESHOLDS,
      getCompetitionSubdivisions, 
      getCompetitionDate,
      getAllCompetitionDates,
      getCompetitionDivision,
      getHighestDivision,
      getAllDivisions,
      getDivisionBoundaries,
      getProblemDifficultyCategory
    };
  } 