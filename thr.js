// Logic khusus THR
// Shared helper
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Auto-format Input
const inputThr = document.getElementById('thrAmount');
inputThr.addEventListener('input', function (e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value) {
        this.value = new Intl.NumberFormat('id-ID').format(value);
    } else {
        this.value = '';
    }
});

function calculateTHR() {
    const rawValue = inputThr.value.replace(/\./g, '');
    const total = parseFloat(rawValue);

    if (!total || total <= 0) {
        alert("Masukkan nominal THR yang valid.");
        return;
    }

    // ALGORITMA PEMBAGIAN THR KEADILAN SOSIAL KELUARGA
    // Total = 100%

    // 1. Istri & Anak (40%) - Paling besar karena operasional lebaran ada disini
    // (Baju baru, kue, masak opor, mudik)
    const posIstri = total * 0.40;

    // 2. Orang Tua Kandung (25%)
    // Ibu (70% dari 25%) - Janda, butuh lebih.
    // Ayah (30% dari 25%) - Sekadar angpao hormat.
    const posOrtu = total * 0.25;
    const valIbu = posOrtu * 0.70;
    const valAyah = posOrtu * 0.30;

    // 3. Mertua (15%)
    // Dibagi rata ayah/ibu mertua atau hampers keluarga.
    const posMertua = total * 0.15;

    // 4. Saudara Kandung (10%)
    // Kakak (Mapan): Cukup Hampers/Hadiah Simbolis (30% dari pos saudara)
    // Adik Tiri (Mahasiswa): Butuh cash/sangu (70% dari pos saudara)
    const posSaudara = total * 0.10;
    const valKakak = posSaudara * 0.30;
    const valAdik = posSaudara * 0.70;

    // 5. Sedekah & Lainnya (10%)
    // Zakat, Ponakan lain, Tetangga.
    const posLain = total * 0.10;

    // Render
    const resultDiv = document.getElementById('result-container');
    const resultList = document.getElementById('result-list');

    resultDiv.classList.remove('hidden');
    resultList.innerHTML = `
        <div class="card fade-in section-wife">
            <div class="result-header">
                <div class="result-title">Rumah Tangga (Istri & Anak)</div>
                <div class="result-total">${formatRupiah(posIstri)}</div>
            </div>
            <div class="note-box">
                Alokasi: Baju lebaran anak/istri, Kue, Masakan Lebaran, & Salam Tempel anak.
            </div>
        </div>

        <div class="results-grid">
            <div class="card fade-in section-mother">
                <div class="result-header">
                    <div class="result-title">Ibu Kandung</div>
                    <div class="result-total">${formatRupiah(valIbu)}</div>
                </div>
                <div class="note-box">
                    Prioritas tinggi (Janda). Berikan dalam bentuk Cash segar + Hampers sembako.
                </div>
            </div>

            <div class="card fade-in section-father">
                <div class="result-header">
                    <div class="result-title">Ayah Kandung</div>
                    <div class="result-total">${formatRupiah(valAyah)}</div>
                </div>
                <div class="note-box">
                    Angpao penghormatan & silaturahim.
                </div>
            </div>

            <div class="card fade-in section-mother">
                <div class="result-header">
                    <div class="result-title">Mertua</div>
                    <div class="result-total">${formatRupiah(posMertua)}</div>
                </div>
                <div class="note-box">
                    Hampers/Hadiah untuk keluarga istri.
                </div>
            </div>

            <div class="card fade-in section-savings">
                <div class="result-header">
                    <div class="result-title">Saudara (Kakak & Adik)</div>
                    <div class="result-total">${formatRupiah(posSaudara)}</div>
                </div>
                <ul class="breakdown-list" style="margin-top:10px;">
                    <li class="breakdown-item">
                        <span>Adik Tiri (Mahasiswa)</span>
                        <span class="breakdown-value">${formatRupiah(valAdik)}</span>
                    </li>
                    <li class="breakdown-item">
                        <span>Kakak (Mapan)</span>
                        <span class="breakdown-value">${formatRupiah(valKakak)} (Ganti Hampers)</span>
                    </li>
                </ul>
                <div class="note-box">
                    Adik prioritas Cash. Kakak prioritas Barang/Kenang-kenangan.
                </div>
            </div>

            <div class="card fade-in section-savings card-full-width">
                <div class="result-header">
                    <div class="result-title">Sedekah & Zakat</div>
                    <div class="result-total">${formatRupiah(posLain)}</div>
                </div>
                <div class="note-box">
                    Zakat Mal (jika hisab), Sedekah Subuh, & THR satpam/tetangga.
                </div>
            </div>
        </div>
    `;
}
