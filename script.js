// Signature File Mapping according to GitHub folder: Images/
const signatureMap = {
    "NUR_A": "nura.png",
    "NUR_B": "nurb.png",
    "LKG_A": "lkga.png",
    "LKG_B": "lkgb.png",
    "UKG_A": "ukga.png",
    "UKG_B": "ukgb.png",
    "I (A)": "ia.png",
    "I (B)": "ib.png",
    "II (Two)": "iia.png",
    "III (Three)": "iiia.png",
    "IV (Four)": "iva.png",
    "V (Five)": "va.png",
    "VI (Six)": "via.png",
    "VII (Seven)": "viia.png",
    "VIII (Eight)": "viiia.png",
    "IX (Nine)": "jagatinfras.png",
    "X (Ten)": "jagatinfras.png"
};

// Configuration
const USE_DUMMY_DATA = true;
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwo8c9bTAXQQRSUf5Sxa_mXo2IlzkrEorFWNueVAAMv8cOJHR3ow-lejvUo14wTTlSwOA/exec"; 
let currentView = "RANK_CARD"; 
let globalSheetData = [];

// Dummy Matrix Data matching RANK_JAGAT format
const DUMMY_RANK_SHEET = [
    ["I_D", "CLASS", "RNK", "ORD", "STUDENTS_NAME", "ROLL", "FM", "GTT", "PCGTT", "Merit", "", 
     "I_D", "CLASS", "RNK", "ORD", "STUDENTS_NAME", "ROLL", "FM", "GTT", "PCGTT", "Merit", "",
     "I_D", "CLASS", "RNK", "ORD", "STUDENTS_NAME", "ROLL", "FM", "GTT", "PCGTT", "Merit", ""],
    
    ["101", "NUR_A", 1, "1st", "AARAV SHARMA", "01", 500, 485, 97.00, 1, "", 
     "201", "NUR_B", 1, "1st", "ISHAN REZA", "01", 500, 478, 95.60, 1, "",
     "301", "LKG_A", 1, "1st", "ANANYA DAS", "01", 600, 582, 97.00, 1, ""],

    ["102", "NUR_A", 2, "2nd", "PRIYA CHOWDHURY", "02", 500, 462, 92.40, 2, "", 
     "202", "NUR_B", 2, "2nd", "TANVIR HOSSAIN", "03", 500, 450, 90.00, 2, "",
     "302", "LKG_A", 2, "2nd", "SOUVIK MONDAL", "04", 600, 550, 91.67, 2, ""],

    ["103", "NUR_A", 3, "3rd", "RITAM BANERJEE", "05", 500, 440, 88.00, 3, "", 
     "203", "NUR_B", 3, "3rd", "SNEHA HALDER", "02", 500, 432, 86.40, 3, "",
     "303", "LKG_A", 3, "3rd", "SURAJ SHAW", "02", 600, 530, 88.33, 3, ""]
];

function getOrdinalRank(n) {
    if (!n) return "-";
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

window.onload = function() {
    if (USE_DUMMY_DATA) {
        globalSheetData = DUMMY_RANK_SHEET;
        populateClassDropdown();
        renderView();
    } else {
        fetch(GAS_WEB_APP_URL)
            .then(res => res.json())
            .then(data => {
                globalSheetData = data;
                populateClassDropdown();
                renderView();
            })
            .catch(err => {
                console.error("Error loading GAS data:", err);
                document.getElementById('cards-container').innerHTML = "<div style='color:red;text-align:center;padding:50px;'>Error loading live data. Please check GAS_WEB_APP_URL.</div>";
            });
    }
};

function populateClassDropdown() {
    const select = document.getElementById('classSelect');
    select.innerHTML = '<option value="ALL">All Classes</option>';
    
    for (let startCol = 0; startCol < globalSheetData[0].length; startCol += 11) {
        if (!globalSheetData[0][startCol]) break;
        let cls = (globalSheetData[1] && globalSheetData[1][startCol + 1]) 
                  ? globalSheetData[1][startCol + 1] : "";
        if (cls) {
            let opt = document.createElement('option');
            opt.value = cls;
            opt.textContent = cls;
            select.appendChild(opt);
        }
    }
}

function filterClass() {
    renderView();
}

function toggleView() {
    if (currentView === "RANK_CARD") {
        currentView = "MERIT_LIST";
        document.getElementById('viewToggleBtn').textContent = "Switch to Rank Cards";
    } else {
        currentView = "RANK_CARD";
        document.getElementById('viewToggleBtn').textContent = "Switch to Merit List";
    }
    renderView();
}

function renderView() {
    const container = document.getElementById('cards-container');
    container.innerHTML = "";

    const selectedClass = document.getElementById('classSelect').value;

    for (let startCol = 0; startCol < globalSheetData[0].length; startCol += 11) {
        if (!globalSheetData[0][startCol]) break;

        let cls = (globalSheetData[1] && globalSheetData[1][startCol + 1])
                  ? globalSheetData[1][startCol + 1] : "";

        if (selectedClass !== "ALL" && cls !== selectedClass) continue;

        let students = [];
        for (let r = 1; r < globalSheetData.length; r++) {
            if (!globalSheetData[r][startCol + 4]) continue;
            students.push({
                merit : globalSheetData[r][startCol + 9],
                rnk   : getOrdinalRank(globalSheetData[r][startCol + 2]),
                rawRnk: globalSheetData[r][startCol + 2],
                name  : globalSheetData[r][startCol + 4],
                roll  : globalSheetData[r][startCol + 5],
                fm    : globalSheetData[r][startCol + 6],
                gtt   : globalSheetData[r][startCol + 7],
                pc    : parseFloat(globalSheetData[r][startCol + 8] || 0).toFixed(2)
            });
        }

        if (students.length > 0) {
            if (currentView === "RANK_CARD") {
                container.innerHTML += buildRankCardHTML(cls, students);
            } else {
                container.innerHTML += buildMeritListHTML(cls, students);
            }
        }
    }
}

function buildRankCardHTML(cls, students) {
    let rows = "";
    students.forEach((st) => {
        let badgeClass = st.rawRnk == 1 ? "top-1" : (st.rawRnk == 2 ? "top-2" : (st.rawRnk == 3 ? "top-3" : ""));
        rows += `<tr>
            <td>${st.merit}</td>
            <td><span class="rank-badge ${badgeClass}">${st.rnk}</span></td>
            <td style="text-align:left; padding-left:10px; font-weight:600;">${st.name}</td>
            <td>${st.roll}</td>
            <td>${st.fm}</td>
            <td><strong>${st.gtt}</strong></td>
            <td><strong>${st.pc}%</strong></td>
        </tr>`;
    });

    const classSigFile = signatureMap[cls] ? `Images/${signatureMap[cls]}` : "Images/jagatinfras.png";

    return `
    <div class="a4-sheet">
        <div class="header">
            <img src="Images/logo_jagat.png" class="header-logo" alt="School Logo" onerror="this.src='https://via.placeholder.com/65?text=LOGO'">
            <div class="header-text">
                <h1>SHRIPUR KINDERGARTEN SCHOOL</h1>
                <h3>2<sup>nd</sup> Summative Evaluation - 2026</h3>
                <p>Jagat Infrastructure &amp; Algorithm</p>
            </div>
            <img src="Images/qr.png" class="header-qr" alt="QR" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(cls)}'">
        </div>

        <div class="meta-info">
            <span>CLASS / SECTION: <strong>${cls}</strong></span>
            <span class="title-tag">TABULATION / RANK CARD</span>
            <span>SESSION: 2026</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:7%;">SL</th>
                    <th style="width:12%;">Rank</th>
                    <th style="text-align:left; padding-left:10px;">Student's Name</th>
                    <th style="width:10%;">Roll</th>
                    <th style="width:12%;">FM</th>
                    <th style="width:12%;">Obt</th>
                    <th style="width:15%;">Percentage</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>

        <div class="footer-section">
            <div class="signatures-grid">
                <div class="sig-box">
                    <div class="sig-img-container">
                        <img src="${classSigFile}" class="sig-img" alt="Class Teacher Sign" onerror="this.parentElement.innerHTML='<div class=\\'sig-tick\\'>✓</div>'">
                    </div>
                    <div class="sig-title">Class Teacher</div>
                </div>
                <div class="sig-box">
                    <div class="sig-img-container">
                        <img src="Images/jagatinfras.png" class="sig-img" alt="JIA Sign" onerror="this.parentElement.innerHTML='<div class=\\'sig-tick\\'>✓</div>'">
                    </div>
                    <div class="sig-title">Jagat Infrastructure</div>
                </div>
                <div class="sig-box">
                    <div class="sig-img-container">
                        <img src="Images/principal.png" class="sig-img" alt="Principal Sign" onerror="this.parentElement.innerHTML='<div class=\\'sig-tick\\'>✓</div>'">
                    </div>
                    <div class="sig-title">Principal</div>
                </div>
            </div>
            <div class="school-stamp">Computer Generated Valid Tabulation Sheet • Shripur Kindergarten School</div>
        </div>
    </div>`;
}

function buildMeritListHTML(cls, students) {
    let rows = "";
    students.forEach((st) => {
        rows += `<tr>
            <td>${st.merit}</td>
            <td><strong>${st.rnk}</strong></td>
            <td style="text-align:left; padding-left:12px; font-weight: bold;">${st.name}</td>
            <td>${st.roll}</td>
            <td>${st.fm}</td>
            <td>${st.gtt}</td>
            <td><strong>${st.pc}%</strong></td>
        </tr>`;
    });

    return `
    <div class="a4-sheet">
        <div class="header">
            <img src="Images/logo_jagat.png" class="header-logo" alt="Logo" onerror="this.src='https://via.placeholder.com/65?text=LOGO'">
            <div class="header-text">
                <h1>SHRIPUR KINDERGARTEN SCHOOL</h1>
                <h3>OFFICIAL CLASS MERIT LIST - 2026</h3>
                <p>Jagat Infrastructure &amp; Algorithm</p>
            </div>
            <img src="Images/qr.png" class="header-qr" alt="QR" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(cls)}'">
        </div>

        <div class="meta-info">
            <span>CLASS: <strong>${cls}</strong></span>
            <span class="title-tag">MERIT RANKING</span>
            <span>TOTAL STUDENTS: ${students.length}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Merit Position</th>
                    <th>Rank</th>
                    <th style="text-align:left; padding-left:12px;">Candidate Name</th>
                    <th>Roll No</th>
                    <th>Total Marks</th>
                    <th>Obtained Marks</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>

        <div class="footer-section">
            <div class="signatures-grid">
                <div class="sig-box"><div class="sig-title">Class Teacher</div></div>
                <div class="sig-box"><div class="sig-title">Jagat Infrastructure</div></div>
                <div class="sig-box"><div class="sig-title">Principal</div></div>
            </div>
        </div>
    </div>`;
}