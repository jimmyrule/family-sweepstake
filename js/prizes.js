(function () {
    const table = document.getElementById('csvTablePrizes');
    if (!table) return;

    const prizesCsvPath = table.dataset.csvPrizes;
    const teamsCsvPath = table.dataset.csvTeams;
    const playersCsvPath = table.dataset.csvPlayers; // <-- New

    if (!prizesCsvPath || !teamsCsvPath || !playersCsvPath) {
        console.warn('CSV file paths not specified on table element.');
        return;
    }

    function parseCSV(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].trim().split(',');
        return lines.slice(1).map(line => {
            const values = line.trim().split(',');
            return headers.reduce((obj, header, i) => {
                obj[header] = values[i]?.trim() ?? '';
                return obj;
            }, {});
        });
    }

    function fetchCSV(url) {
        return fetch(url).then(response => response.text()).then(parseCSV);
    }

    Promise.all([
        fetchCSV(prizesCsvPath),
        fetchCSV(teamsCsvPath),
        fetchCSV(playersCsvPath)
    ])
    .then(([prizesData, teamsData, playersData]) => {
        const teamLookup = teamsData.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {});
        const playerLookup = playersData.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {});

        const tbody = table.querySelector('tbody');

        prizesData.forEach(row => {
            const tr = document.createElement('tr');

            // Prize column
            const tdPrize = document.createElement('td');
            tdPrize.textContent = row.prize;
            tr.appendChild(tdPrize);

            // Team column
            const tdTeam = document.createElement('td');
            tdTeam.classList.add('text-center', 'text-small');
            const team = teamLookup[row.team];
            if (team && team.url) {
                const img = document.createElement('img');
                img.src = '/assets/images/' + team.url + '.svg';
                img.alt = team.name;
                img.width = '40';
                img.setAttribute('data-bs-toggle', 'tooltip');
                img.setAttribute('data-bs-placement', 'right');
                img.setAttribute('title', team.name);
                img.setAttribute('tabindex', '0');
                tdTeam.appendChild(img);
            } else {
                const placeholder = document.createElement('i');
                placeholder.classList.add('fas', 'fa-volleyball-ball', 'fa-2x', 'text-muted');
                placeholder.setAttribute('data-bs-toggle', 'tooltip');
                placeholder.setAttribute('data-bs-placement', 'right');
                placeholder.setAttribute('title', "tbc");
                placeholder.setAttribute('tabindex', '0');
                tdTeam.appendChild(placeholder);
            }
            tr.appendChild(tdTeam);

            // Player column
            const tdPlayer = document.createElement('td');
            const player = playerLookup[row.player];
            if (player && player.name) {
                tdPlayer.textContent = player.name;
            } else {
                tdPlayer.textContent = 'Player';
                tdPlayer.classList.add('text-muted');
            }
            tr.appendChild(tdPlayer);

            // Amount column
            const tdAmount = document.createElement('td');
            tdAmount.classList.add('text-center');
            tdAmount.textContent = row.amount;
            tr.appendChild(tdAmount);

            // Rules column
            const tdRules = document.createElement('td');
            const icon = document.createElement('i');
            icon.classList.add('fa-regular', 'fa-circle-question', 'ms-2', 'text-muted');
            icon.setAttribute('data-bs-toggle', 'tooltip');
            icon.setAttribute('data-bs-placement', 'right');
            icon.setAttribute('title', row.rules);
            icon.setAttribute('tabindex', '0');
            tdRules.appendChild(icon);
            tr.appendChild(tdRules);

            // Add row to table body
            tbody.appendChild(tr);
        });

        // Re-init tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover focus click'
            });
        });

    })
    .catch(error => console.error('Error fetching CSV files:', error));

})();
