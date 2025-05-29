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
    const categorySelect = document.getElementById("categorySelection");

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
    document.querySelector(".filters").style.display = "none";
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
checkUserAuth();
