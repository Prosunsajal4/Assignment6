fetch("https://openapi.programming-hero.com/api/categories")
  .then((res) => res.json())
  .then((data) => displayButtons(data.categories));

displayButtons = (categories) => {
  const categoryContainer = document.getElementById("button-container");

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.innerText = category.category_name;
    button.classList =
      "w-full rounded-2 category-btn text-left py-1 px-1 rounded-sm";

    button.onclick = () => {
      loadPlants(category.id);
      document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("bg-green-700", "text-white");
      });

      button.classList.add("bg-green-700", "text-white");
      button.classList.remove("bg-gray-200", "text-black");
    };

    categoryContainer.appendChild(button);
  });
};

function loadPlants(categoryId) {
  manageSpinner(true);
  fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
    .then((res) => res.json())
    .then((data) => displayPlants(data.plants));
}

function displayPlants(plants) {
  const cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = "";

  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.classList = "bg-white rounded-md p-5 space-y-3 shadow-md";

    card.innerHTML = `
      <img src="${plant.image}" class="w-full h-32 object-cover mb-3 rounded-md" alt="">
      <p class="text-xl font-bold cursor-pointer hover:text-green-600" id="plant-name-${plant.id}">${plant.name}</p>
      <p class="text-[12px]">${plant.description}</p>
      <div class="flex justify-between items-center">
        <p class="bg-green-100 w-fit px-1 py-1 rounded-xl">${plant.category}</p>
        <p>$${plant.price}</p>
      </div>
      <button class="btn cart-btn bg-green-900 rounded-3xl w-full mt-1">
        <span class="text-white">Add To Cart</span>
      </button>
    `;

    cardContainer.appendChild(card);

    document
      .getElementById(`plant-name-${plant.id}`)
      .addEventListener("click", () => {
        fetch(`https://openapi.programming-hero.com/api/plant/${plant.id}`)
          .then((res) => res.json())
          .then((data) => showPlantModal(data.plants));
      });
  });
  manageSpinner(false);
}

function showPlantModal(plant) {
  const modalContainer = document.getElementById("plant-modal-container");
  modalContainer.innerHTML = `
    <input type="checkbox" id="plant-modal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box relative max-w-lg">
        <label for="plant-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-2xl font-bold mb-3">${plant.name}</h3>
        <img src="${plant.image}" class="w-full h-48 object-cover rounded-md mb-3" alt="${plant.name}" />
        <p class="mb-2"><strong>Category:</strong> ${plant.category}</p>
        <p class="mb-2"><strong>Price:</strong> $${plant.price}</p>
        <p class="mb-2"><strong>Description:</strong> ${plant.description}</p>
      </div>
    </div>
  `;
  document.getElementById("plant-modal").checked = true;
}

const manageSpinner = (status) => {
  const spinnerSection = document.getElementById("spinner");
  if (status === true) {
    spinnerSection.classList.remove("hidden");
    document.querySelector(".card-container").classList.add("hidden");
  } else {
    spinnerSection.classList.add("hidden");
    document.querySelector(".card-container").classList.remove("hidden");
  }
};
