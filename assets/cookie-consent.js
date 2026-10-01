(function () {
  var storageKey = "sindh-cookie-consent";
  var savedChoice;
  try { savedChoice = window.localStorage.getItem(storageKey); } catch (error) { savedChoice = null; }
  if (savedChoice) return;

  var banner = document.createElement("aside");
  banner.className = "se-cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-labelledby", "se-cookie-title");
  banner.setAttribute("aria-describedby", "se-cookie-copy");
  banner.innerHTML = '<div class="se-cookie-consent__inner"><div><h2 id="se-cookie-title">Cookie consent</h2><p id="se-cookie-copy">We and our partners, including Shopify, use cookies and other technologies to personalize your experience, show you ads, and perform analytics, and we will not use cookies or other technologies for these purposes unless you accept them. Learn more in our <a href="contact.html">Privacy Policy</a></p></div><div class="se-cookie-consent__actions"><button class="se-cookie-consent__manage" type="button">Manage preferences</button><button type="button" data-cookie-choice="accepted">Accept</button><button type="button" data-cookie-choice="declined">Decline</button></div></div>';
  document.body.appendChild(banner);

  function saveChoice(choice) {
    try { window.localStorage.setItem(storageKey, choice); } catch (error) {}
    banner.remove();
  }
  banner.addEventListener("click", function (event) {
    var choice = event.target.closest("[data-cookie-choice]");
    if (choice) saveChoice(choice.getAttribute("data-cookie-choice"));
  });
})();
