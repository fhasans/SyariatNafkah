// 1. Auto-format Input (Thousands Separator)
const inputField = document.getElementById('incomeAmount');
const grossField = document.getElementById('grossSalaryMain');
const netField = document.getElementById('netSalaryMain');
const housingCostField = document.getElementById('housingCost');

function formatNativeInput(el) {
    if (!el) return; // Guard
    el.addEventListener('input', function (e) {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value) {
            this.value = new Intl.NumberFormat('id-ID').format(value);
        } else {
            this.value = '';
        }
    });
}

formatNativeInput(inputField);
formatNativeInput(grossField);
formatNativeInput(netField);
formatNativeInput(housingCostField);

// Format Currency to IDR helper
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// UI Toggles
function toggleFormMode() {
    const incomeType = document.querySelector('input[name="incomeType"]:checked').value;
    const fixedDetails = document.getElementById('fixed-details');
    // New Containers
    const fixedInputContainer = document.getElementById('input-fixed-container');
    const variableInputContainer = document.getElementById('input-variable-container');

    if (incomeType === 'variable') {
        fixedDetails.classList.add('hidden');
        fixedInputContainer.classList.add('hidden');
        variableInputContainer.classList.remove('hidden');
    } else {
        fixedDetails.classList.remove('hidden');
        fixedDetails.classList.add('fade-in');
        fixedInputContainer.classList.remove('hidden');
        variableInputContainer.classList.add('hidden');
    }
}

function toggleChildInput() {
    const hasChild = document.querySelector('input[name="hasChild"]:checked').value;
    const childInput = document.getElementById('child-input-container');
    if (hasChild === 'yes') {
        childInput.classList.remove('hidden');
    } else {
        childInput.classList.add('hidden');
    }
}

function toggleHousingInput() {
    const type = document.getElementById('housingType').value;
    const costInput = document.getElementById('housing-cost-container');
    const label = document.getElementById('housing-cost-label');

    if (type === 'rent' || type === 'apartment') {
        costInput.classList.remove('hidden');
        label.innerText = "Biaya Sewa per Bulan (Rp)";
    } else if (type === 'own') {
        costInput.classList.remove('hidden');
        label.innerText = "Pajak/Maintenance Rumah (Rp)";
    } else {
        costInput.classList.add('hidden'); // Parents usually free
    }
}

// Main Calculate Function
// Main Calculate Function
function calculate() {
    const incomeType = document.querySelector('input[name="incomeType"]:checked').value;
    const resultsSection = document.getElementById('results-section');
    const inputSection = document.getElementById('input-section');

    if (incomeType === 'variable') {
        const rawValue = document.getElementById('incomeAmount').value.replace(/\./g, '');
        const incomeAmount = parseFloat(rawValue);

        if (!incomeAmount || incomeAmount <= 0) {
            alert("Mohon masukkan jumlah penghasilan yang valid.");
            return;
        }

        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        calculateScenarioA(incomeAmount);

    } else {
        // FIXED MODE: Read Gross and Net
        const rawGross = document.getElementById('grossSalaryMain').value.replace(/\./g, '');
        const rawNet = document.getElementById('netSalaryMain').value.replace(/\./g, '');
        const gross = parseFloat(rawGross) || 0;
        const net = parseFloat(rawNet) || 0;

        if (gross <= 0 || net <= 0) {
            alert("Mohon masukkan Gaji Kotor dan Gaji Bersih (THP).");
            return;
        }

        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        calculateScenarioB(gross, net);
    }
}

function calculateScenarioA(total) {
    // Skenario A: Variable (Simplified Logic for Freelancer)
    const household = total * 0.45;
    const mother = total * 0.25;
    const savings = total * 0.25;
    const others = total * 0.05;
    const father = others / 2;
    const inlaws = others / 2;

    renderResults({
        totalInput: total,
        allocatableAmount: total,
        household, mother, father, inlaws, savings,
        householdDetails: [{ label: "Dapur & Operasional", value: household }],
        inlawsNote: "Kondisi variabel.",
        context: ["Mode Penghasilan Tidak Tetap."]
    });
}

function calculateScenarioB(gross, net) {
    // 1. Zakat (2.5% calculated from GROSS)
    // Rule: Zakat 2.5% if Gross >= 6.8jt (Nisab Emas 85g approx, let's keep logic simple or existing)
    // User logic: Zakat = Gross * 2.5%
    let zakatAmount = 0;
    // Assuming Nisab check or just apply if user inputs typical salary?
    // Let's apply standard logic: if Gross >= 6jt (existing logic was 6jt)
    if (gross >= 6000000) {
        zakatAmount = gross * 0.025;
    }

    // 2. Fixed Housing Cost
    const housingType = document.getElementById('housingType').value;
    let housingCost = 0;
    if (['rent', 'apartment', 'own'].includes(housingType)) {
        const rawCost = document.getElementById('housingCost').value.replace(/\./g, '');
        housingCost = parseFloat(rawCost) || 0;
    }

    // 3. Fixed BBM
    const fixedGas = 550000;

    // Check Balance (Use NET as the source of funds)
    const totalDeductions = zakatAmount + housingCost + fixedGas;

    // Use NET for allocation
    const totalFundsAvailable = net;

    if (totalFundsAvailable < totalDeductions) {
        alert(`Penghasilan THP tidak cukup. Total potongan (Zakat+Rumah+BBM): ${formatRupiah(totalDeductions)}`);
        return;
    }

    const allocatableAmount = totalFundsAvailable - totalDeductions;

    // --- DYNAMIC ALLOCATION LOGIC ---

    // Inputs
    const wifeWorking = document.querySelector('input[name="wifeStatus"]:checked').value === 'working';
    const hasChildStr = document.querySelector('input[name="hasChild"]:checked').value;
    const childCount = hasChildStr === 'yes' ? parseInt(document.getElementById('childCount').value) || 0 : 0;

    const momHusband = document.getElementById('momHusbandStatus').value; // alive, alive_debt, deceased, deceased_debt
    const dadHusband = document.querySelector('input[name="dadHusbandStatus"]:checked').value; // alive, deceased
    const momWife = document.querySelector('input[name="momWifeStatus"]:checked').value; // alive, deceased
    const dadWife = document.querySelector('input[name="dadWifeStatus"]:checked').value; // alive, deceased

    // WEIGHTING SYSTEM
    let pctSavings = 0.15; // Base Savings
    let remainingPct = 1.0 - pctSavings; // 0.85 to distribute

    // Assign Points
    let pointsHousehold = 40; // Base
    let pointsMother = 0;
    let pointsFather = 0;
    let pointsInlaws = 0;

    // 1. Household Adjustments
    if (childCount > 0) {
        pointsHousehold += (childCount * 5); // Add 5 points per child
    }

    // 2. Parents (Husband) Check
    if (momHusband === 'alive_debt') {
        pointsMother = 30; // High Priority
    } else if (momHusband === 'deceased_debt') {
        pointsMother = 25; // Priority Debt Repayment
    } else if (momHusband === 'alive') {
        pointsMother = 15; // Standard
    } else {
        pointsMother = 0; // Deceased NO debt
    }

    if (dadHusband === 'alive') {
        pointsFather = 5; // Standard maintenance
    }

    // 3. In-laws Check
    let inlawsAliveCount = (momWife === 'alive' ? 1 : 0) + (dadWife === 'alive' ? 1 : 0);
    if (inlawsAliveCount > 0) {
        let pointsBaseInlaws = 5;
        if (wifeWorking) pointsBaseInlaws = 2;
        pointsInlaws = pointsBaseInlaws;
    }

    // Sum Points
    let totalPoints = pointsHousehold + pointsMother + pointsFather + pointsInlaws;

    // Avoid division by zero (unlikely but safe)
    if (totalPoints === 0) totalPoints = 1;

    // Calculate Percentages
    let shareHousehold = (pointsHousehold / totalPoints) * remainingPct;
    let shareMother = (pointsMother / totalPoints) * remainingPct;
    let shareFather = (pointsFather / totalPoints) * remainingPct;
    let shareInlaws = (pointsInlaws / totalPoints) * remainingPct;

    // Nominal Values
    const valHousehold = allocatableAmount * shareHousehold;
    const valMother = allocatableAmount * shareMother;
    const valFather = allocatableAmount * shareFather;
    const valInlaws = allocatableAmount * shareInlaws;
    const valSavings = allocatableAmount * pctSavings;

    // Breakdown Household
    let householdParts = [];
    let hBudget = valHousehold;

    // Split logic inside household
    const costAnakPerHead = childCount > 0 ? (hBudget * 0.25) : 0;
    const costDapur = hBudget * 0.35;
    const costUtil = hBudget * 0.15;
    const costDaruratIstri = hBudget * 0.05;
    const costSkincare = hBudget - (costAnakPerHead + costDapur + costUtil + costDaruratIstri);

    householdParts.push({ label: "Dapur & Logistik", value: costDapur });
    if (childCount > 0) householdParts.push({ label: `Kebutuhan ${childCount} Anak`, value: costAnakPerHead });
    householdParts.push({ label: "Utilitas (Listrik/Air)", value: costUtil });
    householdParts.push({ label: "Dana Darurat Istri", value: costDaruratIstri });
    householdParts.push({ label: "Nafkah Istri (Sisa)", value: costSkincare, highlight: true });

    // Context Generation
    let contextList = [];
    contextList.push(`Status: Gaji Tetap.`);
    if (childCount > 0) contextList.push(`Anak: ${childCount} orang (Alokasi rumah tangga diperbesar).`);

    if (momHusband === 'alive_debt') contextList.push(`Ibu Suami: HIDUP & ADA HUTANG. Prioritas TINGGI.`);
    else if (momHusband === 'deceased_debt') contextList.push(`Ibu Suami: MENINGGAL TAPI ADA HUTANG. Wajib dilunasi.`);
    else if (momHusband === 'alive') contextList.push(`Ibu Suami: Sehat (Nafkah Birrul Walidain).`);
    else contextList.push(`Ibu Suami: Meninggal (Alokasi dialihkan).`);

    if (housingCost > 0) {
        const typeLabel = housingType === 'rent' ? 'Sewa' : housingType === 'own' ? 'Pajak Rumah' : 'Biaya';
        contextList.push(`Tempat Tinggal: Ada beban ${typeLabel} sebesar ${formatRupiah(housingCost)}.`);
    }

    renderResults({
        totalInput: gross,
        thpAmount: net,
        zakatAmount,
        fixedGas,
        housingCost,
        allocatableAmount,
        household: valHousehold,
        mother: valMother,
        father: valFather,
        inlaws: valInlaws,
        savings: valSavings,
        householdDetails: householdParts,
        inlawsNote: inlawsAliveCount > 0 ? "Sekadar hadiah/ihsan untuk mertua." : "Mertua sudah tiada.",
        wifeNote: "Sisa uang dapur adalah hak istri.",
        context: contextList
    });
}

function renderResults(data) {
    // 0. Render Context
    const contextContainer = document.getElementById('context-list');
    contextContainer.innerHTML = '';
    data.context.forEach(text => {
        const li = document.createElement('li');
        li.innerText = text;
        contextContainer.appendChild(li);
    });
    document.getElementById('context-card').classList.remove('hidden');

    // 1. Render Salary Info Card
    const salaryDisplay = document.getElementById('salary-display');
    salaryDisplay.innerHTML = `
        <div style="margin-bottom: 20px;">
            <span class="salary-label">Total Gaji Kotor</span>
            <span class="salary-value text-gold" style="font-size: 1.5rem;">${formatRupiah(data.totalInput)}</span>
        </div>
        ${data.thpAmount ? `
        <div style="margin-bottom: 10px; font-size: 0.9rem; color: #cbd5e1;">
            (THP Diterima: <strong>${formatRupiah(data.thpAmount)}</strong>)
        </div>` : ''}
        
        ${data.zakatAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="salary-label text-red"> Potongan Zakat Profesi</span>
            <span class="text-red font-bold">-${formatRupiah(data.zakatAmount)}</span>
        </div>` : ''}

        ${data.housingCost > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="salary-label text-red"> Biaya Tempat Tinggal</span>
            <span class="text-red font-bold">-${formatRupiah(data.housingCost)}</span>
        </div>` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="salary-label text-red"> Potongan BBM (Tetap)</span>
            <span class="text-red font-bold">-${formatRupiah(data.fixedGas || 0)}</span>
        </div>
        
        <div class="salary-divider"></div>

        <div>
            <span class="salary-label">Sisa Dana Alokasi</span>
            <span class="salary-value" style="color: var(--primary-light);">${formatRupiah(data.allocatableAmount)}</span>
        </div>
    `;
    salaryDisplay.classList.remove('hidden');

    // 2. Render Cards
    document.getElementById('total-household').innerText = formatRupiah(data.household);
    document.getElementById('total-mother').innerText = formatRupiah(data.mother);
    document.getElementById('total-father').innerText = formatRupiah(data.father);
    document.getElementById('total-inlaws').innerText = formatRupiah(data.inlaws);
    document.getElementById('total-savings').innerHTML = `
        ${formatRupiah(data.savings)}
        <div style="margin-top: 10px;">
            <a href="tabungan.html?amount=${Math.floor(data.savings)}" 
               class="btn-calculate" 
               style="display: block; text-decoration: none; text-align: center; font-size: 0.8rem; padding: 8px; background: var(--primary-dark);">
               💰 Hitung Alokasi Tabungan
            </a>
        </div>
    `;

    document.getElementById('note-inlaws').innerText = data.inlawsNote || '';

    // Household Breakdown
    const listHousehold = document.getElementById('list-household');
    listHousehold.innerHTML = '';
    data.householdDetails.forEach(item => {
        const li = document.createElement('li');
        li.className = 'breakdown-item';
        if (item.highlight) li.classList.add('highlight-item');
        li.innerHTML = `
            <span class="breakdown-label">${item.label}</span>
            <span class="breakdown-value">${formatRupiah(item.value)}</span>
        `;
        listHousehold.appendChild(li);
    });

    const wifeNote = document.getElementById('note-wife');
    if (wifeNote) {
        wifeNote.innerText = data.wifeNote || '';
        wifeNote.classList.remove('hidden');
    }
}

function resetForm() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('input-section').classList.remove('hidden');
    document.querySelector('.card.fade-in').classList.add('fade-in'); // Trigger anim
}

// Init
toggleFormMode();
toggleChildInput();
toggleHousingInput();
