(() => {
  const gsap = window.gsap;
  if (!gsap) return;

  gsap.defaults({ duration: 0.7, ease: "power3.out", overwrite: "auto" });

  const getPage = () => {
    const path = window.location.pathname;
    if (path.includes("/choose-template/")) return "choose";
    if (path.includes("/builder/")) return "builder";
    return "home";
  };

  const byText = (selector, text) => Array.from(document.querySelectorAll(selector))
    .filter((element) => element.textContent.replace(/\s+/g, " ").trim().includes(text));

  const visible = (selector) => Array.from(document.querySelectorAll(selector))
    .filter((element) => element.offsetParent !== null);

  const animateIn = (targets, vars = {}, position = undefined, timeline = null) => {
    const elements = gsap.utils.toArray(targets).filter(Boolean);
    if (!elements.length) return null;

    gsap.set(elements, { willChange: "transform, opacity" });
    const tweenVars = {
      autoAlpha: 0,
      y: 18,
      duration: 0.72,
      stagger: 0.08,
      clearProps: "willChange",
      ...vars,
    };

    return timeline
      ? timeline.from(elements, tweenVars, position)
      : gsap.from(elements, tweenVars);
  };

  const addHoverMotion = (targets) => {
    gsap.utils.toArray(targets).forEach((element) => {
      element.addEventListener("mouseenter", () => {
        gsap.to(element, { y: -2, scale: 1.015, duration: 0.22, ease: "power2.out" });
      });
      element.addEventListener("mouseleave", () => {
        gsap.to(element, { y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
      });
    });
  };

  const runHome = () => {
    const tl = gsap.timeline({ defaults: { duration: 0.72, ease: "power3.out" } });
    const heroButtons = byText("button", "Upload my resume").concat(byText("button", "Create new resume"));
    const templateButtons = byText("button", "Choose template").slice(0, 8);

    animateIn([".css-1ju4f4n", ".css-1n9n2yz", ".css-ft20ao"], { y: -12, stagger: 0.06 }, 0, tl);
    animateIn("h1", { y: 26, duration: 0.82 }, "-=0.38", tl);
    animateIn(heroButtons, { y: 18, stagger: 0.1 }, "-=0.38", tl);
    animateIn(".css-ufqaa0", { y: 12, duration: 0.55 }, "-=0.48", tl);
    animateIn([".css-1bszdvq h2", ".css-q9e9cf"], { y: 20, stagger: 0.08 }, "-=0.22", tl);
    animateIn(templateButtons, { y: 24, scale: 0.98, stagger: 0.035 }, "-=0.4", tl);

    addHoverMotion("button, .css-q9e9cf");
  };

  const runChoose = () => {
    const tl = gsap.timeline({ defaults: { duration: 0.68, ease: "power3.out" } });
    const steps = visible(".css-a2ji1y");
    const filters = visible(".css-u2etau button").slice(0, 8);
    const cards = visible(".css-106jclc").slice(0, 12);

    animateIn(steps, { y: -10, stagger: 0.08 }, 0, tl);
    animateIn([".css-fqk29s", ".css-1pcbg5t", ".css-1hwgs1f"], { y: 18, stagger: 0.07 }, "-=0.32", tl);
    animateIn(filters, { y: 10, stagger: 0.04 }, "-=0.28", tl);
    animateIn(cards, { y: 26, scale: 0.985, stagger: 0.055 }, "-=0.22", tl);

    addHoverMotion(".css-106jclc, .css-u2etau button, .css-1hwgs1f");
  };

  const runBuilder = () => {
    const tl = gsap.timeline({ defaults: { duration: 0.68, ease: "power3.out" } });

    animateIn(".topbar", { y: -14 }, 0, tl);
    animateIn(".step", { x: -16, stagger: 0.08 }, "-=0.34", tl);
    animateIn([".editor-header", ".form-panel"], { y: 24, stagger: 0.08 }, "-=0.3", tl);
    animateIn(".field-grid label", { y: 14, stagger: 0.04, duration: 0.55 }, "-=0.42", tl);
    animateIn(".preview-panel", { x: 24, y: 0, scale: 0.985 }, "-=0.5", tl);
    gsap.from(".resume-preview", { y: 18, rotation: -1.5, autoAlpha: 0, duration: 0.8, ease: "power3.out" });

    addHoverMotion(".button, .preview-panel");
  };

  const revealWithoutMotion = () => {
    gsap.set("body *", { clearProps: "all", autoAlpha: 1 });
  };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", revealWithoutMotion);
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const page = getPage();
    if (page === "choose") runChoose();
    else if (page === "builder") runBuilder();
    else runHome();
  });
})();
