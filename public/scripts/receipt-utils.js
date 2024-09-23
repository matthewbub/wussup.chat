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

  console.log(addItemButton);

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
