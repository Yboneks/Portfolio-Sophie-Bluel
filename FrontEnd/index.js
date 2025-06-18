async function fetchData() {
  await fetch("http://localhost:5678/api/works")
    .then((res) => res.json())
    .then((data) => {
      displayWorks(data);
    })
    .catch((error) => {
      console.error("Erreur de chargement des données :", error);
    });
}

fetchData();

const gallery = document.querySelector(".gallery");

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
