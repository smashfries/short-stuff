function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "&hellip;" : str;
}

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
    e.target.innerHTML = "Copied!";
    e.target.style.backgroundColor = "hsl(257, 27%, 26%)";
    setTimeout(() => {
      e.target.innerHTML = "Copy";
      e.target.style.backgroundColor = "hsl(180, 66%, 49%)";
    }, 3000);
    console.log("copy button clicked");
    let text = e.target.nextSibling.firstChild;
    // text.setSelectionRange(0, 99999);
    selectText(text);
    document.execCommand("copy");
  }
});

const shortenUrl = document.getElementById("shortUrl");
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
      let shortUrlA = document.createElement("a");
      shortUrlA.setAttribute("href", result.shortenedURL);
      shortUrlA.setAttribute("target", "_blank");
      let longUrl = document.createElement("span");
      let copyButton = document.createElement("button");
      copyButton.innerText = "Copy";
      copyButton.className = "copy-btn";
      urlDiv.appendChild(copyButton);
      urlDiv.appendChild(shortUrl);
      shortUrl.appendChild(shortUrlA);
      urlDiv.appendChild(longUrl);
      shortUrl.className = "short-url";
      longUrl.className = "long-url";
      longUrl.innerHTML = truncate(document.getElementById("url").value, 40);
      shortUrl.style.float = "right";
      copyButton.style.float = "right";
      document.querySelector("#shortUrl").appendChild(urlDiv);
      shortUrlA.innerHTML = result.shortenedURL;
    });
}
