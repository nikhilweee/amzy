async function processPage() {
  const resultsList = document.querySelector(
    "[data-component-type='s-search-results']"
  );

  if (resultsList) {
    // Proceed only if we are on a search results page
    const storage = await chrome.storage.local.get({ hidden: [] });
    const resultItems = resultsList.querySelectorAll(
      "[data-component-type='s-search-result']"
    );

    // Iterate over all products
    for (const product of resultItems) {
      addInsights(product);
      addButton(product, storage);
    }
  }
}

async function addInsights(product) {
  const productLink = product.querySelector("a.a-link-normal.a-text-normal");
  // Find an area to display insights
  const displayAreas = product.querySelectorAll(".puisg-col-inner");
  const displayArea = displayAreas[displayAreas.length - 1];
  // Fetch insights from product page
  const response = await fetch(productLink.href);
  const responseText = await response.text();
  // Parse insights from response
  const parser = new DOMParser();
  const responseHTML = parser.parseFromString(responseText, "text/html");
  const insights = responseHTML.querySelector(
    "[data-csa-c-painter='cr-product-insights-cards']"
  );

  // Not all products have insights
  if (insights && displayArea) {
    // Add insights to the display area
    displayArea.innerHTML = insights.innerHTML;
    // Add event listeners to buttons
    const links = displayArea.querySelectorAll(
      "[data-csa-c-action='infoPopOver']"
    );
    for (const link of links) {
      link.addEventListener("click", insightsHandler);
    }
  }
}

function insightsHandler(event) {
  // event.target may be a span element inside the button
  const link = event.target.closest("a");
  // Parent element for all buttons and comments
  const parent = link.closest("[data-hook='cr-insights-widget-aspects']");
  // ID of comments relevant to this button
  const commentsID = link.id.replace("button", "bottom-sheet");
  const comments = parent.querySelector(`#${commentsID}`);
  // Hide comments and exit if they are already visible
  if (comments.style.display === "block") {
    comments.style.display = "none";
    return;
  }
  // If not, hide all comments and show the one we want
  const allComments = parent.querySelectorAll("[id^='aspect-bottom']");
  for (const comment of allComments) {
    comment.style.display = "none";
  }
  comments.style.display = "block";
}

function addButton(product, storage) {
  const asin = product.dataset.asin;
  // Add a button to hide or unhide the product
  const container = product.querySelector("div.puis-atcb-add-container");
  container.querySelector("span").style.display = "inline-block";
  const span = document.createElement("span");
  span.classList.add("a-button");
  span.classList.add("a-button-base");
  const button = document.createElement("button");
  button.classList.add("a-button-text");
  if (storage.hidden.includes(asin)) {
    product.style.opacity = 0.2;
    button.textContent = "Unhide";
  } else {
    button.textContent = "Hide";
  }
  button.addEventListener("click", buttonHandler);
  span.appendChild(button);
  container.appendChild(span);
}

function buttonHandler(e) {
  const product = e.target.closest("[data-asin]");
  const asin = product.dataset.asin;
  chrome.storage.local.get({ hidden: [] }).then((storage) => {
    let hidden = storage.hidden;
    if (hidden.includes(asin)) {
      product.style.opacity = 1;
      hidden = hidden.filter((item) => item !== asin);
      e.target.textContent = "Hide";
    } else {
      product.style.opacity = 0.2;
      hidden.push(asin);
      e.target.textContent = "Unhide";
    }
    chrome.storage.local.set({ hidden });
  });
}

document.addEventListener("DOMContentLoaded", processPage());
