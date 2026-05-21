(() => {
  const normalize = (text) => text.replace(/\s+/g, " ").trim();

  const page = (() => {
    const path = window.location.pathname;
    if (path.includes("/choose-template/")) return "choose";
    if (path.includes("/builder/")) return "builder";
    return "home";
  })();

  const routes = {
    home: {
      "Build my resume": "choose-template/",
      "Create new resume": "choose-template/",
      "Create my resume": "choose-template/",
      "Choose template": "choose-template/",
    },
    choose: {
      "Choose later": "../builder/",
      "Start with this template": "../builder/",
    },
    builder: {
      "Back to templates": "../choose-template/",
      "Start over": "../",
    },
  };

  const pageRoutes = routes[page] || {};

  const wireElements = () => {
    document.querySelectorAll("button, a, [role='button']").forEach((element) => {
      const label = normalize(element.textContent || "");
      const target = pageRoutes[label];

      if (!target) return;

      element.dataset.rlTarget = target;
      element.style.cursor = "pointer";

      if (element.tagName === "BUTTON" && !element.hasAttribute("type")) {
        element.setAttribute("type", "button");
      }
    });
  };

  document.addEventListener("click", (event) => {
    const element = event.target.closest("button, a, [role='button']");
    if (!element) return;

    const target = element.dataset.rlTarget || pageRoutes[normalize(element.textContent || "")];
    if (!target) return;

    event.preventDefault();
    window.location.href = target;
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireElements);
  } else {
    wireElements();
  }
})();
