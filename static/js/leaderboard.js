// List of all competitions
const competitions = [
    'APIO', 'BOI', 'CCO', 'CEOI', 'COCI', 'EGOI', 
    'EJOI', 'IATI', 'IOI', 'JOI', 'NOINordic', 'OOI', 'RMI', 'USACO'
  ];
  
  // Global state
  let competitionData = {};
  let competitionDates = {};
  let selectedCompetitions = new Set(competitions); // Start with all selected
  let selectedModelCategories = new Set(['proprietary', 'open-weight-thinking', 'open-weight-non-thinking']); // Start with all categories selected
  let selectedDateRange = { start: new Date('2023-01-01'), end: new Date(2025, 11, 31, 23, 59, 59, 999) };
  let problemCounts = {};
  let contestCounts = {}; // Dictionary to store competition-year to contest count mapping
  let competitionMedals = {}; // New container for medal counts
  let modelRelativeScore = new Map(); // Map of model name to competition+year scores
  let modelHumanPercentile = new Map(); // Map of model name to competition+year human percentiles
  let modelPassRate = new Map(); // Map of model name to competition+year pass rates
  let modelMedals = new Map(); // Map of model name to competition+year medals
  let modelIncludedTasks = new Map(); // Map of model name to competition+year included tasks (for weighted averaging)
  
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
  
  
  // Get filtered competitions based on time range and selected competitions
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

    return competitionsInTimeRange;
  }
  
  
  // Add sorting state variables
  let currentSortColumn = 'gold'; // Default sort by gold medals
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
  
    // Get filtered competitions based on time range
    const filteredCompetitions = getFilteredCompetitions();
    
    // Update statistics box
    let totalQuestions = 0;
    filteredCompetitions.forEach(compYear => {
      totalQuestions += problemCounts[compYear] || 0;
    });
    updateStatisticsBox(totalQuestions);
    
    // Get all unique models from the contest data, filtered by allowed models and selected categories
    const allModels = new Set();
    for (const [model, _] of modelPassRate) {
      if (isModelAllowed(model) && isModelInCategories(model, selectedModelCategories)) {
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
      
      // Initialize weighted metric totals
      let weightedPassRateSum = 0;
      let totalPassRateWeight = 0;
      let weightedScoreSum = 0;
      let totalScoreWeight = 0;
      let weightedPercentileSum = 0;
      let totalPercentileWeight = 0;
      
      // Process each filtered competition
      for (const compYear of filteredCompetitions) {
        const [comp, year] = compYear.split('_');
        const compKey = `${comp}-${year}`;
        
        // Get included tasks for this competition (weights)
        const includedTasksData = modelIncludedTasks.has(model) && modelIncludedTasks.get(model).has(compKey)
          ? modelIncludedTasks.get(model).get(compKey)
          : null;
        
        // Calculate weighted pass rate
        if (modelPassRate.has(model) && modelPassRate.get(model).has(compKey)) {
          const passRateData = modelPassRate.get(model).get(compKey);
          const tasksData = includedTasksData;
          
          if (Array.isArray(passRateData) && Array.isArray(tasksData)) {
            // Treat each subdivision independently with weighted average
            for (let i = 0; i < passRateData.length; i++) {
              const rate = passRateData[i];
              const weight = tasksData[i];
              // Skip if rate or weight is missing/invalid (NaN, undefined, null, or weight is 0)
              if (rate != null && !isNaN(rate) && weight != null && !isNaN(weight) && weight > 0) {
                weightedPassRateSum += rate * weight;
                totalPassRateWeight += weight;
              }
            }
          } else if (!Array.isArray(passRateData) && !Array.isArray(tasksData)) {
            const rate = passRateData;
            const weight = tasksData;
            // Skip if rate or weight is missing/invalid (NaN, undefined, null, or weight is 0)
            if (rate != null && !isNaN(rate) && weight != null && !isNaN(weight) && weight > 0) {
              weightedPassRateSum += rate * weight;
              totalPassRateWeight += weight;
            }
          }
        }
        
        // Calculate weighted relative score
        if (modelRelativeScore.has(model) && modelRelativeScore.get(model).has(compKey)) {
          const scoreData = modelRelativeScore.get(model).get(compKey);
          const tasksData = includedTasksData;
          
          if (Array.isArray(scoreData) && Array.isArray(tasksData)) {
            // Treat each subdivision independently with weighted average
            for (let i = 0; i < scoreData.length; i++) {
              const score = scoreData[i];
              const weight = tasksData[i];
              // Skip if score or weight is missing/invalid (NaN, undefined, null, or weight is 0)
              if (score != null && !isNaN(score) && weight != null && !isNaN(weight) && weight > 0) {
                weightedScoreSum += score * weight;
                totalScoreWeight += weight;
              }
            }
          } else if (!Array.isArray(scoreData) && !Array.isArray(tasksData)) {
            const score = scoreData;
            const weight = tasksData;
            // Skip if score or weight is missing/invalid (NaN, undefined, null, or weight is 0)
            if (score != null && !isNaN(score) && weight != null && !isNaN(weight) && weight > 0) {
              weightedScoreSum += score * weight;
              totalScoreWeight += weight;
            }
          }
        }
        
        // Calculate weighted human percentile
        if (modelHumanPercentile.has(model) && modelHumanPercentile.get(model).has(compKey)) {
          const percentileData = modelHumanPercentile.get(model).get(compKey);
          const tasksData = includedTasksData;
          
          if (Array.isArray(percentileData) && Array.isArray(tasksData)) {
            // Treat each subdivision independently with weighted average
            for (let i = 0; i < percentileData.length; i++) {
              const percentile = percentileData[i];
              const weight = tasksData[i];
              // Skip if percentile or weight is missing/invalid (NaN, undefined, null, or weight is 0)
              if (percentile != null && !isNaN(percentile) && weight != null && !isNaN(weight) && weight > 0) {
                weightedPercentileSum += percentile * weight;
                totalPercentileWeight += weight;
              }
            }
          } else if (!Array.isArray(percentileData) && !Array.isArray(tasksData)) {
            const percentile = percentileData;
            const weight = tasksData;
            // Skip if percentile or weight is missing/invalid (NaN, undefined, null, or weight is 0)
            if (percentile != null && !isNaN(percentile) && weight != null && !isNaN(weight) && weight > 0) {
              weightedPercentileSum += percentile * weight;
              totalPercentileWeight += weight;
            }
          }
        }
        
        // Aggregate medals (unchanged - no weighting for medals)
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
      
      // Store calculated weighted averages
      if (totalPassRateWeight > 0) {
        modelAvgPassRates.set(model, weightedPassRateSum / totalPassRateWeight);
      }
      if (totalScoreWeight > 0) {
        modelAvgScores.set(model, weightedScoreSum / totalScoreWeight);
      }
      if (totalPercentileWeight > 0) {
        modelAvgPercentiles.set(model, weightedPercentileSum / totalPercentileWeight);
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
        
      // Model name (not clickable)
      const modelCell = document.createElement('td');
      modelCell.textContent = getModelDisplayName(entry.model);
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
  
      // Initialize UI elements in parallel
      await Promise.all([
        initializeCompetitionSelection(),
        initializeModelCategorySelection(),
        initializeDateRangeSlider()
      ]);

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
  
  // Initialize model category selection
  function initializeModelCategorySelection() {
    const container = document.querySelector('.model-category-tabs');
    
    if (!container) return;
    
    // Add click handlers to model category tabs
    container.querySelectorAll('.model-category-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        const category = tab.dataset.category;
        if (tab.classList.contains('is-active')) {
          selectedModelCategories.delete(category);
          tab.classList.remove('is-active');
        } else {
          selectedModelCategories.add(category);
          tab.classList.add('is-active');
        }
        
        // Update statistics box when category selection changes
        const filteredCompetitions = getFilteredCompetitions();
        let totalQuestions = 0;
        filteredCompetitions.forEach(compYear => {
          totalQuestions += problemCounts[compYear] || 0;
        });
        updateStatisticsBox(totalQuestions);
        await updateTable(); // Update table after selection changes
      });
    });
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
              const includedTasksIdx = headers.indexOf('Included Tasks');
              
              if (modelIdx === -1 || scoreIdx === -1) {
                  console.error(`Required columns not found in ${filepath}`);
                  return null;
              }
              
              const scores = new Map();
              const percentiles = new Map();
              const passRates = new Map();
              const medals = new Map();
              const includedTasks = new Map();
              
              for (let i = 1; i < rows.length; i++) {
                  const cells = rows[i].split(',');
                  const model = cells[modelIdx].trim();
                  
                  // Parse relative score - store null if missing/empty
                  let score = null;
                  if (scoreIdx !== -1) {
                      const scoreStr = cells[scoreIdx]?.trim();
                      if (scoreStr && scoreStr !== '') {
                          const parsed = parseFloat(scoreStr);
                          if (!isNaN(parsed)) {
                              score = parsed;
                          }
                      }
                  }
                  
                  // Parse percentile - store null if missing/empty
                  let percentile = null;
                  if (percentileIdx !== -1) {
                      const percentileStr = cells[percentileIdx]?.trim();
                      if (percentileStr && percentileStr !== '') {
                          const parsed = parseFloat(percentileStr);
                          if (!isNaN(parsed)) {
                              percentile = parsed;
                          }
                      }
                  }
                  
                  // Parse pass rate - store null if missing/empty
                  let passRate = null;
                  if (passRateIdx !== -1) {
                      const passRateStr = cells[passRateIdx]?.trim();
                      if (passRateStr && passRateStr !== '') {
                          const parsed = parseFloat(passRateStr);
                          if (!isNaN(parsed)) {
                              passRate = parsed;
                          }
                      }
                  }
                  
                  const medal = medalIdx !== -1 ? cells[medalIdx].trim() : 'None';
                  const includedTasksCount = includedTasksIdx !== -1 ? parseFloat(cells[includedTasksIdx]) || 0 : 0;
                  
                  // Only store if not null (skip missing values)
                  if (score !== null) {
                      scores.set(model, score);
                  }
                  if (percentile !== null) {
                      percentiles.set(model, percentile);
                  }
                  if (passRate !== null) {
                      passRates.set(model, passRate);
                  }
                  medals.set(model, medal);
                  includedTasks.set(model, includedTasksCount);
              }
              return { scores, percentiles, passRates, medals, includedTasks };
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

              // Update modelIncludedTasks map (for weighted averaging)
              for (const [model, includedTasksCount] of result.includedTasks) {
                  if (!modelIncludedTasks.has(model)) {
                      modelIncludedTasks.set(model, new Map());
                  }
                  const modelTasks = modelIncludedTasks.get(model);
                  
                  // If we already have included tasks for this competition+year, store as array
                  if (modelTasks.has(compKey)) {
                      const existingData = modelTasks.get(compKey);
                      if (Array.isArray(existingData)) {
                          existingData.push(includedTasksCount);
                      } else {
                          modelTasks.set(compKey, [existingData, includedTasksCount]);
                      }
                  } else {
                      modelTasks.set(compKey, includedTasksCount);
                  }
              }
          });
      } catch (error) {
          console.error('Error loading model scores:', error);
      }
  }
  
  // ... rest of the existing code ...  
