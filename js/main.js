document.addEventListener("DOMContentLoaded", () => {
  // Cache the key UI nodes once so the interaction code stays predictable.
  const navbar = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const menuItems = document.querySelectorAll(".menu-item");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryModalImage = document.getElementById("galleryModalImage");
  const reservationForm = document.getElementById("reservationForm");
  const formStatus = document.getElementById("formStatus");
  const themeToggle = document.getElementById("themeToggle");
  const todaySpecialBadge = document.getElementById("todaySpecialBadge");
  const animatedElements = document.querySelectorAll(".reveal-up");

  const todaysSpecials = {
    0: "Today’s Special: Citrus Tart Sunday",
    1: "Today’s Special: Black Truffle Pasta Monday",
    2: "Today’s Special: Charred Tenderloin Tuesday",
    3: "Today’s Special: Chef’s Seafood Selection Wednesday",
    4: "Today’s Special: Slow-Roasted Lamb Thursday",
    5: "Today’s Special: Ember Tasting Menu Friday",
    6: "Today’s Special: Signature Dessert Saturday"
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
    todaySpecialBadge.textContent = todaysSpecials[dayIndex];
  };

  const filterMenu = (filter) => {
    menuItems.forEach((item) => {
      const category = item.dataset.category;
      const shouldShow = filter === "all" || filter === category;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  };

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("ember-theme");
    } catch (error) {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem("ember-theme", theme);
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

  const setFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorNode = document.getElementById(`${fieldId}Error`);

    field.classList.toggle("is-invalid", Boolean(message));
    errorNode.textContent = message;
  };

  const validateForm = () => {
    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      date: document.getElementById("date").value.trim(),
      guests: document.getElementById("guests").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    let isValid = true;

    if (!formData.name) {
      setFieldError("name", "Please enter your name.");
      isValid = false;
    } else {
      setFieldError("name", "");
    }

    if (!formData.email) {
      setFieldError("email", "Please enter your email address.");
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      setFieldError("email", "Please enter a valid email address.");
      isValid = false;
    } else {
      setFieldError("email", "");
    }

    if (!formData.phone) {
      setFieldError("phone", "Please enter your phone number.");
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      setFieldError("phone", "Phone number must include at least 10 digits.");
      isValid = false;
    } else {
      setFieldError("phone", "");
    }

    if (!formData.date) {
      setFieldError("date", "Please select a reservation date.");
      isValid = false;
    } else {
      setFieldError("date", "");
    }

    if (!formData.guests) {
      setFieldError("guests", "Please select the number of guests.");
      isValid = false;
    } else {
      setFieldError("guests", "");
    }

    if (!formData.message) {
      setFieldError("message", "Please share a few reservation details.");
      isValid = false;
    } else if (formData.message.length < 12) {
      setFieldError("message", "Message should be at least 12 characters long.");
      isValid = false;
    } else {
      setFieldError("message", "");
    }

    return isValid;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    animatedElements.forEach((element) => revealObserver.observe(element));
  }

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
    formStatus.textContent = "";

    if (!validateForm()) {
      formStatus.textContent = "Please review the highlighted fields and try again.";
      formStatus.style.color = "#b02a37";
      return;
    }

    formStatus.textContent = "Reservation request received. We’ll contact you shortly.";
    formStatus.style.color = "#2f6b2f";
    reservationForm.reset();
  });

  ["name", "email", "phone", "date", "guests", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("input", validateForm);
    field.addEventListener("blur", validateForm);
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
