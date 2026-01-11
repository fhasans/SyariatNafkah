// Helper for Currency Formatting
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// Input Formatting
function formatCurrency(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value) {
        input.value = new Intl.NumberFormat('id-ID').format(value);
    } else {
        input.value = '';
    }
}

// Toggle Input Modes
function toggleInputMode() {
    const type = document.getElementById('incomeType').value;
    const fixedDiv = document.getElementById('input-fixed');
    const variableDiv = document.getElementById('input-variable');

    if (type === 'fixed') {
        fixedDiv.classList.remove('hidden');
        variableDiv.classList.add('hidden');
    } else {
        fixedDiv.classList.add('hidden');
        variableDiv.classList.remove('hidden');
    }
}

// Helper Card Renderer
const renderCard = (title, amount, color, description, percentage = '') => `
    <div class="card fade-in" style="border-left: 4px solid ${color};">
        <div class="result-header">
            <div class="result-title">${title} ${percentage ? `(${percentage})` : ''}</div>
            <div class="result-total" style="color: ${color};">${formatRupiah(amount)}</div>
        </div>
        <div class="note-box" style="border-color: ${color}; color: #e2e8f0; background: rgba(30, 41, 59, 0.5); font-size: 0.85rem;">
            ${description}
        </div>
    </div>
`;

function calculateLajang() {
    const type = document.getElementById('incomeType').value;
    const resultDiv = document.getElementById('result-container');
    const resultList = document.getElementById('result-list');

    let html = '';

    // --- LOGIC VARIABLES ---
    let valZakat = 0;
    let valBensin = 0;
    let valInternet = 0;
    let valListrik = 0;
    let valKuota = 0;
    let valMakan = 0;
    let valSembako = 0;
    let valIbu = 0;
    let valAyah = 0;
    let valNikah = 0;
    let valFun = 0;

    // Fixed Costs Constants (Asumsi standar Jakarta/Kota Besar untuk Lajang Hemat)
    const COST_INTERNET = 360000;
    const COST_LISTRIK = 100000;
    const COST_KUOTA = 100000;
    const COST_MAKAN = 300000; // Masak/Hemat
    const COST_SEMBAKO = 300000;

    if (type === 'fixed') {
        // MODE A: HYBRID LOGIC
        const rawGross = document.getElementById('grossSalary').value.replace(/\./g, '');
        const rawNet = document.getElementById('netSalary').value.replace(/\./g, '');
        const rawFuel = document.getElementById('fuelCost').value.replace(/\./g, '');

        const gross = parseFloat(rawGross) || 0;
        const net = parseFloat(rawNet) || 0;
        const fuel = parseFloat(rawFuel) || 0;

        if (gross === 0 || net === 0) {
            alert("Mohon isi Gaji Kotor dan THP.");
            return;
        }

        // 1. Kewajiban & Operasional
        valZakat = gross * 0.025;
        valBensin = fuel;
        valInternet = COST_INTERNET;
        valListrik = COST_LISTRIK;
        valKuota = COST_KUOTA;
        valMakan = COST_MAKAN;
        valSembako = COST_SEMBAKO;

        const totalFixedCost = valZakat + valBensin + valInternet + valListrik + valKuota + valMakan + valSembako;

        // 2. Dana Alokasi (Netto)
        let allocatable = net - totalFixedCost;
        // Note: Zakat dihitung dari Gross, tapi kita kurangi dari Net (uang di tangan)
        // Adjust allocatable logic: THP is typically Net after Tax but NOT Zakat. 
        // So User pays Zakat from THP.
        // Actually, let's stick to the prompt structure.
        // We deduct ALL fixed costs from THP to find 'Disposable Income'.

        if (allocatable < 0) allocatable = 0;

        // 3. Distribusi Disposable
        // Asumsi: Sinking Fund (Servis Motor) 150rb (diminta user di prompt sebelumnya, 
        // tapi di prompt baru tidak disebut eksplisit, namun 'div masing-masing' listnya spesifik.
        // Saya akan skip Sinking Fund jika tidak ada di list request TERBARU, 
        // TAPI sebaiknya tetap ada atau digabung? 
        // User request list: Zakat, Bensin, Internet, Listrik, Kuota, Makan, Sembako, Nikah, Ibu, Ayah, Bioskop.
        // Item Sinking Fund TIDAK ADA di list terbaru. Saya akan ikuti list terbaru SAJA.

        // A. Orang Tua (25% dari Allocatable)
        const totalParents = allocatable * 0.30; // Naikkan sedikit jadi 30% karena sinking fund hilang
        valIbu = totalParents * (2 / 3);
        valAyah = totalParents * (1 / 3);

        // B. Sisanya untuk Masa Depan & Fun
        let remaining = allocatable - totalParents;

        // C. Tabungan Nikah (75% dari Sisa)
        valNikah = remaining * 0.75;

        // D. Hiburan (25% dari Sisa)
        valFun = remaining * 0.25;

    } else {
        // MODE B: WATERFALL LOGIC
        const rawIncome = document.getElementById('currentIncome').value.replace(/\./g, '');
        const income = parseFloat(rawIncome) || 0;

        if (income === 0) {
            alert("Mohon isi Penghasilan Saat Ini.");
            return;
        }

        let current = income;

        // 1. Zakat & Bensin (Prioritas Utama)
        valZakat = income * 0.025;
        valBensin = income * 0.10; // Estimasi 10%

        current -= (valZakat + valBensin);
        if (current < 0) current = 0;

        // 2. Survival Needs (Waterfall)
        const payBill = (amount) => {
            if (current >= amount) {
                current -= amount;
                return amount;
            } else {
                let paying = current;
                current = 0;
                return paying;
            }
        };

        valMakan = payBill(COST_MAKAN);
        valSembako = payBill(COST_SEMBAKO);
        valListrik = payBill(COST_LISTRIK);
        valKuota = payBill(COST_KUOTA);
        valInternet = payBill(COST_INTERNET);

        // 3. Orang Tua (30% dari Sisa)
        if (current > 0) {
            let budgetParents = current * 0.30;
            valIbu = budgetParents * (2 / 3);
            valAyah = budgetParents * (1 / 3);
            current -= budgetParents;
        }

        // 4. Nikah (50% dari Sisa)
        if (current > 0) {
            valNikah = current * 0.50;
            current -= valNikah;
        }

        // 5. Fun
        valFun = current;
    }

    // --- FINAL ADJUSTMENTS FOR DEBT ASSISTANCE ---

    // Initial Values before Cuts
    const initialNikah = valNikah;
    const initialFun = valFun;
    const initialCinema = initialFun * 0.30;
    const initialPersonal = initialFun * 0.70;

    // Logic Potongan (Tax for Mom)
    // 1. Potong 50% dari Dana Nikah (naik dari 20%)
    const cutNikah = initialNikah * 0.50;
    valNikah = initialNikah - cutNikah;

    // 2. Potong 40% dari Cinema
    const cutCinema = initialCinema * 0.40;
    const valFunCinema = initialCinema - cutCinema;

    // 3. Potong 40% dari Personal Allowance
    const cutPersonal = initialPersonal * 0.40;
    const valFunPersonal = initialPersonal - cutPersonal;

    // Total Bantuan Hutang Ibu
    const valDebtAssistance = cutNikah + cutCinema + cutPersonal;

    // --- RENDER CARDS (Individual Divs) ---
    resultDiv.classList.remove('hidden');
    html = ''; // Reset

    // Helper for specific colors
    const renderItem = (title, amount, color, icon, desc) => `
        <div class="card fade-in" style="border-left: 4px solid ${color}; padding: 15px; margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:600; color:#e2e8f0; font-size: 0.95rem;">
                    <i class="${icon}" style="margin-right:8px; width:20px; text-align:center; color:${color};"></i> ${title}
                </div>
                <div style="font-weight:bold; color:${color}; font-size: 1rem;">${formatRupiah(amount)}</div>
            </div>
            ${desc ? `<div style="font-size:0.8rem; color:#94a3b8; margin-top:5px; margin-left:32px;">${desc}</div>` : ''}
        </div>
    `;

    // 1. Zakat Profesi
    html += renderItem("Zakat Profesi", valZakat, "#ef4444", "fas fa-hand-holding-heart", "Pembersih harta (2.5%). Wajib dikeluarkan di awal.");

    // 2. Bensin
    html += renderItem("Bensin / Transport", valBensin, "#f97316", "fas fa-gas-pump", "Operasional harian bekerja.");

    // 3. Internet
    html += renderItem("Internet (WiFi)", valInternet, "#3b82f6", "fas fa-wifi", "Sarana produktivitas & hiburan di rumah.");

    // 4. Listrik
    html += renderItem("Listrik", valListrik, "#eab308", "fas fa-bolt", "Token listrik bulanan.");

    // 5. Kuota
    html += renderItem("Kuota Data", valKuota, "#3b82f6", "fas fa-mobile-alt", "Koneksi mobile saat di luar.");

    // 6. Makan
    html += renderItem("Uang Makan", valMakan, "#10b981", "fas fa-utensils", "Lauk pauk harian (Hemat/Masak sendiri).");

    // 7. Sembako
    html += renderItem("Sembako", valSembako, "#10b981", "fas fa-shopping-basket", "Beras, minyak, telur, dll.");

    // Separator Masa Depan
    html += `<div class="section-divider" style="margin-top:20px; color:#a78bfa;">MASA DEPAN & ORANG TUA</div>`;

    // 8. Dana Ikhtiar Menikah
    html += renderItem("Dana Ikhtiar Menikah", valNikah, "#ec4899", "fas fa-ring", "Dipotong 50% untuk bantu Ibu. Sisa dana bersih untuk menikah.");

    // 9. Nafkah Ibu Kandung
    html += renderItem("Nafkah Ibu Kandung", valIbu, "#d946ef", "fas fa-female", "Prioritas Utama (2/3 Bagian). Birrul walidain.");

    // NEW: Bantuan Pelunasan Hutang Ibu
    html += renderItem("Bantuan Pelunasan Hutang Ibu", valDebtAssistance, "#be185d", "fas fa-hand-sparkles", "Gabungan dari potongan Dana Nikah (50%), Bioskop (40%), dan Uang Jajan (40%).");

    // 10. Nafkah Ayah Kandung
    html += renderItem("Nafkah Ayah Kandung", valAyah, "#8b5cf6", "fas fa-male", "Tetap wajib dimuliakan (1/3 Bagian).");

    // Separator Hiburan
    html += `<div class="section-divider" style="margin-top:20px; color:#f472b6;">SELF REWARD</div>`;

    // 11. Budget Bioskop & Traktir (Reduced)
    html += renderItem("Budget Bioskop & Traktir", valFunCinema, "#f43f5e", "fas fa-film", "Dipotong 40% untuk bantu Ibu. Tetap cukup untuk refreshing.");

    // 12. Uang Jajan Pribadi Bulanan (Reduced)
    html += renderItem("Uang Jajan Pribadi Bulanan", valFunPersonal, "#fbbf24", "fas fa-wallet", "Dipotong 40% untuk bantu Ibu. Berkah untuk keluarga.");

    resultList.innerHTML = html;
}
