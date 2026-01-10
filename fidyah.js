// Format Currency
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Auto-format Input Price
const inputPrice = document.getElementById('mealPrice');
inputPrice.addEventListener('input', function (e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value) {
        this.value = new Intl.NumberFormat('id-ID').format(value);
    } else {
        this.value = '';
    }
});

function calculateFidyah() {
    const days = parseInt(document.getElementById('daysMissed').value);
    const reason = document.getElementById('reason').value;
    const rawPrice = document.getElementById('mealPrice').value.replace(/\./g, '');
    const pricePerMeal = parseFloat(rawPrice);

    if (!days || days <= 0) {
        alert("Masukkan jumlah hari yang valid.");
        return;
    }

    if (!pricePerMeal || pricePerMeal <= 0) {
        alert("Masukkan harga per porsi makan yang valid.");
        return;
    }

    let qadhaDays = 0;
    let fidyahAmount = 0;
    let message = "";
    let reasonText = "";

    // LOGIKA FIQIH (Mazhab Syafi'i Umum)

    if (reason === 'sakit_musafir') {
        // Sakit (Harapan Sembuh), Musafir, Haid/Nifas
        // Wajib: QADHA SAJA
        qadhaDays = days;
        fidyahAmount = 0;
        reasonText = "Sakit / Musafir / Haid";
        message = "Hanya wajib mengganti puasa di hari lain (Qadha).";
    }
    else if (reason === 'hamil_diri') {
        // Hamil/Menyusui (Khawatir Diri Sendiri)
        // Wajib: QADHA SAJA
        qadhaDays = days;
        fidyahAmount = 0;
        reasonText = "Hamil/Menyusui (Khawatir Diri Sendiri)";
        message = "Wajib Qadha puasa saja tanpa denda Fidyah.";
    }
    else if (reason === 'hamil_janin') {
        // Hamil/Menyusui (Khawatir Janin/Bayi saja)
        // Wajib: QADHA + FIDYAH
        qadhaDays = days;
        fidyahAmount = days * pricePerMeal;
        reasonText = "Hamil/Menyusui (Khawatir Janin/Bayi)";
        message = "Wajib Qadha puasa DAN membayar Fidyah karena kekhawatiran tertuju pada keselamatan janin/bayi.";
    }
    else if (reason === 'tua_sakit') {
        // Tua Renta / Sakit Menahun (Tidak harapan sembuh)
        // Wajib: FIDYAH SAJA
        qadhaDays = 0;
        fidyahAmount = days * pricePerMeal;
        reasonText = "Tua Renta / Sakit Menahun";
        message = "Tidak wajib puasa/qadha, cukup membayar Fidyah.";
    }

    // Render Logic
    const resultDiv = document.getElementById('result-container');
    const qadhaDisplay = document.getElementById('val-qadha');
    const fidyahDisplay = document.getElementById('val-fidyah');
    const noteDisplay = document.getElementById('note-result');

    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('fade-in');

    if (qadhaDays > 0) {
        qadhaDisplay.innerText = `${qadhaDays} Hari`;
        qadhaDisplay.parentElement.parentElement.classList.remove('hidden');
    } else {
        qadhaDisplay.parentElement.parentElement.classList.add('hidden'); // Hide Qadha card if 0
    }

    if (fidyahAmount > 0) {
        fidyahDisplay.innerText = formatRupiah(fidyahAmount);
        fidyahDisplay.parentElement.parentElement.classList.remove('hidden');
    } else {
        fidyahDisplay.parentElement.parentElement.classList.add('hidden'); // Hide Fidyah card if 0
    }

    noteDisplay.innerHTML = `<strong>Kondisi: ${reasonText}</strong><br>${message}`;
}
