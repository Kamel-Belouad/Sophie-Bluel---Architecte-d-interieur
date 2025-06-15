//récupérer les œuvres depuis le backend
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);
    return [];
  }
}

// récupérer les catégories depuis le backend
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    throw error;
  }
}

// Fonction pour charger les catégories comme des  filtres cliquables
async function loadCategories() {
  try {
    const categories = await fetchCategories();

    const categoryFilters = document.getElementById("categoryFilters");

    // Boutons filtres
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.classList.add("filter-btn");
      button.dataset.category = category.id;
      button.textContent = category.name;
      button.addEventListener("click", () => {
        loadGallery(category.id);
      });
      categoryFilters.appendChild(button);
    });

    // Options dans le formulaire
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  }
}

// Fonction pour afficher les œuvres dans la galerie
async function loadGallery(categoryId = "all") {
  try {
    const data = await fetchWorks();
    const gallery = document.querySelector("#portfolio .gallery");
    gallery.innerHTML = "";

    // Filtrer les œuvres selon la catégorie sélectionnée
    const filteredWorks =
      categoryId === "all"
        ? data
        : data.filter((item) => item.category.id === parseInt(categoryId));

    // Ajouter les éléments filtrés à la galerie
    filteredWorks.forEach((item) => {
      gallery.innerHTML += `
        <figure data-id="${item.id}" data-category="${item.category.id}">
          <img src="${item.imageUrl}" alt="${item.title}">
          <figcaption>${item.title}</figcaption>
        </figure>
      `;
    });
  } catch (error) {
    console.error("Erreur lors du chargement de la galerie:", error);
  }
}

// Ajouter un écouteur d'événements pour le bouton "Tous les travaux"
document
  .querySelector(".filter-btn[data-category='all']")
  .addEventListener("click", () => {
    loadGallery("all"); // Afficher toutes les œuvres
  });
loadCategories();
loadGallery();

function checkUserAuth() {
  const authLink = document.getElementById("authLink");
  const token = sessionStorage.getItem("token"); //  token du session storage

  if (token) {
    authLink.textContent = "logout"; // Affiche "logout"
    authLink.onclick = logout;
    const body = document.querySelector("body");
    const editBar = document.createElement("div");
    const modalMode = document.createElement("p");
    editBar.className = "editBar";
    modalMode.className = "modal-mode";
    modalMode.innerHTML = `<i class="fa-regular fa-pen-to-square"></i><span>Mode édition</span>`;

    body.insertAdjacentElement("afterbegin", editBar);

    editBar.append(modalMode);
    document.body.style.paddingTop = editBar.offsetHeight + "px";
    const modifier = `
  <div class="modifier-block" id="openModalBtn">
    <i class="fa-regular fa-pen-to-square"></i>
    <span>Modifier</span>
  </div>
`;
    document
      .querySelector(".projets-container")
      .insertAdjacentHTML("beforeend", modifier);
    const openModalBtn = document.getElementById("openModalBtn");

    if (openModalBtn) {
      openModalBtn.addEventListener("click", () => {
        document.getElementById("photoGallery").style.display = "flex";
      });
    }
  } else {
    authLink.textContent = "login"; // Affiche "login" si l'utilisateur n'est pas connecté
    authLink.onclick = () => (window.location.href = "login.html"); // Rediriger vers la page de login
  }
}
function logout(event) {
  event.preventDefault();
  sessionStorage.removeItem("token"); // Supprime le token du sessionStorage
  window.location.href = "index.html"; // Redirige l'utilisateur vers la page d'accueil
}

async function displayModalContent() {
  const modalContent = document.querySelector(".modalContent");
  modalContent.innerHTML = "";
  const works = await fetchWorks();
  works.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const span = document.createElement("span");
    const trash = document.createElement("i");
    trash.classList.add("fa-solid", "fa-trash-can");
    trash.id = work.id;
    img.src = work.imageUrl;
    span.appendChild(trash);
    figure.appendChild(span);
    figure.appendChild(img);
    modalContent.appendChild(figure);
  });
}
displayModalContent();

// Fermeture en cliquant x de la fenêtre modale
document.getElementById("closeGallery")?.addEventListener("click", () => {
  document.getElementById("photoGallery").style.display = "none";
});
// Fermeture en cliquant en dehors de la fenêtre modale
document.getElementById("photoGallery").addEventListener("click", (event) => {
  const modalWindow = document.querySelector("#photoGallery .modalWindow");

  if (!modalWindow.contains(event.target)) {
    document.getElementById("photoGallery").style.display = "none";
  }
});

document.getElementById("openAddForm")?.addEventListener("click", () => {
  document.getElementById("photoGallery").style.display = "none";
  document.getElementById("addPhotoModal").style.display = "flex";
});
document.getElementById("backToGallery")?.addEventListener("click", () => {
  document.getElementById("addPhotoModal").style.display = "none";
  document.getElementById("photoGallery").style.display = "flex";
});
document.getElementById("closeAddForm")?.addEventListener("click", () => {
  document.getElementById("addPhotoModal").style.display = "none";
});

function closeModalOnClickOutside() {
  const addPhotoModal = document.getElementById("addPhotoModal");

  // Fermer la modale "ajout photo" si l'utilisateur clique en dehors de la fenêtre modale
  addPhotoModal?.addEventListener("click", (event) => {
    const modalWindow = addPhotoModal.querySelector(".window");

    // Si le clic est en dehors de la fenêtre interne de la modale
    if (!modalWindow.contains(event.target)) {
      addPhotoModal.style.display = "none"; // Ferme la modale
    }
  });
}

window.onload = () => {
  checkUserAuth();

  // Fermer les modales au chargement de la page
  const addPhotoModal = document.getElementById("addPhotoModal");

  if (addPhotoModal) addPhotoModal.style.display = "none";
  closeModalOnClickOutside();

  const galleryOpened = sessionStorage.getItem("galleryOpened");

  if (galleryOpened === "true") {
    // Afficher la galerie
    document.getElementById("photoGallery").style.display = "flex";

    sessionStorage.removeItem("galleryOpened");
  } else {
    document.getElementById("photoGallery").style.display = "none";
  }
};
// suppression d'un travail depuis la modale
function deletingWorks() {
  const modalContent = document.querySelector(".modalContent");
  const token = sessionStorage.getItem("token");
  modalContent.addEventListener("click", async (e) => {
    const trashIcon = e.target.closest(".fa-trash-can");
    if (!trashIcon) return;

    const workId = trashIcon.id;

    if (!token) {
      alert("Vous devez être connecté pour supprimer un travail.");
      return;
    }

    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette image ?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5678/api/works/${workId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const figureToDelete = trashIcon.closest("figure");
        if (figureToDelete) figureToDelete.remove();

        const galleryFigure = document.querySelector(
          `.gallery figure[data-id='${workId}']`
        );
        if (galleryFigure) galleryFigure.remove();
      } else {
        throw new Error("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Impossible de supprimer l'image.");
    }
  });
}
deletingWorks();

const fileInput = document.getElementById("file");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("categorySelection");
const submitButton = document.getElementById("valider");

function checkFormValidity() {
  if (
    fileInput.files.length > 0 &&
    titleInput.value.trim() !== "" &&
    categorySelect.value !== ""
  ) {
    submitButton.disabled = false;
    submitButton.classList.add("active"); // Pour style visuel
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("active");
  }
}

[fileInput, titleInput, categorySelect].forEach((input) =>
  input.addEventListener("input", checkFormValidity)
);
// Preview image quand on choisit un fichier
document.getElementById("file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const preview = document.getElementById("preview");
  const addButton = document.getElementById("add"); // bouton "Ajouter une photo"
  const imageIcon = addButton.previousElementSibling; // L'icône de la caméra

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block"; // Afficher  l'image
      addButton.style.display = "none"; // Masquer le texte "Ajouter une photo"
      imageIcon.style.display = "none"; // Masquer l'icône de la caméra
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none"; // Cacher l'aperçu si aucune image n'est choisie
    addButton.style.display = "block"; // Afficher le bouton "Ajouter une photo"
    imageIcon.style.display = "inline"; // Afficher l'icône de la caméra
  }
});

document
  .querySelector(".addImage form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const token = sessionStorage.getItem("token");

    if (!file || !title || !category) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi");

      const newWork = await response.json();

      // Ajouter dynamiquement à la galerie principale
      addWorkToGallery(newWork);

      // Ajouter dynamiquement à la modale
      addWorkToModal(newWork);

      // Réinitialiser le formulaire
      e.target.reset();
      document.getElementById("preview").style.display = "none";
      submitButton.disabled = true;
      submitButton.classList.remove("active");

      // Fermer  les modales
      document.getElementById("addPhotoModal").style.display = "none";
      document.getElementById("photoGallery").style.display = "none";

      await loadGallery();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image :", error);
      alert("Une erreur est survenue lors de l'ajout de l'image.");
    }
  });

function addWorkToGallery(work) {
  const gallery = document.querySelector("#portfolio .gallery");

  const figure = document.createElement("figure");
  figure.setAttribute("data-id", work.id);
  figure.setAttribute("data-category", work.categoryId);

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure);
}

function addWorkToModal(work) {
  const modalContent = document.querySelector(".modalContent");

  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const span = document.createElement("span");
  const trash = document.createElement("i");

  trash.classList.add("fa-solid", "fa-trash-can");
  trash.id = work.id;
  img.src = work.imageUrl;

  span.appendChild(trash);
  figure.appendChild(span);
  figure.appendChild(img);
  modalContent.appendChild(figure);
}
