function showTab(tab) {
  const tabs = ['toko', 'produk', 'kategori'];
  tabs.forEach((name) => {
    const tabButton = document.getElementById(`tab-${name}`);
    const tabContent = document.getElementById(`content-${name}`);
    tabButton.classList.remove('text-[#f15a29]', 'font-semibold', 'border-b-2', 'border-[#f15a29]');
    tabContent.classList.add('hidden');
    tabContent.classList.remove('animate-slide-up');
  });

  const activeTabButton = document.getElementById(`tab-${tab}`);
  const activeTabContent = document.getElementById(`content-${tab}`);
  activeTabButton.classList.add('text-[#f15a29]', 'font-semibold', 'border-b-2', 'border-[#f15a29]');
  activeTabContent.classList.remove('hidden');
  activeTabContent.classList.add('animate-slide-up');
}

document.addEventListener("DOMContentLoaded", function () {
  showTab("toko");
});

function toggleMenu() {
  const menu = document.getElementById("dropdown-menu");
  menu.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("dropdown-menu");
  const button = event.target.closest("button");
  if (!menu.contains(event.target) && !button?.innerHTML.includes("ellipsis-v")) {
    menu.classList.add("hidden");
  }
});

function pilihKategori(kategori) {
  const hasil = document.getElementById("kategori-hasil");
  const spinner = document.getElementById("loading-spinner");
  hasil.innerHTML = "";
  spinner.classList.remove("hidden");

  setTimeout(() => {
    spinner.classList.add("hidden");
    let produkHTML = "";

    if (kategori === "Mod Motor") {
      produkHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">...</div>`;
    } else if (kategori === "Mod Mobil") {
      produkHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">...</div>`;
    }

    hasil.innerHTML = produkHTML;
  }, 500);
}

// ========================
// DATA PRODUK
// ========================
const produkData = [
  {
    id: 1,
    nama: "SHOCK 125Z ADJUSTABLE",
    harga: "Rp20.000",
    deskripsi: "Shock Adjustable untuk motor Vario 125/150.",
    gambar: ["shock 1.png", "shok 2.png"]
  },
  {
    id: 2,
    nama: "ARM NBR",
    harga: "Rp25.000",
    deskripsi: "Swing Arm NBR untuk Aerox new 155.",
    gambar: ["nbr1.png", "nbr2.png"]
  },
  {
    id: 3,
    nama: "KALIPER FORMULA 8.1",
    harga: "Rp25.000",
    deskripsi: "Kaliper formula 8.1, for disc kanan.",
    gambar: ["kaliper 1.png", "kaliper 2.png"]
  },
  {
    id: 4,
    nama: "UNDERBONE RCB",
    harga: "Rp20.000",
    deskripsi: "UNDERBONE RCB MX KING .",
    gambar: ["ub mx1.png", "ub mx2.png"]
  },
  {
    id: 5,
    nama: "RADIATOR VINS",
    harga: "Rp20.000",
    deskripsi: "RADIATOR VINS FOR AEROX NEW.",
    gambar: ["rd vins1.png", "rd vins2.png"]
  },
  {
    id: 6,
    nama: "FAIRING HEREX",
    harga: "Rp15.000",
    deskripsi: "FAIRING HEREX.",
    gambar: ["fairing 1.png", "fairing 2.png"]
  },
  {
    id: 7,
    nama: "TUTUP TANGKY TYGA",
    harga: "Rp15.000",
    deskripsi: "TUTUP TANGKI TYGA CNC COCOK BUAT GL PROMEX DAN NINJAMU MASSEH.",
    gambar: ["tutup tyga.png", "tutup tyga 2.png"]
  },
  {
    id: 8,
    nama: "VELG VND SIXSTARS V1",
    harga: "Rp20.000",
    deskripsi: "VELG EPENDI RING 17 COCOK BUAT M KING DAN NINJAMU BOLO.",
    gambar: ["vnd sx1.png", "vnd sx2.png"]
  },
  {
    id: 9,
    nama: "STABILIZERS MATRIS",
    harga: "Rp20.000",
    deskripsi: "STABILIZERS MATRIS COCOK BUAT PERNINJAAN DAN PER HEREXANMUU.",
    gambar: ["matris.jpg", "matris 2.jpg"]
  },
  {
    id: 10,
    nama: "VOLMETER",
    harga: "Rp10.000",
    deskripsi: "VOLMETER NIH COCOK BUAT MENAMBAH AKSESORIS BIAR KELIATAN RESING ABIEEZZ.",
    gambar: ["vl.png", "vl2.png"]
  },
  {
    id: 11,
    nama: "SWING ARM SHIJIRO COAK",
    harga: "Rp20.000",
    deskripsi: "SWING ARM COAX NIH COCOK BUAT GL MEX/PRO DAN SEJENISNYA.",
    gambar: ["arm sijiro 1.png", "arm sijiro 2.png"]
  },
  {
    id: 12,
    nama: "SWING ARM QTT",
    harga: "Rp20.000",
    deskripsi: "SWING ARM QTT COCOK NIH BUAT MOTOR BEBEK MU BOLO KAYA FIZ R DAN KAWAN KAWANNYA.",
    gambar: ["arm qtt 1.png", "arm qtt 2.png"]
  },
  {
    id: 13,
    nama: "VND KZR",
    harga: "Rp20.000",
    deskripsi: "VND KZR RING 17 NYA NIH COCOK BUAT ABANG ABANGAN VARIO .",
    gambar: ["vn kzr 1.png", "vnd kzr 2.png"]
  },
  {
    id: 14,
    nama: "RANGKA REBAH",
    harga: "Rp15.000",
    deskripsi: "RANGKA REBAH COCOK BUAT BASE VARIO .",
    gambar: ["rangka 2.png", "rangka 1.png"]
  },
  {
    id: 15,
    nama: "RADIATOR VND",
    harga: "Rp20.000",
    deskripsi: "RADIATOR VND NYA NIH COCOK BUAT NINJA.",
    gambar: ["rd1.png", "rd2.png"]
  },
  {
    id: 16,
    nama: "SWING ARM RACE PRO RX 01",
    harga: "Rp25.000",
    deskripsi: "SWING ARM CNC RACE PRO RX 1, COCOK BUAT PENJILAT VARIO.",
    gambar: ["arm race 1.png", "arm race2.png"]
  },
  {
    id: 17,
    nama: "TB CPO",
    harga: "Rp20.000",
    deskripsi: "TB CPO BARREL COCOK BUAT METIK BOR AP, MX KING JUGA MASUK TUNGGU AJA PASTI ADA UPDATE.",
    gambar: ["tb cpo 1.png", "tb cpo2.png"]
  },
  {
    id: 18,
    nama: "JOK SLIM",
    harga: "Rp15.000",
    deskripsi: "JOK SLIM CATUR FOR FIZ R DAN BEBEK SEJENISNYA.",
    gambar: ["jok slim1.png", "jok slim2.png"]
  },
  {
    id: 19,
    nama: "JOK GL MAX",
    harga: "Rp20.000",
    deskripsi: "JOK GL PRO/MAX SET FIBERNYA.",
    gambar: ["jok gl1.png", "jok gl2.png"]
  },
  {
    id: 20,
    nama: "JOK ARVI CATUR",
    harga: "Rp15.000",
    deskripsi: "JOK ARVI FOR NINJA SS/R MU MASSEH.",
    gambar: ["jok arvi ninja1.png", "jok arvi ninja2.png"]
  },
  {
    id: 21,
    nama: "COVER MESIN NINJA",
    harga: "Rp20.000",
    deskripsi: "COVER MESIN NINJA XYZ NYA ABANGKU, COCOK BUAT NNJA R/SS OLD.",
    gambar: ["manisan mesin ninja1.png", "manisan mesin ninja2.png"]
  },
  {
    id: 22,
    nama: "PIRINGAN MODENAS",
    harga: "Rp15.000",
    deskripsi: "DISC/PIRINGAN MODENAS NYA PNP METIK DOANG YAAA.",
    gambar: ["disc modenas1.png", "disc modenas2.png"]
  },
  {
    id: 23,
    nama: "BREKET SELANG REM",
    harga: "Rp15.000",
    deskripsi: "BREKET SELANG REM DEPAN GORILA.",
    gambar: ["brkt selang gorila1.png", "brkt selang gorila2.png"]
  },
  {
    id: 24,
    nama: "KNALPOT PEKAJAMAN",
    harga: "Rp20.000",
    deskripsi: "KNALPOT PEKAJAMAN KIDAL COCOK BUAT HEREX MU, TAPI G COCOK BUAT HEREX STEALER  .",
    gambar: ["pekajaman1.png", "pekajaman2.png"]
  },
  {
    id: 25,
    nama: "JOK OZZA",
    harga: "Rp20.000",
    deskripsi: "JOK OZZA FOR SUPRA KPH, TUNGGU AJA NANTI ADA UPDATENYAA.",
    gambar: ["jok ozza1.png", "jok ozza2.png"]
  },
  {
    id: 26,
    nama: "BAN MAXXIS VICTRA",
    harga: "Rp15.000",
    deskripsi: "BAN MAXXIS VICTRA RING 17, COCOK BUAT STELAN SR DI METIK KALIAN.",
    gambar: ["victra1.png", "victra2.png"]
  },
  {
    id: 27,
    nama: "KNALPOT RACING DGR",
    harga: "Rp20.000",
    deskripsi: "KNALPOT RACING DGR, BUAT BEAT KARBU KALIAN.",
    gambar: ["dgr1.png", "dgr2.png"]
  },
  {
    id: 28,
    nama: "SHOCK DEPAN LCM 27",
    harga: "Rp20.000",
    deskripsi: "SHOCK LCM NYA NICH COCOK BUAT YANG MAU NGONSEP VIETNAM.",
    gambar: ["lcm1.png", "lcm2.png"]
  },
  {
    id: 29,
    nama: "KALIPER FJN",
    harga: "Rp25.000",
    deskripsi: "KALIPER FJN INI BUAT DISC KIRI",
    gambar: ["fjn1.png", "fjn2.png"]
  },
  {
    id: 30,
    nama: "DISC PRC",
    harga: "Rp20.000",
    deskripsi: "DISC KIRI INI BUKAN KANAN",
    gambar: ["piringan prc1.png", "piringan prc2.png"]
  },
  
  
];

// ========================
// RENDER PRODUK
// ========================
function renderProduk() {
  const container = document.getElementById("produk-list");
  container.innerHTML = "";

  produkData.forEach(p => {
    const html = `
      <div class="bg-gray-100 rounded-lg p-2 shadow">
        <div class="relative overflow-hidden rounded mb-2">
          <div class="flex transition-transform duration-500 ease-in-out" id="carousel-${p.id}">
            ${p.gambar.map(src => `<img src="${src}" class="w-full object-cover flex-shrink-0" alt="${p.nama}" />`).join("")}
          </div>
          <button class="absolute top-1/2 left-1 transform -translate-y-1/2 bg-white/80 rounded-full p-1 text-black"
            onclick="geserKiri(${p.id})">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="absolute top-1/2 right-1 transform -translate-y-1/2 bg-white/80 rounded-full p-1 text-black"
            onclick="geserKanan(${p.id})">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <p class="text-sm font-medium text-black">${p.nama}</p>
        <p class="text-[#f15a29] font-bold text-sm">${p.harga}</p>

        <div class="flex space-x-2 mt-2">
          <button onclick="openPopup('${p.nama}', '${p.harga}', '${p.deskripsi}')"
            class="flex-1 px-3 py-1 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600">
            Detail
          </button>
          <a href="https://wa.me/6285773664846?text=Halo,%20saya%20ingin%20beli%20${encodeURIComponent(p.nama)}%20${encodeURIComponent(p.harga)}"
            target="_blank"
            class="flex-1 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 text-center">
            Beli
          </a>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}

renderProduk();

// ========================
// CAROUSEL
// ========================
const posisiSlide = {};
function geserKanan(id) {
  const container = document.getElementById(`carousel-${id}`);
  const total = container.children.length;
  posisiSlide[id] = (posisiSlide[id] || 0) + 1;
  if (posisiSlide[id] >= total) posisiSlide[id] = 0;
  container.style.transform = `translateX(-${posisiSlide[id] * 100}%)`;
}
function geserKiri(id) {
  const container = document.getElementById(`carousel-${id}`);
  const total = container.children.length;
  posisiSlide[id] = (posisiSlide[id] || 0) - 1;
  if (posisiSlide[id] < 0) posisiSlide[id] = total - 1;
  container.style.transform = `translateX(-${posisiSlide[id] * 100}%)`;
}

// ========================
// POPUP
// ========================
function openPopup(nama, harga, deskripsi) {
  document.getElementById("popupNama").textContent = nama;
  document.getElementById("popupHarga").textContent = harga;
  document.getElementById("popupDeskripsi").textContent = deskripsi;

  const modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function closePopup() {
  const modal = document.getElementById("popupModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}
