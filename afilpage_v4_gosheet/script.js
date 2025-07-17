const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwXMrUQO3Gc_ph7mmwKauTd5cMIFsP8fSaRnM_77_p_mb1RgxcEXF2R111qvlwQlWB_/exec";

document.addEventListener("DOMContentLoaded", () => {
  const produkForm = document.getElementById("produkForm");
  if (produkForm) {
    produkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = document.getElementById("nama").value;
      const harga = document.getElementById("harga").value;
      const kategori = document.getElementById("kategori").value;
      const link = document.getElementById("link").value;
      const gambarInput = document.getElementById("gambar");
      const reader = new FileReader();

      reader.onloadend = () => {
        const gambarBase64 = reader.result;
        const produk = { nama, harga, kategori, link, gambar: gambarBase64 };
        simpanLocal(produk);
        simpanKeSheet(produk);
        alert("Produk berhasil disimpan!");
        produkForm.reset();
      };
      reader.readAsDataURL(gambarInput.files[0]);
    });
  }

  tampilkanProduk();
});

function simpanLocal(produk) {
  const data = JSON.parse(localStorage.getItem("produkList") || "[]");
  data.push(produk);
  localStorage.setItem("produkList", JSON.stringify(data));
}

async function simpanKeSheet(produk) {
  try {
    await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produk)
    });
  } catch (err) {
    console.error("Gagal kirim ke Sheet", err);
  }
}

function tampilkanProduk() {
  const listContainer = document.getElementById("produkList");
  const searchInput = document.getElementById("search");
  const filterKategori = document.getElementById("filterKategori");
  if (!listContainer) return;

  const data = JSON.parse(localStorage.getItem("produkList") || "[]");

  const kategoriSet = new Set();
  data.forEach(p => kategoriSet.add(p.kategori));
  kategoriSet.forEach(kat => {
    const opt = document.createElement("option");
    opt.value = kat;
    opt.textContent = kat;
    filterKategori.appendChild(opt);
  });

  function render() {
    const search = searchInput.value.toLowerCase();
    const kategori = filterKategori.value;
    listContainer.innerHTML = "";

    data
      .filter(p => 
        (p.nama.toLowerCase().includes(search) || p.kategori.toLowerCase().includes(search)) &&
        (kategori === "" || p.kategori === kategori)
      )
      .forEach(p => {
        const div = document.createElement("div");
        div.className = "produk-item";
        div.innerHTML = `
          <strong>${p.nama}</strong><br/>
          Harga: Rp${p.harga}<br/>
          Kategori: ${p.kategori}<br/>
          <a href="${p.link}" target="_blank">🔗 Link</a><br/>
          <img src="${p.gambar}" alt="${p.nama}" />
        `;
        listContainer.appendChild(div);
      });
  }

  searchInput && searchInput.addEventListener("input", render);
  filterKategori && filterKategori.addEventListener("change", render);
  render();
}
