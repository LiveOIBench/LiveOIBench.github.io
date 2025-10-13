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
      updateDateDisplay();
      return;
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
        await calculateAggregatedMetrics(); // Recalculate metrics when selection changes
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
      
      await calculateAggregatedMetrics(); // Recalculate metrics when selection changes
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
      updateDateDisplay();
      await updateTable();
    });
    endSlider.addEventListener('input', async () => {
      updateDateDisplay();
      await updateTable();
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
  
  // Find comparison files for a competition and year
  function findComparisonFiles(basePath, competition, year) {
    const validFiles = [];
    
    // Get the known subdivisions for this competition and year
    const subdivisions = getCompetitionSubdivisions(competition, year);
    
    if (subdivisions.length === 0) {
      console.log(`No subdivisions configured for ${competition} ${year}`);
      return validFiles;
    }
    
    // Build file paths for known subdivisions only
    for (const sub of subdivisions) {
      // URL encode the subdivision name to handle special characters like #
      const encodedSub = encodeURIComponent(sub);
      const encodedFileName = encodeURIComponent(`${competition}_${year}_${sub}_model_comparison.csv`);
      const filePath = `${basePath}/${encodedSub}/${encodedFileName}`;
      validFiles.push(filePath);
    }
    
    return validFiles;
  }
  
  // Process competition data
  function processCompetitionData(csvText) {
    const rows = csvText.trim().split('\n');
    if (rows.length < 2) return { data: {}, problemCount: 0 };
    
    const headers = rows[0].split(',').map(h => h.trim());
    
    const modelIdx = headers.indexOf("Model");
    const avgPassedIdx = headers.indexOf("Avg Tests Passed");
    const avgTimeIdx = headers.indexOf("Avg Time");
    const avgMemIdx = headers.indexOf("Avg Memory");
    const passRateIdx = headers.indexOf("Pass Rate");
    const problemCountIdx = headers.indexOf("Problem Count");
    
    if ([modelIdx, avgPassedIdx, avgTimeIdx, avgMemIdx, passRateIdx].includes(-1)) {
      throw new Error("CSV header does not include expected columns.");
    }
    
    const data = {};
    let problemCount = 0;
    
    rows.slice(1).forEach(row => {
      const cells = row.split(',');
      if (cells.length <= modelIdx) return;
      
      const model = cells[modelIdx].trim();
      if (!model) return;
      
      data[model] = {
        avgPassed: parseFloat(cells[avgPassedIdx]) || 0,
        avgTime: parseFloat(cells[avgTimeIdx]) || 0,
        avgMem: parseFloat(cells[avgMemIdx]) || 0,
        passRate: parseFloat(cells[passRateIdx]) || 0
      };
      
      // Get problem count from the first row (all rows should have the same count)
      if (problemCount === 0 && problemCountIdx !== -1) {
        problemCount = parseInt(cells[problemCountIdx]) || 0;
      }
    });
    
    return { data, problemCount };
  }
  
  // Update statistics box
  function updateStatisticsBox(totalQuestions) {
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
      totalQuestionsElement.textContent = totalQuestions;
    }
  }
  
  // Load data for a specific competition and year
  async function loadCompetitionYearData(competition, year) {
    try {
      // First, try to find all comparison files for this competition and year
      const basePath = `static/data/all/${competition}/${year}`;
      const files = findComparisonFiles(basePath, competition, year);
      
      if (files.length === 0) {
        console.log(`No comparison files found for ${competition} ${year}`);
        return { data: {}, problemCount: 0 };
      }
      
      let aggregatedData = {};
      let totalProblemCount = 0;
      
      // Load all files in parallel
      const filePromises = files.map(async file => {
        try {
          const response = await fetch(file);
          if (!response.ok) {
            console.log(`File not found: ${file}`);
            return null;
          }
          
          const text = await response.text();
          return processCompetitionData(text);
        } catch (error) {
          console.error(`Failed to load ${file}:`, error);
          return null;
        }
      });
      
      // Wait for all files to load
      const results = await Promise.all(filePromises);
      
      // Process results
      results.forEach(result => {
        if (!result) return;
        
        const { data, problemCount } = result;
        
        if (Object.keys(data).length === 0) return;
        
        // Merge data from multiple files
        Object.keys(data).forEach(model => {
          if (!aggregatedData[model]) {
            aggregatedData[model] = {
              avgPassed: 0,
              avgTime: 0,
              avgMem: 0,
              passRate: 0,
              count: 0
            };
          }
          
          const existing = aggregatedData[model];
          const newData = data[model];
          
          existing.avgPassed = (existing.avgPassed * existing.count + newData.avgPassed) / (existing.count + 1);
          existing.avgTime = (existing.avgTime * existing.count + newData.avgTime) / (existing.count + 1);
          existing.avgMem = (existing.avgMem * existing.count + newData.avgMem) / (existing.count + 1);
          existing.passRate = (existing.passRate * existing.count + newData.passRate) / (existing.count + 1);
          existing.count++;
        });
        
        totalProblemCount += problemCount;
      });
      
      return { data: aggregatedData, problemCount: totalProblemCount };
    } catch (error) {
      console.error(`Failed to load data for ${competition} ${year}:`, error);
      return { data: {}, problemCount: 0 };
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
  
  // Calculate aggregated metrics for selected competitions and date range
  async function calculateAggregatedMetrics(filteredCompetitions = null) {
    if (!filteredCompetitions) {
      filteredCompetitions = getFilteredCompetitions();
    }
    
    if (filteredCompetitions.size === 0) {
      updateStatisticsBox(0);
      return [];
    }
    
    // Load data for each filtered competition
    const allData = {};
    let totalQuestions = 0;
    
    for (const compYear of filteredCompetitions) {
      const [comp, year] = compYear.split('_');
      const { data, problemCount } = await loadCompetitionYearData(comp, year);
      
      Object.keys(data).forEach(model => {
        // Only process models that are in the allowed list
        if (!isModelAllowed(model)) {
          return;
        }
        
        if (!allData[model]) {
          allData[model] = {
            avgPassed: 0,
            avgTime: 0,
            avgMem: 0,
            passRate: 0,
            count: 0
          };
        }
        
        const existing = allData[model];
        const newData = data[model];
        
        existing.avgPassed = (existing.avgPassed * existing.count + newData.avgPassed) / (existing.count + 1);
        existing.avgTime = (existing.avgTime * existing.count + newData.avgTime) / (existing.count + 1);
        existing.avgMem = (existing.avgMem * existing.count + newData.avgMem) / (existing.count + 1);
        existing.passRate = (existing.passRate * existing.count + newData.passRate) / (existing.count + 1);
        existing.count++;
      });
      
      totalQuestions += problemCount;
    }
    
    // Update statistics box with total questions
    updateStatisticsBox(totalQuestions);
    
    return Object.keys(allData).map(model => ({
      model: model,
      avgPassed: allData[model].avgPassed.toFixed(2),
      avgTime: allData[model].avgTime.toFixed(2),
      avgMem: allData[model].avgMem.toFixed(2),
      passRate: allData[model].passRate.toFixed(2)
    }));
  }
  
  // Add sorting state variables
  let currentSortColumn = 'passRate'; // Default sort by pass rate
  let isAscending = false; // Default descending order
  
  // Update the table with current selection
  async function updateTable() {
    const table = document.getElementById('rankingTable');
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
  
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
  
    // Get filtered competitions based on time range and divisions
    const filteredCompetitions = getFilteredCompetitions();
    
    // Calculate metrics for each model
    const modelMetrics = await calculateAggregatedMetrics(filteredCompetitions);
    
    // Get unique competition names and aggregate medals
    const uniqueCompetitions = new Set();
    for (const compYear of filteredCompetitions) {
      const baseComp = compYear.split('_')[0];
      uniqueCompetitions.add(baseComp);
    }
  
    // Create a map to store total medals for each model
    const modelMedals = new Map();
    
    // Aggregate medals from filtered competitions only
    for (const competition of uniqueCompetitions) {
      if (!competitionMedals[competition]) {
        console.error(`No medal data found for competition: ${competition}`);
        continue;
      }
      
      // For each model in this competition
      for (const medalCount of competitionMedals[competition]) {
        // Only process models that are in the allowed list
        if (!isModelAllowed(medalCount.model)) {
          continue;
        }
        
        if (!modelMedals.has(medalCount.model)) {
          modelMedals.set(medalCount.model, { gold: 0, silver: 0, bronze: 0 });
        }
        const total = modelMedals.get(medalCount.model);
        total.gold += medalCount.gold;
        total.silver += medalCount.silver;
        total.bronze += medalCount.bronze;
      }
    }
  
    // Calculate average relative scores and human percentiles for filtered competitions
    const modelAvgScores = new Map();
    const modelAvgPercentiles = new Map();
    
    // First pass: Calculate average relative scores
    for (const [model, scoreMap] of modelRelativeScore) {
      // Only process models that are in the allowed list
      if (!isModelAllowed(model)) {
        continue;
      }
      
      let totalScore = 0;
      let count = 0;
      
      for (const compYear of filteredCompetitions) {
        const [comp, year] = compYear.split('_');
        const key = `${comp}-${year}`;
        
        if (scoreMap.has(key)) {
          totalScore += scoreMap.get(key);
          count++;
        }
      }
      
      if (count > 0) {
        modelAvgScores.set(model, totalScore / count);
      }
    }
  
    // Second pass: Calculate average human percentiles
    for (const [model, percentileMap] of modelHumanPercentile) {
      // Only process models that are in the allowed list
      if (!isModelAllowed(model)) {
        continue;
      }
      
      let totalPercentile = 0;
      let count = 0;
      
      for (const compYear of filteredCompetitions) {
        const [comp, year] = compYear.split('_');
        const key = `${comp}-${year}`;
        
        if (percentileMap.has(key)) {
          totalPercentile += percentileMap.get(key);
          count++;
        }
      }
      
      if (count > 0) {
        modelAvgPercentiles.set(model, totalPercentile / count);
      }
    }
  
    // Combine metrics and medals data
    const combinedData = modelMetrics.map(entry => {
      const medals = modelMedals.get(entry.model) || { gold: 0, silver: 0, bronze: 0 };
      const avgRelativeScore = modelAvgScores.get(entry.model) || 0;
      const avgHumanPercentile = modelAvgPercentiles.get(entry.model) || 0;
      return {
        ...entry,
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
        initializeMedalCounts(),
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
        await calculateAggregatedMetrics();
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
  
  // Initialize medal counts for each competition
  async function initializeMedalCounts() {
    try {
      // Get unique competition names (without years)
      const competitions = new Set();
      for (const [competition, years] of Object.entries(COMPETITION_CONFIG)) {
        competitions.add(competition);
      }
  
      // Create promises for all competition rankings in parallel
      const rankingPromises = Array.from(competitions).map(async competition => {
        try {
          // Special handling for EGOI - initialize with zero medals
          if (competition === 'EGOI') {
            return [competition, [new MedalCount('default', 0, 0, 0)]];
          }
  
          // Special handling for USACO
          const filename = competition === 'USACO' ? 'USACO_overall_rankings.csv' : `${competition}_rankings.csv`;
          const response = await fetch(`static/data/model_rankings/competitions/${filename}`);
          
          if (!response.ok) {
            console.log(`No rankings file found for ${competition}, skipping...`);
            return [competition, []];
          }
          
          const data = await response.text();
          const lines = data.split('\n').filter(line => line.trim());
          
          // Skip header
          const medalCounts = [];
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',').map(val => val.trim());
            const model = columns[0];
            const gold = parseInt(columns[8]);  // Gold Medals column
            const silver = parseInt(columns[9]); // Silver Medals column
            const bronze = parseInt(columns[10]); // Bronze Medals column
            
            if (model) {
              medalCounts.push(new MedalCount(model, gold, silver, bronze));
            }
          }
          
          return [competition, medalCounts];
        } catch (error) {
          console.log(`Error loading rankings for ${competition}:`, error);
          return [competition, []];
        }
      });
  
      // Wait for all rankings to load in parallel
      const results = await Promise.all(rankingPromises);
      
      // Update competitionMedals with results
      results.forEach(([competition, medalCounts]) => {
        competitionMedals[competition] = medalCounts;
      });
    } catch (error) {
      console.error('Error initializing medal counts:', error);
    }
  }
  
  // ... rest of the existing code ...  
  
  // Load relative scores for models from contest rankings
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
              const scoreIdx = headers.indexOf('Relative Score (%)');
              const percentileIdx = headers.indexOf('Human Percentile');
              
              if (modelIdx === -1 || scoreIdx === -1) {
                  console.error(`Required columns not found in ${filepath}`);
                  return null;
              }
              
              const scores = new Map();
              const percentiles = new Map();
              for (let i = 1; i < rows.length; i++) {
                  const cells = rows[i].split(',');
                  const model = cells[modelIdx].trim();
                  const score = parseFloat(cells[scoreIdx]) || 0;
                  const percentile = percentileIdx !== -1 ? parseFloat(cells[percentileIdx]) || 0 : 0;
                  scores.set(model, score);
                  percentiles.set(model, percentile);
              }
              return { scores, percentiles };
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
              
              const result = await processCSVFile(`${baseDir}/${file}`);
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
                  
                  // If we already have a score for this competition+year, average them
                  if (modelScores.has(compKey)) {
                      const existingScore = modelScores.get(compKey);
                      modelScores.set(compKey, (existingScore + score) / 2);
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
                  
                  // If we already have a percentile for this competition+year, average them
                  if (modelPercentiles.has(compKey)) {
                      const existingPercentile = modelPercentiles.get(compKey);
                      modelPercentiles.set(compKey, (existingPercentile + percentile) / 2);
                  } else {
                      modelPercentiles.set(compKey, percentile);
                  }
              }
          });
      } catch (error) {
          console.error('Error loading model scores:', error);
      }
  }
  
  // ... rest of the existing code ...  