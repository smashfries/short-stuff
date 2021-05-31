function selectText(node) {
  node = node;

  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn("Could not select text in node: Unsupported browser.");
  }
}

document.querySelector("body").addEventListener("click", (e) => {
  if (e.target.className == "copy-btn") {
    console.log("copy button clicked");
    let text = e.target.previousSibling;
    // text.setSelectionRange(0, 99999)
    selectText(text);
    document.execCommand("copy");
  }
});

const shortenUrl = document.getElementById("shortenUrl");
const form = document.querySelector("form");
form.addEventListener("submit", onSubmit);
function onSubmit(e) {
  e.preventDefault();
  const url = document.getElementById("url").value;
  fetch("/shorten", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ url }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      let urlDiv = document.createElement("div");
      urlDiv.className = "url-div";
      let shortUrl = document.createElement("span");
      let copyButton = document.createElement("button");
      copyButton.innerText = "Copy";
      copyButton.className = "copy-btn";
      urlDiv.appendChild(shortUrl);
      urlDiv.appendChild(copyButton);
      document.querySelector("#shortenUrl").appendChild(urlDiv);
      shortUrl.innerHTML = result.shortenedURL;
    });
}
