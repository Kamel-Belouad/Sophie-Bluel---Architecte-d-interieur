// Fonction pour récupérer les œuvres depuis le backend
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);
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
