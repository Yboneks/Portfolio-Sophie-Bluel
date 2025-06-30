document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  fetch(`http://localhost:5678/api/users/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur dans l’identifiant ou le mot de passe");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("token", data.token);
      window.location.replace("index.html");
    })
    .catch((error) => {
      alert(error.message);
    });
});
