(function () {

// Get the table element
const table = document.getElementById('csvTableDraw');
if (!table) return; // Exit if table isn't present

// Get CSV paths from data attributes
const playersCsvPath = table.dataset.csvPlayers;
const teamsCsvPath = table.dataset.csvTeams;

// Exit if any required paths are missing
if (!playersCsvPath || !teamsCsvPath) {
    console.warn('CSV file paths not specified on table element.');
    return;
}

// Function to parse CSV string into array of objects
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].trim().split(',');
    return lines.slice(1).map(line => {
        const values = line.trim().split(',');
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i].trim();
            return obj;
        }, {});
    });
}

// Function to fetch CSV file from the server
function fetchCSV(url) {
    return fetch(url).then(response => response.text()).then(parseCSV);
}

// Fetch CSV files and generate the table
Promise.all([fetchCSV(playersCsvPath), fetchCSV(teamsCsvPath)])
    .then(([file1Data, file2Data]) => {
        // Create lookup map from file2Data
        const lookupMap = file2Data.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {});

        // Get the table body element safely
        const table = document.getElementById('csvTableDraw');
        if (!table) return; // Exit early if table is not present on this page

        const tbody = table.querySelector('tbody');

        // Populate the table
        file1Data.forEach(row => {
            const tr = document.createElement('tr');

            // Name column
            const tdName = document.createElement('td');
            tdName.textContent = row.name;

            // Add prize icons dynamically
            ['team1', 'team2', 'team3'].forEach(teamKey => {
                const teamId = row[teamKey];
                if (teamId && lookupMap[teamId] && lookupMap[teamId].prize === 'TRUE') {
                    const icon = document.createElement('i');
                    icon.classList.add('fas', 'fa-money-bill-wave', 'prize');
                    tdName.appendChild(icon);
                }
            });

            tr.appendChild(tdName);

            // Render team columns dynamically
            const teamKeys = ['team1', 'team2', 'team3'];

            teamKeys.forEach((teamKey, index) => {
                const teamId = row[teamKey];

                // Skip team2/team3 if they don't exist in the data at all
                if (!(teamKey in row)) return;

                const td = document.createElement('td');
                td.classList.add('text-center', 'text-small');

                if (teamId && lookupMap[teamId] && lookupMap[teamId].url) {
                    const team = lookupMap[teamId];

                    const img = document.createElement('img');
                    img.src = '/assets/images/' + team.url + '.svg';
                    img.alt = team.name;
                    img.width = 40;
                    td.appendChild(img);

                    const label = document.createElement('p');
                    label.textContent = team.name;
                    td.appendChild(label);

                    if (team.eliminated === 'TRUE') {
                        td.classList.add('eliminated');
                    }
                } else {
                    // Only show placeholder for team1 (to preserve original behaviour)
                    if (index === 0) {
                        const placeholder = document.createElement('i');
                        placeholder.classList.add('fas', 'fa-volleyball-ball', 'fa-2x', 'text-dark-grey');
                        td.appendChild(placeholder);

                        const placeholderLabel = document.createElement('p');
                        placeholderLabel.textContent = "tbc";
                        placeholderLabel.classList.add('text-dark-grey');
                        td.appendChild(placeholderLabel);
                    } else {
                        td.textContent = '';
                    }
                }

                tr.appendChild(td);
            });

            // Append row to table body
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error fetching CSV files:', error));

    })();
