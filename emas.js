// Format Currency
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Input Formatting
const inputBudget = document.getElementById('budgetAmount');
const inputPrice = document.getElementById('goldPrice');

function formatNativeInput(el) {
    el.addEventListener('input', function (e) {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value) {
            this.value = new Intl.NumberFormat('id-ID').format(value);
        } else {
            this.value = '';
        }
    });
}

formatNativeInput(inputBudget);
formatNativeInput(inputPrice);

// API FETCH LOGIC
async function fetchGoldPrice() {
    const statusEl = document.getElementById('api-status');
    const priceInput = document.getElementById('goldPrice');

    statusEl.innerText = "Mengambil data harga...";
    statusEl.style.color = "#f59e0b"; // Orange

    try {
        // Option 1: Logam Mulia (Unofficial Mirror) or Global API converted
        // Using a reliable free open endpoint for demonstration:
        // Note: Real free CORS-enabled gold APIs in IDR are rare. 
        // We will mock a reliable fallback if this specific endpoint fails or is blocked.

        // Trying a common data source (GoldPrice.org often has an endpoint)
        // Or using a static fallback if fetch fails to avoid breaking the UI.

        // Let's try to fetch from a public simulator or use a sophisticated fallback logic.
        // For this local file app, we will simulate a fetch or use a stable approximated value 
        // because we can't guarantee 'file://' CORS permissions for all APIs.

        // However, I will implement a real fetch attempt to 'https://api.metalpriceapi.com' or similar if they had a free keyless access, 
        // but most require keys.
        // Let's use a "Simulated Live" approach for safety, effectively defaulting to a recent market price,
        // but allowing the user to click "Update" if they have a custom API source or just input manually.

        // User requested "Integrated with public API".
        // Let's try a known open endpoint:
        const response = await fetch('https://data-asg.goldprice.org/dbXRates/IDR');
        // This endpoint usually restricts referrers, so it might fail.

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        // data.items[0].xauPrice is usually per ounce in IDR.
        // 1 Troy Ounce = 31.1035 grams.

        if (data.items && data.items[0] && data.items[0].xauPrice) {
            const pricePerOunce = data.items[0].xauPrice;
            const pricePerGram = pricePerOunce / 31.1035;

            priceInput.value = formatRupiah(pricePerGram).replace('Rp', '').trim(); // Keep formatting
            statusEl.innerText = "Data Terupdate (Live).";
            statusEl.style.color = "#10b981"; // Green
        } else {
            throw new Error("Invalid Data");
        }

    } catch (error) {
        console.log("Fetch failed, using fallback:", error);
        // Fallback Price (Approximate Antam Price)
        // user can edit this manually
        const fallback = 1540000; // Contoh harga saat ini
        if (inputPrice.value === '') {
            inputPrice.value = new Intl.NumberFormat('id-ID').format(fallback);
        }
        statusEl.innerText = "Mode Manual (Gagal mengambil data live). Silakan input harga emas hari ini.";
        statusEl.style.color = "#ef4444"; // Red
    }
}

function calculateGold() {
    // Get numeric values
    const budgetRaw = inputBudget.value.replace(/\./g, '');
    const priceRaw = inputPrice.value.replace(/\./g, '');

    const budget = parseFloat(budgetRaw);
    const price = parseFloat(priceRaw);

    if (!budget || budget <= 0) {
        alert("Masukkan nominal rupiah yang ingin ditabung.");
        return;
    }
    if (!price || price <= 0) {
        alert("Masukkan harga emas per gram yang valid.");
        return;
    }

    const grams = budget / price;

    // Antam denominators usually: 0.5, 1, 2, 3, 5, 10, 25, 50, 100
    // But we focus on total accumulation.

    const resultDiv = document.getElementById('result-container');
    const gramResult = document.getElementById('gram-result');
    const gramTotal = document.getElementById('gram-total'); // Just mirrors the result for now, or accumulation logic?

    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('fade-in');

    gramResult.innerHTML = `
        <span style="font-size: 2.5rem; color: var(--gold);">${grams.toFixed(4)}</span> <span style="font-size: 1.2rem; color: #94a3b8;">gram</span>
    `;

    // Motivation
    const motivation = document.getElementById('motivation-text');
    motivation.innerText = `Alhamdulillah! Dengan uang ${formatRupiah(budget)}, Anda telah mengamankan aset senilai ${grams.toFixed(3)} gram emas.`;
}

// Auto-fetch on load (Attempt)
document.addEventListener('DOMContentLoaded', () => {
    fetchGoldPrice();
});
