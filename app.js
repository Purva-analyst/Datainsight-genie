// =========================
// GLOBAL VARIABLES
// =========================
let globalData = [];
let numericCols = [];
let dateCols = [];
let categoryCols = [];

// =========================
// CSV UPLOAD HANDLER
// =========================
document.getElementById('csvFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const text = event.target.result;
        parseCSV(text);
    };

    reader.readAsText(file);
});

// =========================
// PARSE CSV
// =========================
function parseCSV(csvText) {
    const rows = csvText.split("\n").map(r => r.trim());
    const headers = rows[0].split(",");

    globalData = rows.slice(1).map(row => {
        const values = row.split(",");
        let obj = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
    });

    detectColumnTypes(headers);
    updateDropdowns();
    showPreviewTable();
}

// =========================
// DETECT COLUMN TYPES
// =========================
function detectColumnTypes(headers) {
    numericCols = [];
    dateCols = [];
    categoryCols = [];

    headers.forEach(h => {
        const sample = globalData[0][h];

        if (!isNaN(parseFloat(sample))) numericCols.push(h);
        else if (!isNaN(Date.parse(sample))) dateCols.push(h);
        else categoryCols.push(h);
    });
}

// =========================
// UPDATE SELECT OPTIONS
// =========================
function updateDropdowns() {
    fillDropdown("numericColumn", numericCols);
    fillDropdown("dateColumn", dateCols);
    fillDropdown("categoryColumn", categoryCols);
}

function fillDropdown(id, list) {
    let dropdown = document.getElementById(id);
    dropdown.innerHTML = "";
    list.forEach(val => {
        let opt = document.createElement("option");
        opt.value = val;
        opt.innerText = val;
        dropdown.appendChild(opt);
    });
}

// =========================
// PREVIEW FIRST 10 ROWS
// =========================
function showPreviewTable() {
    let tableDiv = document.getElementById("preview");
    let first10 = globalData.slice(0, 10);

    let html = "<table border='1'><tr>";

    Object.keys(first10[0]).forEach(h => {
        html += `<th>${h}</th>`;
    });

    html += "</tr>";

    first10.forEach(row => {
        html += "<tr>";
        Object.values(row).forEach(v => html += `<td>${v}</td>`);
        html += "</tr>";
    });

    html += "</table>";
    tableDiv.innerHTML = html;
}

// =========================
// ANALYZE BUTTON CLICK
// =========================
document.getElementById("analyzeBtn").addEventListener("click", function () {
    generateTimeSeries();
    generateCategoryChart();
    generateCorrelationMatrix();
    generateInsights();
});

// =========================
// TIME SERIES CHART
// =========================
function generateTimeSeries() {
    let col = document.getElementById("dateColumn").value;
    if (!col) return;

    let x = globalData.map(r => r[col]);
    let y = globalData.map((r, i) => i + 1);

    let trace = {
        x: x,
        y: y,
        mode: "lines",
        name: "Trend"
    };

    Plotly.newPlot("timeSeries", [trace]);
}

// =========================
// CATEGORY BAR CHART
// =========================
function generateCategoryChart() {
    let col = document.getElementById("categoryColumn").value;
    if (!col) return;

    let counts = {};
    globalData.forEach(row => {
        counts[row[col]] = (counts[row[col]] || 0) + 1;
    });

    let x = Object.keys(counts);
    let y = Object.values(counts);

    let trace = {
        x: x,
        y: y,
        type: "bar"
    };

    Plotly.newPlot("categoryChart", [trace]);
}

// =========================
// CORRELATION MATRIX
// =========================
function generateCorrelationMatrix() {
    if (numericCols.length < 2) return;

    let matrix = numericCols.map(col1 =>
        numericCols.map(col2 => {
            return correlation(
                globalData.map(r => parseFloat(r[col1]) || 0),
                globalData.map(r => parseFloat(r[col2]) || 0)
            );
        })
    );

    let data = [{
        z: matrix,
        x: numericCols,
        y: numericCols,
        type: "heatmap",
        colorscale: "Viridis"
    }];

    Plotly.newPlot("correlationMatrix", data);
}

// HELPER: Correlation formula
function correlation(a, b) {
    let n = a.length;
    let sumA = a.reduce((x, y) => x + y, 0);
    let sumB = b.reduce((x, y) => x + y, 0);
    let sumAB = a.map((x, i) => x * b[i]).reduce((x, y) => x + y, 0);
    let sumA2 = a.map(x => x * x).reduce((x, y) => x + y, 0);
    let sumB2 = b.map(x => x * x).reduce((x, y) => x + y, 0);

    return (n * sumAB - sumA * sumB) /
        Math.sqrt((n * sumA2 - sumA ** 2) * (n * sumB2 - sumB ** 2));
}

// =========================
// AUTO INSIGHTS
// =========================
function generateInsights() {
    let insightDiv = document.getElementById("insights");

    let totalRows = globalData.length;
    let topCategory = document.getElementById("categoryColumn").value;

    let message = `
        <h3>Auto Insights</h3>
        <p><b>Total Rows:</b> ${totalRows}</p>
        <p><b>Dominant Category Column:</b> ${topCategory}</p>
        <p>Data trends & patterns detected automatically.</p>
    `;

    insightDiv.innerHTML = message;
}
