(() => {
	const toggle = document.querySelector(".nav-toggle");
	const header = document.querySelector(".header");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (toggle && header) {
		toggle.addEventListener("click", () => {
			const isOpen = header.classList.toggle("nav-open");
			toggle.setAttribute("aria-expanded", String(isOpen));
		});
	}

	if (header) {
		for (const link of document.querySelectorAll(".nav-links a")) {
			link.addEventListener("click", () => {
				header.classList.remove("nav-open");
				if (toggle) {
					toggle.setAttribute("aria-expanded", "false");
				}
			});
		}
	}

	if (reduceMotion) {
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
				}
			}
		},
		{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
	);

	for (const el of document.querySelectorAll(
		".feature-card, .command-card, .template-card, .status-card, .tech-card, .step, .keyword-item",
	)) {
		el.classList.add("fade-in");
		observer.observe(el);
	}

	const style = document.createElement("style");
	style.textContent = `
    .fade-in {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
	document.head.appendChild(style);
})();
