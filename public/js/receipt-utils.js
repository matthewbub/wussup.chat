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

// TODO: this breaks when we use the back button to return to the manual upload form
// I think its because the waitForElement is not triggered again
// Gonna have to figure out a better way to do this
waitForElement(".receipt-items").then((receiptItems) => {
  const addItemButton = document.querySelector(".add-item");
  console.log(addItemButton, receiptItems);

  addItemButton.addEventListener("click", function () {
    const length = receiptItems.children.length;
    const newItem = document.createElement("li");
    newItem.classList.add("receipt-item");
    newItem.innerHTML = `
      <input type="text" name="name___${length + 1}" placeholder="Item Name" />
      <input type="text" name="price___${
        length + 1
      }" placeholder="Item Price" />
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

waitForElement("#save-button").then(() => {
  const saveButton = document.querySelector("#save-button");
  saveButton.addEventListener("click", async () => {
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

    if (response.success) {
      // TODO: make this less hacky
      window.location.reload();
    }
  });
});

waitForElement(".receipt-upload-container").then(() => {
  const uploadContainer = document.querySelector(".receipt-upload-container");

  uploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadContainer.classList.add("dragover");
  });

  uploadContainer.addEventListener("dragleave", () => {
    uploadContainer.classList.remove("dragover");
  });

  uploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadContainer.classList.remove("dragover");
    const files = e.dataTransfer.files;
    console.log(document.getElementById("zc-receipt-upload"));
    document.getElementById("zc-receipt-upload").files = files;
  });
});

Promise.all([
  waitForElement(".receipt-items"),
  waitForElement(".no-items-message"),
]).then(([receiptItems, emptyState]) => {
  const receiptItemsElement = receiptItems;
  const emptyStateElement = emptyState;

  const updateEmptyState = () => {
    if (
      receiptItemsElement?.children?.length === 0 ||
      receiptItemsElement?.children === null ||
      receiptItemsElement?.children === undefined
    ) {
      emptyStateElement.style.display = "block";
    } else {
      emptyStateElement.style.display = "none";
    }
  };

  // Initial check
  updateEmptyState();

  // Create a MutationObserver to watch for changes in the receiptItems
  const observer = new MutationObserver(updateEmptyState);

  // Configure the observer to watch for childList changes
  observer.observe(receiptItems, { childList: true });
});

// Session storage for Receipt Confirmation Back Button
waitForElement("#zc-receipt-manual-upload-form").then(() => {
  const data = {
    image: document.querySelector(".receipt-image")?.src,
    merchant: document.querySelector("#zc-c-merchant").innerHTML,
    date: document.querySelector("#zc-c-date").innerHTML,
    total: document.querySelector("#zc-c-total").innerHTML,
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

  sessionStorage.setItem("zc-temp-receipt", JSON.stringify(data));
});
