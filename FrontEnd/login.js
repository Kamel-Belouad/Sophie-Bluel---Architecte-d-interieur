async function authenticateUser(event) {
  event.preventDefault(); // Empêche l'envoi du formulaire

  const email = document.getElementById("email").value;
  const password = document.getElementById("motdepasse").value;

  const credentials = { email, password };

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("token", data.token); // Stocker le token dans le sessionStorage
      window.location.replace("index.html"); // Rediriger vers la page d'accueil
    } else {
      const errorData = await response.json();
      document.querySelector(".error").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    alert("Une erreur est survenue. Veuillez réessayer.");
  }
}

document
  .getElementById("loginForm")
  .addEventListener("submit", authenticateUser);
