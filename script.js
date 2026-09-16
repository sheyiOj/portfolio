// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });
}

// Home hero: subtle cursor parallax on the portrait stage
const portraitStage = document.getElementById("portraitStage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (portraitStage && !reduceMotion) {
  const hero = document.getElementById("topHero");
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    portraitStage.style.transform = `translate(${x * -10}px, ${y * -8}px)`;
  });
  hero.addEventListener("mouseleave", () => {
    portraitStage.style.transform = "translate(0, 0)";
  });
}

// Contact page: ambient network canvas
const networkCanvas = document.getElementById("networkCanvas");
if (networkCanvas) {
  const ctx = networkCanvas.getContext("2d");
  let w, h, dpr;
  const nodes = [];
  const maxNodes = reduceMotion ? 14 : 26;
  const mouse = { x: null, y: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = networkCanvas.parentElement.clientWidth;
    h = networkCanvas.parentElement.clientHeight;
    networkCanvas.width = w * dpr;
    networkCanvas.height = h * dpr;
    networkCanvas.style.width = w + "px";
    networkCanvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addNode() {
    if (nodes.length >= maxNodes) return;
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.4 + 1,
      born: performance.now(),
    });
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    const accent = "111, 139, 255";
    const gold = "201, 161, 90";

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      if (mouse.x !== null) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          n.x += (dx / dist) * 0.4;
          n.y += (dy / dist) * 0.4;
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const maxDist = 150;
        if (dist < maxDist) {
          const age = Math.max(0, Math.min((now - Math.max(a.born, b.born)) / 600, 1));
          ctx.strokeStyle = `rgba(${accent}, ${(1 - dist / maxDist) * 0.35 * age})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const age = Math.max(0, Math.min((now - n.born) / 500, 1));
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * age, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${gold}, ${0.8 * age})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  networkCanvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = networkCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  networkCanvas.parentElement.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  addNode();
  let spawned = 1;
  const spawnInterval = setInterval(() => {
    addNode();
    spawned++;
    if (spawned >= maxNodes) clearInterval(spawnInterval);
  }, 180);

  requestAnimationFrame((t) => {
    networkCanvas.classList.add("ready");
    draw(t);
  });
}

// Contact form: build a mailto: with the message pre-filled (static site, no backend)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const topic = document.getElementById("cf-topic").value.trim();
    const message = document.getElementById("cf-message").value.trim();

    const subject = topic ? `Portfolio contact: ${topic}` : "Portfolio contact";
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:ojoseyi18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    const success = document.getElementById("formSuccess");
    success.classList.add("show");
    contactForm.querySelector(".form-submit").style.display = "none";
  });
}

// Case study page: scroll-spy for the sticky table of contents
const tocLinks = document.querySelectorAll(".cs-toc a");
const sections = document.querySelectorAll(".cs-section[id]");
if (tocLinks.length && sections.length) {
  const setActive = (id) => {
    tocLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: "-90px 0px -70% 0px", threshold: 0.01 }
  );
  sections.forEach((s) => observer.observe(s));
}
