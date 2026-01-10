// Format Currency
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Input Formatting
const inputSavings = document.getElementById('savingsAmount');
inputSavings.addEventListener('input', function (e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value) {
        this.value = new Intl.NumberFormat('id-ID').format(value);
    } else {
        this.value = '';
    }
});

function calculateSavings() {
    const rawValue = inputSavings.value.replace(/\./g, '');
    const total = parseFloat(rawValue);

    if (!total || total <= 0) {
        alert("Masukkan nominal dana tabungan yang valid.");
        return;
    }

    // RUMUS BARU: 6 PILAR MASA DEPAN (Total 100%)
    const posDarurat = total * 0.30;
    const posLahiran = total * 0.20;
    const posPendidikan = total * 0.15;
    const posInvestasi = total * 0.15;
    const posQurban = total * 0.10;
    const posSinking = total * 0.10;

    // Helper for cards
    const renderCard = (title, amount, color, priority, details) => `
        <div class="card fade-in" style="border-left: 4px solid ${color}; margin-bottom: 20px;">
            <div class="result-header">
                <div class="result-title">${title}</div>
                <div class="result-total" style="color: ${color};">${formatRupiah(amount)}</div>
            </div>
            <div class="priority-badge" style="background: rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15); color: ${color}; display:inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-bottom: 12px;">
                ${priority}
            </div>
            <div class="note-box" style="border-color: ${color}; color: #e2e8f0; background: rgba(30, 41, 59, 0.5); line-height: 1.6;">
                ${details}
            </div>
        </div>
    `;

    // Render
    const resultDiv = document.getElementById('result-container');
    const resultList = document.getElementById('result-list');
    resultDiv.classList.remove('hidden');

    // Header Intro
    let html = `
        <div class="card fade-in" style="background: linear-gradient(to right, #1e293b, #0f172a); border: 1px solid #334155; margin-bottom: 30px;">
            <h3 style="color: #10b981; margin-bottom: 10px;">📘 Blue Print Eksekusi</h3>
            <p style="font-size: 0.9rem; color: #94a3b8;">
                Ini adalah panduan tindakan nyata (Action Plan). Saya menerjemahkan angka menjadi strategi investasi syar'i agar uang Anda 'beranak-pinak' dengan berkah.
            </p>
        </div>
    `;

    html += `<div class="results-grid" style="display: grid; grid-template-columns: 1fr; gap: 20px;">`; // Force column for readability of long text? Or keep grid but maybe simpler? Let's use column for detailed plan.

    // GROUP 1: GARDA AMAN
    html += `<div class="section-divider" style="color:#94a3b8; border-bottom:1px solid #334155; padding-bottom:5px; margin-bottom:15px; grid-column: 1/-1;">KELOMPOK 1: GARDA AMAN (Likuid & Jangka Pendek)</div>`;

    // 1. Dana Darurat
    html += renderCard(
        "1. Dana Darurat (30%)",
        posDarurat,
        "#ef4444",
        "Prioritas: Mutlak (Hifz an-Nafs)",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Simpan di Mana?</strong>
                <ul>
                    <li>50% (${formatRupiah(posDarurat * 0.5)}) → <strong>Kantong Jago Syariah "DARURAT"</strong> (Wadiah/Titipan).</li>
                    <li>50% (${formatRupiah(posDarurat * 0.5)}) → <strong>Bibit: RDPU Syariah</strong>.</li>
                </ul>
            </li>
            <li><strong>Cara Kerja:</strong> RDPU (Reksadana Pasar Uang) memutar uang di Deposito Syariah/Sukuk <1th. Return setara 3-4% p.a. Cair H+1. Aman & Stabil.</li>
         </ul>`
    );

    // 5. Qurban (Moved to Group 1 visually per logic)
    html += renderCard(
        "2. Tabungan Qurban (10%)",
        posQurban,
        "#10b981",
        "Prioritas: Sunnah Muakkad",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Simpan di Mana?</strong> <strong>Kantong Jago Syariah "QURBAN"</strong>.</li>
            <li><strong>Cara Kerja:</strong> Saving biasa. Target: Saat Idul Adha saldo cukup untuk 1 Kambing/Sapi Patungan terbaik tanpa mengganggu uang dapur.</li>
         </ul>`
    );

    // 6. Sinking Fund (Moved to Group 1)
    html += renderCard(
        "3. Sinking Fund (10%)",
        posSinking,
        "#f59e0b",
        "Prioritas: Kewajiban & Adab",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Simpan di Mana?</strong> <strong>Kantong Jago Syariah "SERVIS & PAJAK"</strong>.</li>
            <li><strong>Cara Kerja:</strong> Dana 'Parkir'. Ambil dari sini saat STNK mati, ban bocor, atau servis rutin.</li>
         </ul>`
    );

    // GROUP 2: MESIN PERTUMBUHAN
    html += `<div class="section-divider" style="color:#94a3b8; border-bottom:1px solid #334155; padding-bottom:5px; margin-top: 20px; margin-bottom:15px; grid-column: 1/-1;">KELOMPOK 2: MESIN PERTUMBUHAN (Investasi Menengah - Panjang)</div>`;

    // 2. Lahiran
    html += renderCard(
        "4. Lahiran & Aqiqah (20%)",
        posLahiran,
        "#ec4899",
        "Prioritas: Wajib/Hajat (1-2 Tahun)",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Simpan di Mana?</strong> <strong>Bibit: RDPU Syariah</strong>.</li>
            <li style="margin-bottom: 8px;"><strong>Kenapa?</strong> Risiko sangat rendah (hampir mustahil turun), hasil diatas bank. Cairkan saat istri hamil 9 bulan.</li>
         </ul>`
    );

    // 3. Pendidikan
    html += renderCard(
        "5. Pendidikan Anak (15%)",
        posPendidikan,
        "#3b82f6",
        "Prioritas: Hifz al-Aql (Jangka 7 Thn)",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Simpan di Mana?</strong> <strong>Bibit: RDPT (Pendapatan Tetap) Syariah</strong>.</li>
            <li style="margin-bottom: 8px;"><strong>Cara Kerja:</strong> Uang dibelikan <strong>Sukuk Korporasi</strong> (Surat Hutang Syariah PLN/Indosat, dll).</li>
            <li><strong>Hasil:</strong> Bagi hasil sewa/kupon 5-7% p.a. Biarkan <i>Compound Interest</i> bekerja membesarkan modal sekolah anak.</li>
         </ul>`
    );

    // 4. Investasi
    html += renderCard(
        "6. Investasi Masa Depan (15%)",
        posInvestasi,
        "#8b5cf6",
        "Prioritas: Hifz al-Mal (Passive Income)",
        `<ul style="padding-left: 15px; margin: 0; font-size: 0.85rem;">
            <li style="margin-bottom: 8px;"><strong>Strategi:</strong> "Kumpul & Tembak" <strong>Sukuk Negara</strong>.</li>
            <li style="margin-bottom: 8px;"><strong>Taktik:</strong> Tabung di Jago "PENAMPUNGAN". Saat terkumpul Rp 1 Juta (tiap 3-4 bulan) → Beli <strong>ST/SR/ORI (Sukuk Negara)</strong>.</li>
            <li><strong>Hasil:</strong> Negara membayar "Uang Sewa" (Kupon) tiap bulan ke rekening Anda. Aman dijamin Undang-Undang.</li>
         </ul>`
    );

    html += `</div>`; // Close grid
    resultList.innerHTML = html;
}

// Check for URL params and Auto Calculate
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');

    if (amount) {
        // Fill input
        const numericValue = parseInt(amount, 10);
        if (!isNaN(numericValue)) {
            inputSavings.value = new Intl.NumberFormat('id-ID').format(numericValue);
            // Trigger Calc
            calculateSavings();
        }
    }
});
