const resultsList = document.querySelector(
  "[data-component-type='s-search-results']"
);

if (resultsList) {
  // Proceed only if we are on a search results page
  const resultItems = resultsList.querySelectorAll(
    "[data-component-type='s-search-result']"
  );
  // Iterate over all products
  for (const product of resultItems) {
    addInsights(product);
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
    const buttons = displayArea.querySelectorAll("button");
    for (const button of buttons) {
      button.addEventListener("click", toggleButton);
    }
  }
}

function toggleButton(event) {
  // event.target may be a span element inside the button
  const button = event.target.closest("button");
  // Parent element for all buttons and comments
  const parent = button.closest("[data-hook='cr-insights-widget-aspects']");
  // ID of comments relevant to this button
  const commentsID = button.id.replace("button", "bottom-sheet");
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
