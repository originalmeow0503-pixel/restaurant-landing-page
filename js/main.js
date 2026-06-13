document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const navbar = $("#mainNav"), navbarMenu = $("#navbarMenu"), filterWrap = $(".category-filter");
  const galleryGrid = $(".gallery-grid"), galleryModalImage = $("#galleryModalImage");
  const reviewsCarousel = $("#reviewsCarousel"), reservationForm = $("#reservationForm");
  const formStatus = $("#formStatus"), todaySpecialName = $("#todaySpecialName");
  const heroVideo = $(".hero-video"), reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navLinks = $$(".navbar-nav .nav-link"), sections = $$("main section[id]");
  const filterButtons = $$(".filter-btn"), menuItems = $$(".menu-item");
  const themeToggles = $$("[data-theme-toggle]"), revealItems = $$(".reveal");

  const themeKey = "bordeaux-birch-theme";
  const fieldIds = ["name", "email", "phone", "date", "guests", "message"];
  const specials = ["Citrus Tart", "Black Truffle Pasta", "Charred Tenderloin", "Seafood Plate", "Slow-Roasted Lamb", "Bordeaux & Birch Dinner Menu", "House Dessert"];
  const fields = Object.fromEntries(fieldIds.map((id) => [id, { input: $(`#${id}`), error: $(`#${id}Error`) }]));

  function readTheme() {
    try { return window.localStorage.getItem(themeKey); } catch { return null; }
  }

  function saveTheme(theme) {
    try { window.localStorage.setItem(themeKey, theme); } catch {}
  }

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    themeToggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isDark));
      if (toggle.classList.contains("theme-toggle")) {
        toggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
      } else {
        toggle.textContent = isDark ? "Light mode" : "Dark mode";
      }
    });

    saveTheme(theme);
  }

  function updateNavbar() {
    const scrollTop = window.scrollY;
    let currentSection = "home";

    navbar?.classList.toggle("scrolled", scrollTop > 24);
    sections.forEach((section) => {
      if (scrollTop >= section.offsetTop - 140) currentSection = section.id;
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentSection}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function closeMobileNavbar() {
    if (!navbarMenu || !navbarMenu.classList.contains("show") || !window.bootstrap) return;
    bootstrap.Collapse.getOrCreateInstance(navbarMenu).hide();
  }

  function filterMenu(category) {
    menuItems.forEach((item) => item.classList.toggle("is-hidden", category !== "all" && item.dataset.category !== category));
  }

  function setTodaySpecial() {
    if (todaySpecialName) todaySpecialName.textContent = specials[new Date().getDay()];
  }

  function keepHeroVideoPlaying() {
    if (!heroVideo) return;

    const playVideo = () => {
      const promise = heroVideo.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    };

    heroVideo.addEventListener("canplay", playVideo, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && heroVideo.paused) playVideo();
    });
    playVideo();
  }

  function addRevealDelay(selector, step, maxIndex = Infinity) {
    $$(selector).forEach((item, index) => item.style.setProperty("--reveal-delay", `${Math.min(index, maxIndex) * step}ms`));
  }

  function revealActiveTestimonial() {
    $(".carousel-item.active .testimonial-card", reviewsCarousel)?.classList.add("reveal-active");
  }

  function setupReveal() {
    addRevealDelay("#menuGrid .menu-item", 80, 5);
    addRevealDelay(".gallery-grid .reveal", 70);
    addRevealDelay("#reviewsCarousel .testimonial-card", 90);

    [
      [".about-copy", "left"],
      [".about-visual", "right"],
      [".contact-card", "left"],
      [".map-card", "right"]
    ].forEach(([selector, side]) => $(selector)?.setAttribute("data-reveal-origin", side));

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add("reveal-active"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-active");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    revealItems.forEach((item) => observer.observe(item));
  }

  function setFormStatus(message = "", type = "") {
    if (!formStatus) return;

    formStatus.textContent = message;
    formStatus.classList.remove("is-visible", "is-success", "is-error");
    if (!message) return;

    formStatus.classList.add("is-visible");
    if (type) formStatus.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function setFieldError(id, message) {
    const field = fields[id];
    if (!field) return;

    field.input.classList.toggle("is-invalid", Boolean(message));
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
    field.input.setAttribute("aria-describedby", `${id}Error`);
    field.error.textContent = message;
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validatePhone(value) {
    return value.replace(/\D/g, "").length >= 10;
  }

  const validators = {
    name: (value) => value ? "" : "Please enter your name.",
    email: (value) => {
      if (!value) return "Please enter your email address.";
      return validateEmail(value) ? "" : "Please enter a valid email address.";
    },
    phone: (value) => {
      if (!value) return "Please enter your phone number.";
      return validatePhone(value) ? "" : "Phone number must include at least 10 digits.";
    },
    date: (value) => value ? "" : "Please select a reservation date.",
    guests: (value) => value ? "" : "Please select the number of guests.",
    message: (value) => {
      if (!value) return "Please share a few reservation details.";
      return value.length >= 12 ? "" : "Message should be at least 12 characters long.";
    }
  };

  function validateField(id) {
    const message = validators[id](fields[id].input.value.trim());
    setFieldError(id, message);
    return !message;
  }

  function validateForm() {
    for (const id of fieldIds) {
      if (!validateField(id)) return fields[id].input;
    }
    return null;
  }

  filterWrap?.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filterMenu(button.dataset.filter || "all");
  });

  galleryGrid?.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-item");
    if (!button || !galleryModalImage) return;

    galleryModalImage.src = button.dataset.image || "";
    galleryModalImage.alt = button.dataset.alt || "";
  });

  navbarMenu?.addEventListener("click", (event) => {
    if (event.target.closest('a.nav-link[href^="#"]')) closeMobileNavbar();
  });

  reservationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    setFormStatus();

    const firstInvalidField = validateForm();
    if (firstInvalidField) {
      setFormStatus("Please review the highlighted fields and try again.", "error");
      firstInvalidField.focus();
      return;
    }

    setFormStatus("Reservation request received. We'll contact you shortly.", "success");
    reservationForm.reset();
    fieldIds.forEach((id) => setFieldError(id, ""));
  });

  fieldIds.forEach((id) => {
    const input = fields[id].input;
    const events = input.tagName === "SELECT" || input.type === "date" ? ["change", "blur"] : ["input", "blur"];

    events.forEach((eventName) => {
      input.addEventListener(eventName, () => {
        validateField(id);
        if (formStatus?.classList.contains("is-error")) setFormStatus();
      });
    });
  });

  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      setTheme(nextTheme);
    });
  });

  reviewsCarousel?.addEventListener("slid.bs.carousel", revealActiveTestimonial);

  setTheme(readTheme() === "dark" ? "dark" : "light");
  setTodaySpecial();
  filterMenu("all");
  setupReveal();
  revealActiveTestimonial();
  keepHeroVideoPlaying();
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
});
