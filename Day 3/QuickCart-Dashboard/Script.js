const apiEndpoint = "https://fakestoreapi.com/products";

let masterCatalog = [];
let visibleCatalog = [];
let cartTracker = 0;

let stateManager = {
  keyword: "",
  category: "all",
  sortMode: "none"
};

bootSequence();

async function bootSequence() {
  toggleLoader(true);

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error();

    masterCatalog = await response.json();
    visibleCatalog = [...masterCatalog];

    populateCategories();
    renderEngine();

  } catch (err) {
    document.getElementById("errorSignal").innerText = "Failed to load products";
  }

  toggleLoader(false);
}

function populateCategories() {
  const uniqueSet = new Set(masterCatalog.map(p => p.category));
  const dropdown = document.getElementById("categorySwitch");

  uniqueSet.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.innerText = cat;
    dropdown.appendChild(opt);
  });
}

function renderEngine() {
  let pipeline = [...masterCatalog];

  if (stateManager.category !== "all") {
    pipeline = pipeline.filter(item => item.category === stateManager.category);
  }

  if (stateManager.keyword !== "") {
    pipeline = pipeline.filter(item =>
      item.title.toLowerCase().includes(stateManager.keyword)
    );
  }

  if (stateManager.sortMode === "asc") {
    pipeline.sort((a, b) => a.price - b.price);
  } else if (stateManager.sortMode === "desc") {
    pipeline.sort((a, b) => b.price - a.price);
  }

  visibleCatalog = pipeline;
  paintUI();
}

function paintUI() {
  const zone = document.getElementById("productZone");
  zone.innerHTML = "";

  visibleCatalog.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-md-3 mb-3";

    col.innerHTML = `
      <div class="card p-2 h-100">
        <img src="${product.image}">
        <h6>${product.title.substring(0, 40)}...</h6>
        <p>₹ ${product.price}</p>
        <button class="btn btn-sm btn-primary mb-1" onclick="cartPulse()">Add</button>
        <button class="btn btn-sm btn-dark" onclick="openDetailPanel(${product.id})">View</button>
      </div>
    `;

    zone.appendChild(col);
  });
}

function cartPulse() {
  cartTracker++;
  document.getElementById("cartMeter").innerText = cartTracker;
}

function openDetailPanel(productId) {
  const productData = masterCatalog.find(p => p.id === productId);

  const modalInstance = new bootstrap.Modal(
    document.getElementById("detailBox")
  );

  document.getElementById("detailContent").innerHTML = `
    <img src="${productData.image}" class="w-100 mb-3" style="height:200px;object-fit:contain;">
    <h6>${productData.title}</h6>
    <p><b>Description:</b><br>${productData.description}</p>
    <p><b>Price:</b> ₹${productData.price}</p>
    <p><b>Rating:</b> ⭐ ${productData.rating.rate}</p>
  `;

  modalInstance.show();
}

function toggleLoader(flag) {
  document.getElementById("loadingSignal").style.display = flag ? "block" : "none";
}

document.getElementById("finderBox").addEventListener("input", (e) => {
  stateManager.keyword = e.target.value.toLowerCase();
  renderEngine();
});

document.getElementById("categorySwitch").addEventListener("change", (e) => {
  stateManager.category = e.target.value;
  renderEngine();
});

document.getElementById("priceOrder").addEventListener("change", (e) => {
  stateManager.sortMode = e.target.value;
  renderEngine();
});