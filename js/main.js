document.addEventListener("DOMContentLoaded", () => {
  // Cache the key UI nodes once so the interaction code stays predictable.
  const navbar = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const menuItems = document.querySelectorAll(".menu-item");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryModalImage = document.getElementById("galleryModalImage");
  const reviewsCarousel = document.getElementById("reviewsCarousel");
  const reservationForm = document.getElementById("reservationForm");
  const formStatus = document.getElementById("formStatus");
  const themeToggle = document.getElementById("themeToggle");
  const todaySpecialName = document.getElementById("todaySpecialName");
  const animatedElements = document.querySelectorAll(".reveal");
  const formFieldIds = ["name", "email", "phone", "date", "guests", "message"];

  const todaysSpecials = {
    0: "Citrus Tart",
    1: "Black Truffle Pasta",
    2: "Charred Tenderloin",
    3: "Chef’s Seafood Selection",
    4: "Slow-Roasted Lamb",
    5: "Borddeaux & Brich Tasting Menu",
    6: "Signature Dessert"
  };

  const applyNavbarState = () => {
    const offset = window.scrollY;
    navbar.classList.toggle("scrolled", offset > 24);

    let currentSection = "home";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (offset >= sectionTop && offset < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentSection}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const setTodaySpecial = () => {
    const dayIndex = new Date().getDay();
    todaySpecialName.textContent = todaysSpecials[dayIndex];
  };

  const filterMenu = (filter) => {
    menuItems.forEach((item) => {
      const category = item.dataset.category;
      const shouldShow = filter === "all" || filter === category;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  };

  const setRevealMetadata = () => {
    document.querySelectorAll("#menuGrid .menu-item").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 80}ms`);
    });

    document.querySelectorAll(".gallery-grid .reveal").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${index * 70}ms`);
    });

    document.querySelectorAll("#reviewsCarousel .testimonial-card").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${index * 90}ms`);
    });

    document.querySelector(".about-copy")?.setAttribute("data-reveal-origin", "left");
    document.querySelector(".about-visual")?.setAttribute("data-reveal-origin", "right");
    document.querySelector(".contact-card")?.setAttribute("data-reveal-origin", "left");
    document.querySelector(".map-card")?.setAttribute("data-reveal-origin", "right");
  };

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("borddeaux-brich-theme");
    } catch (error) {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem("borddeaux-brich-theme", theme);
    } catch (error) {
      // Ignore storage failures so the visual toggle still works everywhere.
    }
  };

  const setTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.innerHTML = isDark
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon-stars"></i>';
    storeTheme(theme);
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const validatePhone = (value) => value.replace(/\D/g, "").length >= 10;

  const setFormStatus = (message = "", type = "") => {
    formStatus.textContent = message;
    formStatus.classList.remove("is-visible", "is-success", "is-error");

    if (!message) {
      return;
    }

    formStatus.classList.add("is-visible");
    if (type) {
      formStatus.classList.add(type === "success" ? "is-success" : "is-error");
    }
  };

  const setFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorNode = document.getElementById(`${fieldId}Error`);

    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    field.setAttribute("aria-describedby", `${fieldId}Error`);
    errorNode.textContent = message;
  };

  const validateField = (fieldId) => {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();

    switch (fieldId) {
      case "name":
        setFieldError(fieldId, value ? "" : "Please enter your name.");
        return Boolean(value);
      case "email":
        if (!value) {
          setFieldError(fieldId, "Please enter your email address.");
          return false;
        }
        if (!validateEmail(value)) {
          setFieldError(fieldId, "Please enter a valid email address.");
          return false;
        }
        setFieldError(fieldId, "");
        return true;
      case "phone":
        if (!value) {
          setFieldError(fieldId, "Please enter your phone number.");
          return false;
        }
        if (!validatePhone(value)) {
          setFieldError(fieldId, "Phone number must include at least 10 digits.");
          return false;
        }
        setFieldError(fieldId, "");
        return true;
      case "date":
        setFieldError(fieldId, value ? "" : "Please select a reservation date.");
        return Boolean(value);
      case "guests":
        setFieldError(fieldId, value ? "" : "Please select the number of guests.");
        return Boolean(value);
      case "message":
        if (!value) {
          setFieldError(fieldId, "Please share a few reservation details.");
          return false;
        }
        if (value.length < 12) {
          setFieldError(fieldId, "Message should be at least 12 characters long.");
          return false;
        }
        setFieldError(fieldId, "");
        return true;
      default:
        return true;
    }
  };

  const validateForm = () => {
    let firstInvalidField = null;

    formFieldIds.forEach((fieldId) => {
      const isValid = validateField(fieldId);
      if (!isValid && !firstInvalidField) {
        firstInvalidField = document.getElementById(fieldId);
      }
    });

    return {
      isValid: !firstInvalidField,
      firstInvalidField
    };
  };

  const activateVisibleTestimonial = () => {
    reviewsCarousel?.querySelectorAll(".carousel-item.active .testimonial-card").forEach((card) => {
      card.classList.add("reveal-active");
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((element) => element.classList.add("reveal-active"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    animatedElements.forEach((element) => revealObserver.observe(element));
  }

  setRevealMetadata();
  activateVisibleTestimonial();
  reviewsCarousel?.addEventListener("slid.bs.carousel", activateVisibleTestimonial);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const navbarCollapse = document.querySelector(".navbar-collapse.show");
      if (navbarCollapse) {
        const collapseInstance = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
        collapseInstance.hide();
      }
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      filterMenu(button.dataset.filter);
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      galleryModalImage.src = item.dataset.image;
      galleryModalImage.alt = item.dataset.alt;
    });
  });

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setFormStatus();

    const { isValid, firstInvalidField } = validateForm();
    if (!isValid) {
      setFormStatus("Please review the highlighted fields and try again.", "error");
      firstInvalidField?.focus();
      return;
    }

    setFormStatus("Reservation request received. We’ll contact you shortly.", "success");
    reservationForm.reset();
    formFieldIds.forEach((fieldId) => setFieldError(fieldId, ""));
  });

  formFieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    const events = field.tagName === "SELECT" || field.type === "date"
      ? ["change", "blur"]
      : ["input", "blur"];

    events.forEach((eventName) => {
      field.addEventListener(eventName, () => {
        validateField(fieldId);
        if (formStatus.classList.contains("is-error")) {
          setFormStatus();
        }
      });
    });
  });

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(nextTheme);
  });

  const storedTheme = getStoredTheme();
  if (storedTheme === "dark" || storedTheme === "light") {
    setTheme(storedTheme);
  } else {
    setTheme("light");
  }

  setTodaySpecial();
  filterMenu("all");
  applyNavbarState();
  window.addEventListener("scroll", applyNavbarState, { passive: true });
});
