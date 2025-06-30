const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");

let allWorks = [];

async function fetchData() {
  try {
    // Travaux
    const worksRes = await fetch("http://localhost:5678/api/works");
    const works = await worksRes.json();
    allWorks = works;
    displayWorks(allWorks);

    // Catégorie
    const catRes = await fetch("http://localhost:5678/api/categories");
    const categories = await catRes.json();
    createFilterButtons(categories); // Crée les boutons de filtre
    setupFilterListeners(); // Active les filtres
  } catch (error) {
    console.error("Erreur de chargement des données :", error);
  }
}

function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

function createFilterButtons(categories) {
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.dataset.id = 0;
  allBtn.classList.add("filter-btn", "active");
  filtersContainer.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.dataset.id = cat.id;
    btn.classList.add("filter-btn");
    filtersContainer.appendChild(btn);
  });
}

function setupFilterListeners() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const categoryId = parseInt(button.dataset.id);
      if (categoryId === 0) {
        displayWorks(allWorks);
      } else {
        const filtered = allWorks.filter(
          (work) => work.categoryId === categoryId
        );
        displayWorks(filtered);
      }
    });
  });
}

// Vérification de connexion + btn déconnexion + bannière + btn pour modale

function checkLoginStatus() {
  const token = sessionStorage.getItem("token");
  const loginLink = document.getElementById("login-link");

  if (!token) return;

  loginLink.textContent = "logout";
  loginLink.href = "#";
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token");
    window.location.reload();
  });

  const banner = document.createElement("div");
  banner.className = "admin-banner";
  banner.innerHTML = `<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>`;
  document.body.prepend(banner);

  const galleryHeader = document.querySelector(".gallery-header");

  if (galleryHeader) {
    const editBtn = document.createElement("a");
    editBtn.href = "#";
    editBtn.className = "edit-button";
    editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;
    galleryHeader.appendChild(editBtn);

    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }
}

// Lancement des fonctions au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  checkLoginStatus();
});
