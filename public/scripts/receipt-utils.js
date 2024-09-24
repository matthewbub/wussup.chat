function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

waitForElement(".receipt-items").then((receiptItems) => {
  const addItemButton = document.querySelector(".add-item");

  addItemButton.addEventListener("click", function () {
    const length = receiptItems.children.length;
    const newItem = document.createElement("li");
    newItem.classList.add("receipt-item");
    newItem.innerHTML = `
      <input type="text" name="name___${length + 1}" />
      <input type="text" name="price___${length + 1}" />
      <button type="button" class="remove-item">X</button>
    `;
    receiptItems.appendChild(newItem);
  });

  receiptItems.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-item")) {
      e.target.parentElement.remove();
    }
  });
});

const handleSubmit = async () => {
  const data = {
    merchant: document.querySelector("#merchant").innerHTML,
    date: document.querySelector("#date").innerHTML,
    total: document.querySelector("#total").innerHTML,
    items: [],
  };

  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    const itemData = {
      name: item.querySelector("#name").innerHTML,
      price: item.querySelector("#price").innerHTML,
    };
    data.items.push(itemData);
  });

  const request = await fetch("/upload/confirm/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const response = await request.json();
  console.log(response);
};

waitForElement("#save-button").then(() => {
  console.log("save button");
  const saveButton = document.querySelector("#save-button");
  saveButton.addEventListener("click", handleSubmit);
});
