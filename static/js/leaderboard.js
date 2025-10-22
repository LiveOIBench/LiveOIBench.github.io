// List of all competitions
const competitions = [
    'APIO', 'BOI', 'CCO', 'CEOI', 'COCI', 'EGOI', 
    'EJOI', 'IATI', 'IOI', 'JOI', 'NOINordic', 'OOI', 'RMI', 'USACO'
  ];
  
  // Global state
  let competitionData = {};
  let competitionDates = {};
  let selectedCompetitions = new Set(competitions); // Start with all selected
  let selectedDivisions = new Set(['1', '2', '3', '4']); // Start with all divisions selected
  let selectedDateRange = { start: new Date('2023-01-01'), end: new Date(2025, 11, 31, 23, 59, 59, 999) };
  let problemCounts = {};
  let contestCounts = {}; // Dictionary to store competition-year to contest count mapping
  let competitionDivisions = {}; // Dictionary to store competition-year to division mapping
  let competitionMedals = {}; // New container for medal counts
  let modelRelativeScore = new Map(); // Map of model name to competition+year scores
  let modelHumanPercentile = new Map(); // Map of model name to competition+year human percentiles
  let modelPassRate = new Map(); // Map of model name to competition+year pass rates
  let modelMedals = new Map(); // Map of model name to competition+year medals
  
  // Reference date for slider calculations (month-based)
  const START_YEAR = 2023;
  const START_MONTH = 1; // January
  // Dynamically calculate END_YEAR and END_MONTH as current month
  const now = new Date();
  const END_YEAR = now.getFullYear();
  const END_MONTH = now.getMonth() + 1; // getMonth() is 0-indexed
  const TOTAL_MONTHS = (END_YEAR - START_YEAR) * 12 + (END_MONTH - START_MONTH); // inclusive of current month
  
  // Move updateDateDisplay to top-level scope
  let startSlider, endSlider, display, sliderContainer;
  
  // Add flag at the top with other variables
  let isInitializing = false;
  let isUpdatingTable = false; // Flag to prevent multiple simultaneous table updates
  
  // Combined function to update both date display and table
  async function updateDateAndTable() {
    updateDateDisplay();
    await updateTable();
  }
  
  function updateDateDisplay() {
    const startMonths = parseInt(startSlider.value);
    const endMonths = parseInt(endSlider.value);
    // Ensure start is not greater than end
    if (startMonths > endMonths) {
      if (startSlider === event.target) {
        endSlider.value = startSlider.value;
      } else {
        startSlider.value = endSlider.value;
      }
      // Continue with the rest of the function after adjusting the slider
    }
    const startDate = monthsToDate(startMonths);
    const endDate = monthsToEndDate(endMonths);
    selectedDateRange.start = startDate;
    selectedDateRange.end = endDate;
    // Get the number of problems in the current time window
    const filteredCompetitions = getFilteredCompetitions();
    let totalProblems = 0;
    let totalContests = 0;
    
    filteredCompetitions.forEach(compYear => {
      // Add problem count
      totalProblems += problemCounts[compYear] || 0;
      
      // Add contest count from loaded data
      totalContests += contestCounts[compYear] || 0;
    });
    
    // Format the date range display with the full sentence
    const formattedStartDate = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;
    if (totalProblems == 0) {
      totalContests = 0;
    }
    display.textContent = `${totalProblems} problems and ${totalContests} contests selected in the current time window (${formattedStartDate} to ${formattedEndDate}). You can adjust the start or end date to change the time window.`;
    // Update the track styling
    const maxValue = parseInt(startSlider.max);
    const startPercent = (startMonths / maxValue) * 100;
    const endPercent = (endMonths / maxValue) * 100;
    sliderContainer.style.setProperty('--start-percent', startPercent);
    sliderContainer.style.setProperty('--end-percent', endPercent);
    
    // Table will be updated by the calling function
  }
  
  // Load competition dates from config
  function loadCompetitionDates() {
    competitionDates = getAllCompetitionDates();
    console.log('Loaded competition dates from config');
  }
  
  // Initialize the competition tabs
  function initializeCompetitionSelection() {
    const container = document.querySelector('.competition-tabs');
    const toggleButton = document.getElementById('toggleAll');
    
    competitions.forEach(comp => {
      const tab = document.createElement('div');
      tab.className = 'competition-tab is-active';
      tab.textContent = comp;
      tab.dataset.tooltip = COMPETITION_FULL_NAMES[comp];
      
      tab.addEventListener('click', async () => {
        if (tab.classList.contains('is-active')) {
          selectedCompetitions.delete(comp);
          tab.classList.remove('is-active');
        } else {
          selectedCompetitions.add(comp);
          tab.classList.add('is-active');
        }
        updateToggleButton();
        // Update statistics box when selection changes
        const filteredCompetitions = getFilteredCompetitions();
        let totalQuestions = 0;
        filteredCompetitions.forEach(compYear => {
          totalQuestions += problemCounts[compYear] || 0;
        });
        updateStatisticsBox(totalQuestions);
        updateDateDisplay();
        await updateTable(); // Update table after selection changes
      });
      
      container.appendChild(tab);
    });
  
    // Add event listener for toggle button
    toggleButton.addEventListener('click', async () => {
      const isSelectingAll = selectedCompetitions.size < competitions.length;
      const tabs = document.querySelectorAll('.competition-tab');
      
      if (isSelectingAll) {
        // Select all
        tabs.forEach(tab => tab.classList.add('is-active'));
        selectedCompetitions = new Set(competitions);
        toggleButton.textContent = 'Deselect All';
      } else {
        // Deselect all
        tabs.forEach(tab => tab.classList.remove('is-active'));
        selectedCompetitions.clear();
        toggleButton.textContent = 'Select All';
      }
      
      // Update statistics box when selection changes
      const filteredCompetitions = getFilteredCompetitions();
      let totalQuestions = 0;
      filteredCompetitions.forEach(compYear => {
        totalQuestions += problemCounts[compYear] || 0;
      });
      updateStatisticsBox(totalQuestions);
      updateDateDisplay();
      await updateTable(); // Update table after selection changes
    });
  
    // Initialize toggle button text
    updateToggleButton();
  }
  
  // Initialize date range slider
  function initializeDateRangeSlider() {
    startSlider = document.getElementById('startDateSlider');
    endSlider = document.getElementById('endDateSlider');
    display = document.getElementById('dateRangeDisplay');
    sliderContainer = document.querySelector('.date-range-slider');
    
    // Set slider max and default values based on current month
    startSlider.max = TOTAL_MONTHS;
    endSlider.max = TOTAL_MONTHS;
    endSlider.value = TOTAL_MONTHS;
    
    startSlider.addEventListener('input', async () => {
      await updateDateAndTable();
    });
    endSlider.addEventListener('input', async () => {
      await updateDateAndTable();
    });
    updateDateDisplay();
  }
  
  // Convert months since start to Date object (first day of month)
  function monthsToDate(months) {
    const year = START_YEAR + Math.floor(months / 12);
    const month = START_MONTH + (months % 12);
    return new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
  }
  
  // Convert months since start to end of month Date object (for end date)
  function monthsToEndDate(months) {
    const year = START_YEAR + Math.floor(months / 12);
    const month = START_MONTH + (months % 12);
    // If it's the current month, use today's date as the end
    if (year === END_YEAR && month === END_MONTH) {
      return new Date(year, month - 1, now.getDate(), 23, 59, 59, 999);
    }
    // Get last day of month by going to first day of next month and subtracting 1 day
    return new Date(year, month, 0, 23, 59, 59, 999);
  }
  
  // Format date for display (YYYY-MM)
  function formatDateDisplay(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  
  // Update the toggle button text based on current selection state
  function updateToggleButton() {
    const toggleButton = document.getElementById('toggleAll');
    const allSelected = selectedCompetitions.size === competitions.length;
    toggleButton.textContent = allSelected ? 'Deselect All' : 'Select All';
  }
  
  
  // Update statistics box
  function updateStatisticsBox(totalQuestions) {
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
      totalQuestionsElement.textContent = totalQuestions;
    }
  }
  
  
  // Get filtered competitions based on time range, selected competitions, and divisions
  function getFilteredCompetitions() {
    // Get competitions selected by user and within time range
    const competitionsInTimeRange = new Set();
    Object.entries(competitionDates).forEach(([compYear, date]) => {
      const [competition, _] = compYear.split('_');
      if (date >= selectedDateRange.start && 
          date <= selectedDateRange.end && 
          selectedCompetitions.has(competition)) {
        competitionsInTimeRange.add(compYear);
      }
    });
  
    // If no divisions are selected, return empty set
    if (selectedDivisions.size === 0) {
      return new Set();
    }
  
    // Get competitions that match selected divisions
    const competitionsInDivisions = new Set();
    Object.entries(competitionDivisions).forEach(([compYear, division]) => {
      if (selectedDivisions.has(division.toString())) {
        competitionsInDivisions.add(compYear);
      }
    });
  
    // Return competitions that match both filters
    return new Set([...competitionsInTimeRange].filter(compYear => 
      competitionsInDivisions.has(compYear)
    ));
  }
  
  
  // Add sorting state variables
  let currentSortColumn = 'passRate'; // Default sort by pass rate
  let isAscending = false; // Default descending order
  
  // Update the table with current selection
  async function updateTable() {
    // Prevent multiple simultaneous table updates
    if (isUpdatingTable) {
      return;
    }
    isUpdatingTable = true;
    
    try {
      const table = document.getElementById('rankingTable');
      
      // Clear the entire table body completely
      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '';
      }
    
    const thead = table.querySelector('thead tr');
    thead.innerHTML = `
      <th style="width: 30px"></th>
      <th style="width: 60px">Rank</th>
      <th>Model</th>
      <th class="sortable" data-sort="gold" style="min-width: 80px">
        Gold 🥇
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'gold' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'gold' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="silver" style="min-width: 80px">
        Silver 🥈
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'silver' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'silver' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="bronze" style="min-width: 80px">
        Bronze 🥉
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'bronze' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'bronze' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="totalMedals" style="min-width: 70px">
        Total
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'totalMedals' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'totalMedals' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="passRate" style="min-width: 100px">
        Pass Rate 
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'passRate' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'passRate' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="avgRelativeScore" style="min-width: 120px">
        Relative Score
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'avgRelativeScore' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'avgRelativeScore' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
      <th class="sortable" data-sort="avgHumanPercentile" style="min-width: 120px">
        Human Percentile
        <span class="sort-indicators">
          <span class="sort-up ${currentSortColumn === 'avgHumanPercentile' && isAscending ? 'active' : ''}"><i class="fas fa-caret-up"></i></span>
          <span class="sort-down ${currentSortColumn === 'avgHumanPercentile' && !isAscending ? 'active' : ''}"><i class="fas fa-caret-down"></i></span>
        </span>
      </th>
    `;
  
    // Add click handler for sortable columns
    thead.querySelectorAll('.sortable').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (currentSortColumn === column) {
          isAscending = !isAscending;
        } else {
          currentSortColumn = column;
          isAscending = false;
        }
        updateTable();
      });
    });
  
    // Get filtered competitions based on time range and divisions
    const filteredCompetitions = getFilteredCompetitions();
    
    // Update statistics box
    let totalQuestions = 0;
    filteredCompetitions.forEach(compYear => {
      totalQuestions += problemCounts[compYear] || 0;
    });
    updateStatisticsBox(totalQuestions);
    
    // Get all unique models from the contest data
    const allModels = new Set();
    for (const [model, _] of modelPassRate) {
      if (isModelAllowed(model)) {
        allModels.add(model);
      }
    }
    
    // Create maps to store all metrics for each model
    const modelMedalCounts = new Map();
    const modelAvgScores = new Map();
    const modelAvgPercentiles = new Map();
    const modelAvgPassRates = new Map();
    
    // Calculate all metrics for each model in one consolidated loop
    for (const model of allModels) {
      // Initialize medal counts
      modelMedalCounts.set(model, { gold: 0, silver: 0, bronze: 0 });
      
      // Initialize metric totals
      let totalPassRate = 0;
      let passRateCount = 0;
      let totalScore = 0;
      let scoreCount = 0;
      let totalPercentile = 0;
      let percentileCount = 0;
      
      // Process each filtered competition
      for (const compYear of filteredCompetitions) {
        const [comp, year] = compYear.split('_');
        const compKey = `${comp}-${year}`;
        
        // Calculate pass rate
        if (modelPassRate.has(model) && modelPassRate.get(model).has(compKey)) {
          const passRateData = modelPassRate.get(model).get(compKey);
          if (Array.isArray(passRateData)) {
            // Treat each subdivision independently
            for (const rate of passRateData) {
              totalPassRate += rate;
              passRateCount++;
            }
          } else {
            totalPassRate += passRateData;
            passRateCount++;
          }
        }
        
        // Calculate relative score
        if (modelRelativeScore.has(model) && modelRelativeScore.get(model).has(compKey)) {
          const scoreData = modelRelativeScore.get(model).get(compKey);
          if (Array.isArray(scoreData)) {
            // Treat each subdivision independently
            for (const score of scoreData) {
              totalScore += score;
              scoreCount++;
            }
          } else {
            totalScore += scoreData;
            scoreCount++;
          }
        }
        
        // Calculate human percentile
        if (modelHumanPercentile.has(model) && modelHumanPercentile.get(model).has(compKey)) {
          const percentileData = modelHumanPercentile.get(model).get(compKey);
          if (Array.isArray(percentileData)) {
            // Treat each subdivision independently
            for (const percentile of percentileData) {
              totalPercentile += percentile;
              percentileCount++;
            }
          } else {
            totalPercentile += percentileData;
            percentileCount++;
          }
        }
        
        // Aggregate medals
        if (modelMedals.has(model) && modelMedals.get(model).has(compKey)) {
          const medals = modelMedals.get(model).get(compKey);
          const counts = modelMedalCounts.get(model);
          for (const medal of medals) {
            if (medal === 'Gold') {
              counts.gold++;
            } else if (medal === 'Silver') {
              counts.silver++;
            } else if (medal === 'Bronze') {
              counts.bronze++;
            }
          }
        }
      }
      
      // Store calculated averages
      if (passRateCount > 0) {
        modelAvgPassRates.set(model, totalPassRate / passRateCount);
      }
      if (scoreCount > 0) {
        modelAvgScores.set(model, totalScore / scoreCount);
      }
      if (percentileCount > 0) {
        modelAvgPercentiles.set(model, totalPercentile / percentileCount);
      }
    }
  
    // Combine all metrics and medals data
    const combinedData = Array.from(allModels).map(model => {
      const medals = modelMedalCounts.get(model) || { gold: 0, silver: 0, bronze: 0 };
      const avgPassRate = modelAvgPassRates.get(model) || 0;
      const avgRelativeScore = modelAvgScores.get(model) || 0;
      const avgHumanPercentile = modelAvgPercentiles.get(model) || 0;
      return {
        model: model,
        passRate: avgPassRate.toFixed(2),
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze,
        totalMedals: medals.gold + medals.silver + medals.bronze,
        avgRelativeScore: avgRelativeScore.toFixed(2),
        avgHumanPercentile: avgHumanPercentile.toFixed(2)
      };
    });
  
    // Sort models based on selected column
    const sortedModels = combinedData.sort((a, b) => {
      const valueA = parseFloat(a[currentSortColumn]) || a[currentSortColumn];
      const valueB = parseFloat(b[currentSortColumn]) || b[currentSortColumn];
      return isAscending ? valueA - valueB : valueB - valueA;
    });
  
    // Create table rows
    sortedModels.forEach((entry, index) => {
      const tr = document.createElement('tr');
      
      // Medal Icon (leftmost column)
      const medalCell = document.createElement('td');
      medalCell.innerHTML = '';
      tr.appendChild(medalCell);
  
      // Rank
      const rankCell = document.createElement('td');
      rankCell.textContent = index + 1;
      tr.appendChild(rankCell);
        
      // Model name with link
      const modelCell = document.createElement('td');
      const modelLink = document.createElement('a');
      modelLink.href = `model_detail.html?model=${encodeURIComponent(entry.model)}`;
      modelLink.textContent = entry.model;
      modelLink.target = '_blank'; // Open in new tab
      modelCell.appendChild(modelLink);
      tr.appendChild(modelCell);
        
      // Medal counts
      const goldCell = document.createElement('td');
      goldCell.textContent = entry.gold;
      goldCell.style.textAlign = 'center';
      tr.appendChild(goldCell);
  
      const silverCell = document.createElement('td');
      silverCell.textContent = entry.silver;
      silverCell.style.textAlign = 'center';
      tr.appendChild(silverCell);
  
      const bronzeCell = document.createElement('td');
      bronzeCell.textContent = entry.bronze;
      bronzeCell.style.textAlign = 'center';
      tr.appendChild(bronzeCell);
  
      // Total medals
      const totalMedalsCell = document.createElement('td');
      totalMedalsCell.textContent = entry.totalMedals;
      totalMedalsCell.style.textAlign = 'center';
      tr.appendChild(totalMedalsCell);
  
      // Pass rate
      const passRateCell = document.createElement('td');
      passRateCell.textContent = entry.passRate + '%';
      tr.appendChild(passRateCell);
  
      // Average relative score
      const avgRelativeScoreCell = document.createElement('td');
      avgRelativeScoreCell.textContent = entry.avgRelativeScore + '%';
      avgRelativeScoreCell.style.textAlign = 'center';
      tr.appendChild(avgRelativeScoreCell);
  
      // Average human percentile
      const avgHumanPercentileCell = document.createElement('td');
      avgHumanPercentileCell.textContent = entry.avgHumanPercentile + '%';
      avgHumanPercentileCell.style.textAlign = 'center';
      tr.appendChild(avgHumanPercentileCell);
        
      tbody.appendChild(tr);
    });
    } finally {
      isUpdatingTable = false;
    }
  }
  
  // Update division scope display
  function updateDivisionScope() {
    const scopeContent = document.getElementById('division-scope-content');
    if (!scopeContent) return;
  
    // Group competitions by division
    const divisionGroups = {};
    Object.entries(competitionDivisions).forEach(([compYear, division]) => {
      if (!divisionGroups[division]) {
        divisionGroups[division] = new Set();
      }
      divisionGroups[division].add(compYear);
    });
  
    // Create HTML for each division
    let html = '';
    for (let i = 1; i <= 4; i++) {
      const division = i.toString(); // Use just the number as the key
      const competitions = divisionGroups[division] || new Set();
      
      html += `<p><strong>Division ${i}:</strong> `;
      if (competitions.size > 0) {
        html += Array.from(competitions)
          .map(compYear => {
            const [comp, year] = compYear.split('_');
            return `${comp} ${year}`;
          })
          .sort()
          .join(', ');
      } else {
        html += 'No competitions';
      }
      html += '</p>';
    }
  
    scopeContent.innerHTML = html;
  }
  
  // Initialize everything
  async function initialize() {
    try {
      isInitializing = true;  // Set flag
      
      // Show loading state immediately
      const tbody = document.querySelector('#rankingTable tbody');
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 20px;">
            Loading leaderboard data...
          </td>
        </tr>
      `;
  
      // Load all data in parallel
      await Promise.all([
        loadCompetitionDates(),
        loadProblemCounts(),
        loadContestCounts(),
        loadModelScore()
      ]);
  
      // Get competition divisions while data is loading
      competitionDivisions = getCompetitionDivisionMap();
      
      // Initialize UI elements in parallel
      await Promise.all([
        initializeCompetitionSelection(),
        initializeDivisionSelection(),
        initializeDateRangeSlider()
      ]);
  
      updateDivisionScope();
      updateDateDisplay();
      
      isInitializing = false;  // Clear flag
      
      // Finally update the leaderboard
      await updateTable();
    } catch (error) {
      console.error('Error initializing:', error);
      // Show error state
      const tbody = document.querySelector('#rankingTable tbody');
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 20px; color: red;">
            Error loading leaderboard data. Please refresh the page to try again.
          </td>
        </tr>
      `;
    }
  }
  
  initialize();  
  
  // Create competition tabs
  function createCompetitionTabs() {
    const tabsContainer = document.querySelector('.competition-tabs');
    tabsContainer.innerHTML = '';
    
    Object.keys(COMPETITION_CONFIG).forEach(competition => {
      const tab = document.createElement('div');
      tab.className = 'competition-tab';
      tab.dataset.competition = competition;
      tab.title = COMPETITION_FULL_NAMES[competition]; // Add tooltip with full name
      
      const years = Object.keys(COMPETITION_CONFIG[competition]);
      const yearRange = years.length > 1 ? `${years[0]}-${years[years.length-1]}` : years[0];
      tab.textContent = `${competition} (${yearRange})`;
      
      tab.addEventListener('click', () => toggleCompetition(competition));
      tabsContainer.appendChild(tab);
    });
  }
  
  // Add this function to load problem counts
  async function loadProblemCounts() {
    try {
      const response = await fetch('static/data/problem_counts.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [contestYear, count] = lines[i].split(',');
        problemCounts[contestYear] = parseInt(count);
      }
    } catch (error) {
      console.error('Failed to load problem counts:', error);
    }
  }
  
  // Add this function to load contest counts
  async function loadContestCounts() {
    try {
      const response = await fetch('static/data/contest_counts.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [contestYear, count] = lines[i].split(',');
        contestCounts[contestYear] = parseInt(count);
      }
    } catch (error) {
      console.error('Failed to load contest counts:', error);
    }
  }
  
  // Initialize division selection
  function initializeDivisionSelection() {
    const container = document.querySelector('.division-tabs');
    
    // Add click handlers to division tabs
    container.querySelectorAll('.division-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        const division = tab.dataset.division;
        if (tab.classList.contains('is-active')) {
          selectedDivisions.delete(division);
          tab.classList.remove('is-active');
        } else {
          selectedDivisions.add(division);
          tab.classList.add('is-active');
        }
        
        // Recalculate metrics and update display
        // Update statistics box when division selection changes
        const filteredCompetitions = getFilteredCompetitions();
        let totalQuestions = 0;
        filteredCompetitions.forEach(compYear => {
          totalQuestions += problemCounts[compYear] || 0;
        });
        updateStatisticsBox(totalQuestions);
        updateDateDisplay();
        await updateTable(); // Update table after selection changes
      });
    });
  }
  
  // Get competition division mapping
  function getCompetitionDivisionMap() {
    const divisionMap = {};
    
    // Iterate through each competition in COMPETITION_CONFIG
    for (const [competition, years] of Object.entries(COMPETITION_CONFIG)) {
      // For each year of this competition
      for (const [year, data] of Object.entries(years)) {
        const key = `${competition}_${year}`;
        let divisionSum = 0;
        let divisionCount = 0;
        
        // Skip if no subdivisions
        if (!data || !data.subdivisions) continue;
        
        // Go through each subdivision and collect division numbers
        for (const subdivision of data.subdivisions) {
          // Special handling for USACO
          if (competition === 'USACO') {
            const combinedKey = `${subdivision}-combined`;
            if (data.divisions && data.divisions[combinedKey]) {
              const divInfo = data.divisions[combinedKey];
              if (divInfo && divInfo.division) {
                const match = divInfo.division.match(/Division (\d)/);
                if (match) {
                  divisionSum += parseInt(match[1]);
                  divisionCount++;
                }
              }
            }
          } else {
            // Original logic for other competitions
            if (!data.divisions || !data.divisions[subdivision]) continue;
            
            const divInfo = data.divisions[subdivision];
            if (divInfo && divInfo.division) {
              const match = divInfo.division.match(/Division (\d)/);
              if (match) {
                divisionSum += parseInt(match[1]);
                divisionCount++;
              }
            }
          }
        }
        
        // Calculate average division if we found any divisions
        if (divisionCount > 0) {
          const avgDivision = Math.round(divisionSum / divisionCount);
          divisionMap[key] = avgDivision;
        }
      }
    }
    
    return divisionMap;
  }
  
  // ... rest of the existing code ...  
  
  function toggleAll() {
    const allCompetitions = Array.from(selectedCompetitions);
    const allSelected = allCompetitions.every(comp => selectedCompetitions.has(comp));
    
    if (allSelected) {
      // Deselect all
      selectedCompetitions.clear();
      document.querySelectorAll('.competition-tab').forEach(tab => {
        tab.classList.remove('is-active');
      });
      document.getElementById('toggleAll').textContent = 'Select All';
      document.getElementById('toggleAll').classList.remove('deselect');
    } else {
      // Select all
      allCompetitions.forEach(comp => selectedCompetitions.add(comp));
      document.querySelectorAll('.competition-tab').forEach(tab => {
        tab.classList.add('is-active');
      });
      document.getElementById('toggleAll').textContent = 'Deselect All';
      document.getElementById('toggleAll').classList.add('deselect');
    }
    
    updateLeaderboard();
  }
  
  // Add this function to update button state when competition tabs change
  function updateToggleAllButtonState() {
    const allCompetitions = Array.from(selectedCompetitions);
    const allSelected = allCompetitions.every(comp => selectedCompetitions.has(comp));
    const button = document.getElementById('toggleAll');
    
    if (allSelected) {
      button.textContent = 'Deselect All';
      button.classList.add('deselect');
    } else {
      button.textContent = 'Select All';
      button.classList.remove('deselect');
    }
  }
  
  // Update the competition tab click handler to call updateToggleAllButtonState
  function handleCompetitionTabClick(tab) {
    const competition = tab.getAttribute('data-competition');
    if (selectedCompetitions.has(competition)) {
      selectedCompetitions.delete(competition);
      tab.classList.remove('is-active');
    } else {
      selectedCompetitions.add(competition);
      tab.classList.add('is-active');
    }
    updateToggleAllButtonState();
    updateLeaderboard();
  }
  
  // ... rest of the existing code ...  
  
  // Structure for medal counts
  class MedalCount {
    constructor(model, gold = 0, silver = 0, bronze = 0) {
      this.model = model;
      this.gold = gold;
      this.silver = silver;
      this.bronze = bronze;
    }
  }
  
  
  // ... rest of the existing code ...  
  
  // Load all model data from contest rankings (single source of truth)
  async function loadModelScore() {
      const baseDir = 'static/data/model_rankings/contests';
      
      // Helper function to extract competition and year from filename
      function extractCompetitionYear(filename) {
          // Match competition and year at the start of filename
          const match = filename.match(/^([A-Za-z]+)-(\d{4})-/);
          return match ? { competition: match[1], year: match[2] } : null;
      }
      
      // Helper function to process a single CSV file
      async function processCSVFile(filepath) {
          try {
              const response = await fetch(filepath);
              if (!response.ok) {
                  console.error(`Failed to fetch ${filepath}: ${response.status} ${response.statusText}`);
                  return null;
              }
              
              const text = await response.text();
              const rows = text.trim().split('\n');
              if (rows.length < 2) return null;
              
              const headers = rows[0].split(',');
              const modelIdx = headers.indexOf('Model');
              const passRateIdx = headers.indexOf('Pass Rate (%)');
              const medalIdx = headers.indexOf('Medal');
              const scoreIdx = headers.indexOf('Relative Score (%)');
              const percentileIdx = headers.indexOf('Human Percentile');
              
              if (modelIdx === -1 || scoreIdx === -1) {
                  console.error(`Required columns not found in ${filepath}`);
                  return null;
              }
              
              const scores = new Map();
              const percentiles = new Map();
              const passRates = new Map();
              const medals = new Map();
              
              for (let i = 1; i < rows.length; i++) {
                  const cells = rows[i].split(',');
                  const model = cells[modelIdx].trim();
                  const score = parseFloat(cells[scoreIdx]) || 0;
                  const percentile = percentileIdx !== -1 ? parseFloat(cells[percentileIdx]) || 0 : 0;
                  const passRate = passRateIdx !== -1 ? parseFloat(cells[passRateIdx]) || 0 : 0;
                  const medal = medalIdx !== -1 ? cells[medalIdx].trim() : 'None';
                  
                  scores.set(model, score);
                  percentiles.set(model, percentile);
                  passRates.set(model, passRate);
                  medals.set(model, medal);
              }
              return { scores, percentiles, passRates, medals };
          } catch (error) {
              console.error(`Error processing ${filepath}:`, error);
              return null;
          }
      }
      
      try {
          // Get list of files from index.json instead of directory listing
          const indexResponse = await fetch(`${baseDir}/index.json`);
          if (!indexResponse.ok) {
              console.error('Failed to fetch index.json');
              return;
          }
          
          const { files } = await indexResponse.json();
          
          // Process all CSV files in parallel
          const processPromises = files.map(async file => {
              const info = extractCompetitionYear(file);
              if (!info) return null;

              const { competition, year } = info;
              const compKey = `${competition}-${year}`;
              
              const result = await processCSVFile(`${baseDir}/${encodeURIComponent(file)}`);
              if (!result) return null;
              
              return { compKey, result };
          });

          const results = await Promise.all(processPromises);
          
          // Process results and update maps
          results.forEach(item => {
              if (!item) return;
              const { compKey, result } = item;
              
              // Update modelRelativeScore map
              for (const [model, score] of result.scores) {
                  if (!modelRelativeScore.has(model)) {
                      modelRelativeScore.set(model, new Map());
                  }
                  const modelScores = modelRelativeScore.get(model);
                  
                  // If we already have a score for this competition+year, store as array for proper averaging
                  if (modelScores.has(compKey)) {
                      const existingData = modelScores.get(compKey);
                      if (Array.isArray(existingData)) {
                          existingData.push(score);
                      } else {
                          modelScores.set(compKey, [existingData, score]);
                      }
                  } else {
                      modelScores.set(compKey, score);
                  }
              }

              // Update modelHumanPercentile map
              for (const [model, percentile] of result.percentiles) {
                  if (!modelHumanPercentile.has(model)) {
                      modelHumanPercentile.set(model, new Map());
                  }
                  const modelPercentiles = modelHumanPercentile.get(model);
                  
                  // If we already have a percentile for this competition+year, store as array for proper averaging
                  if (modelPercentiles.has(compKey)) {
                      const existingData = modelPercentiles.get(compKey);
                      if (Array.isArray(existingData)) {
                          existingData.push(percentile);
                      } else {
                          modelPercentiles.set(compKey, [existingData, percentile]);
                      }
                  } else {
                      modelPercentiles.set(compKey, percentile);
                  }
              }

              // Update modelPassRate map (new)
              for (const [model, passRate] of result.passRates) {
                  if (!modelPassRate.has(model)) {
                      modelPassRate.set(model, new Map());
                  }
                  const modelPassRates = modelPassRate.get(model);
                  
                  // If we already have a pass rate for this competition+year, store as array for proper averaging
                  if (modelPassRates.has(compKey)) {
                      const existingData = modelPassRates.get(compKey);
                      if (Array.isArray(existingData)) {
                          existingData.push(passRate);
                      } else {
                          modelPassRates.set(compKey, [existingData, passRate]);
                      }
                  } else {
                      modelPassRates.set(compKey, passRate);
                  }
              }

              // Update modelMedals map (new)
              for (const [model, medal] of result.medals) {
                  if (!modelMedals.has(model)) {
                      modelMedals.set(model, new Map());
                  }
                  const modelMedalMap = modelMedals.get(model);
                  
                  // Accumulate medals for this competition+year
                  if (!modelMedalMap.has(compKey)) {
                      modelMedalMap.set(compKey, []);
                  }
                  modelMedalMap.get(compKey).push(medal);
              }
          });
      } catch (error) {
          console.error('Error loading model scores:', error);
      }
  }
  
  // ... rest of the existing code ...  