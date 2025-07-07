const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");

let allWorks = [];

const modal = document.getElementById("modal");
const modalCloseBtn = document.querySelector(".modal-close");
const modalGallery = document.getElementById("modal-gallery");

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
    createFilterButtons(categories);
    setupFilterListeners();
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

// Modal avec suppression et ajout des travaux de manière dynamique

function openModal() {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  displayModalWorks();
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", function (e) {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", function (e) {
  if (!modal.classList.contains("hidden") && e.key === "Escape") {
    closeModal();
  }
});

// Afficher les travaux dans la modal
function displayModalWorks() {
  modalGallery.innerHTML = "";
  allWorks.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const trashBtn = document.createElement("button");
    trashBtn.classList.add("delete-work-btn");
    trashBtn.setAttribute("aria-label", "Supprimer ce travail");
    trashBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    trashBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteWork(work.id, figure);
    });

    figure.appendChild(img);
    figure.appendChild(trashBtn);
    modalGallery.appendChild(figure);
  });

  const separator = document.createElement("div");
  separator.className = "modal-separator";
  separator.id = "modal-separator";
  modalGallery.parentNode.appendChild(separator);

  const addBtn = document.createElement("button");
  addBtn.id = "open-add-photo";
  addBtn.className = "modal-add-btn";
  addBtn.textContent = "Ajouter une photo";
  addBtn.addEventListener("click", showAddPhotoForm);
  modalGallery.parentNode.appendChild(addBtn);
}

// On supprime le travail

async function deleteWork(workId, figureElem) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté pour supprimer un travail.");
    return;
  }

  if (!confirm("Voulez-vous vraiment supprimer ce travail ?")) return;

  try {
    const res = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      figureElem.remove();

      allWorks = allWorks.filter((w) => w.id !== workId);
      displayWorks(allWorks);
    } else {
      alert("Erreur lors de la suppression.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }
}

function showAddPhotoForm() {
  const separator = document.getElementById("modal-separator");
  if (separator) separator.remove();
  const addBtn = document.getElementById("open-add-photo");
  if (addBtn) addBtn.remove();

  modalGallery.innerHTML = `
    <button type="button" id="back-to-gallery" class="modal-back-btn" aria-label="Retour à la galerie">
      <i class="fa-solid fa-arrow-left"></i>
    </button>
    <form id="add-photo-form" class="modal-form">
      <label for="photo-file" class="custom-file-label" id="custom-file-label">
        <i class="fa-regular fa-image"></i>
        <span>+ Ajouter photo</span>
        <span class="file-info">jpg, png : 4mo max</span>
        <input type="file" id="photo-file" name="image" accept="image/*" required>
        <img id="file-preview" class="file-preview" style="display:none;">
      </label>
      <label for="photo-title">Titre</label>
      <input type="text" id="photo-title" name="title" required>
      <label for="photo-category">Catégorie</label>
      <select id="photo-category" name="category" required>
        <option value=""></option>
      </select>
       <div class="modal-separator" id="modal-separator"></div>
      <button type="submit" class="modal-submit-btn">Valider</button>
    </form>
  `;

  // Récupération des catégories pour la modal

  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((categories) => {
      const select = document.getElementById("photo-category");
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des catégories :", error);
    });

  // Aperçu de l'image dans la modale

  const fileInput = document.getElementById("photo-file");
  const filePreview = document.getElementById("file-preview");
  const customFileLabel = document.getElementById("custom-file-label");
  const icon = customFileLabel.querySelector("i");
  const addText = customFileLabel.querySelector("span");
  const fileInfo = customFileLabel.querySelector(".file-info");

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        filePreview.src = e.target.result;
        filePreview.style.display = "block";
        icon.style.display = "none";
        addText.style.display = "none";
        fileInfo.style.display = "none";
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  // Bouton retour pour revenir à la page 1 de la modal
  document
    .getElementById("back-to-gallery")
    .addEventListener("click", displayModalWorks);

  const addPhotoForm = document.getElementById("add-photo-form");
  addPhotoForm.addEventListener("submit", handleAddPhotoSubmit);
}

async function handleAddPhotoSubmit(e) {
  e.preventDefault();

  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    return;
  }

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const newWork = await response.json();

      allWorks.push(newWork);

      displayWorks(allWorks);

      displayModalWorks();
    } else {
      alert("Erreur lors de l'ajout du travail.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }
}
