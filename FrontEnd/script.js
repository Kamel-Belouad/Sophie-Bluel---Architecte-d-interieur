// Fonction pour récupérer les œuvres depuis le backend (version robuste)
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);
    return []; // <-- important pour que la modale ne plante pas
  }
}

// Fonction pour récupérer les catégories depuis le backend
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
