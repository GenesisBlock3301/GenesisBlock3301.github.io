(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  // ---------- Boot-sequence intro ----------
  const bootOverlay = document.getElementById('bootOverlay');
  const bootLinesEl = document.getElementById('bootLines');
  const bootSkip = document.getElementById('bootSkip');

  const dismissBoot = () => {
    bootOverlay.classList.add('hidden');
    sessionStorage.setItem('bootPlayed', '1');
  };

  if (sessionStorage.getItem('bootPlayed') || reducedMotion) {
    bootOverlay.classList.add('hidden');
  } else {
    const bootMessages = [
      '[ OK ] Booting nas.dev v4.2.0...',
      '[ OK ] Loading Python, Go, JavaScript runtimes...',
      '[ OK ] Connecting to 127 repositories...',
      '[ OK ] Warming up Agentic AI modules...',
      '[DONE] Welcome — rendering portfolio...',
    ];
    let line = 0;
    const printNextLine = () => {
      if (line >= bootMessages.length) {
        setTimeout(dismissBoot, 350);
        return;
      }
      bootLinesEl.textContent += (line > 0 ? '\n' : '') + bootMessages[line];
      line++;
      setTimeout(printNextLine, 260);
    };
    printNextLine();
    bootSkip.addEventListener('click', dismissBoot);
    document.addEventListener('keydown', dismissBoot, { once: true });
  }

  // ---------- Theme toggle ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const current = root.getAttribute('data-theme') || (prefersLight ? 'light' : 'dark');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ---------- Mobile nav ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ---------- Header scroll state + progress bar ----------
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Scroll-spy active nav link ----------
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinkEls.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => spyObserver.observe(section));

  // ---------- Reveal-on-scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---------- Typewriter ----------
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Software Engineer',
    'Backend Systems Developer',
    'AI / LLM Engineer',
    'Agentic AI Builder',
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeLoop = () => {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      typewriterEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      charIndex--;
      typewriterEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 40 : 80);
  };
  typeLoop();

  // ---------- Animated stat counters ----------
  const statEls = document.querySelectorAll('.stat-number');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => statObserver.observe(el));

  // ---------- Project filters ----------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  // ---------- Toast helper ----------
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  const showToast = (message) => {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  };

  // ---------- Confetti ----------
  const confettiColors = ['#58a6ff', '#3fb950', '#d29922', '#bc8cff', '#f85149'];
  const launchConfetti = () => {
    if (reducedMotion) return;
    const count = 40;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = confettiColors[i % confettiColors.length];
      piece.style.animationDuration = 1800 + Math.random() * 1200 + 'ms';
      piece.style.animationDelay = Math.random() * 200 + 'ms';
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  };

  // ---------- Terminal "run" button on hero code card ----------
  const runCodeBtn = document.getElementById('runCodeBtn');
  const codeOutput = document.getElementById('codeOutput');
  let codeRunning = false;

  runCodeBtn.addEventListener('click', () => {
    if (codeRunning) return;
    codeRunning = true;
    codeOutput.classList.add('active');
    codeOutput.innerHTML = '';

    const outputLines = [
      '$ python about_me.py',
      '>>> me = SoftwareEngineer()',
      '>>> me.say_hi()',
      '"Let\'s build something great!"',
    ];
    let i = 0;
    const printLine = () => {
      if (i >= outputLines.length) {
        codeRunning = false;
        return;
      }
      const lineEl = document.createElement('div');
      lineEl.className = 'out-line';
      lineEl.textContent = outputLines[i];
      codeOutput.appendChild(lineEl);
      i++;
      setTimeout(printLine, 420);
    };
    printLine();
  });

  // ---------- Project card tilt ----------
  if (hasHover && !reducedMotion) {
    projectCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------- Copy email ----------
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.getAttribute('data-email');
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard! 🎉');
    } catch {
      showToast('Copy failed — email: ' + email);
    }
  });

  // ---------- Easter egg ----------
  const easterEgg = document.getElementById('easterEgg');
  const easterEggClose = document.getElementById('easterEggClose');
  const easterEggFacts = document.getElementById('easterEggFacts');
  const funFacts = [
    '127+ public repos, 3 of them are 2021 blockchain leftovers',
    'Most-starred repo: a face recognition login system (11 stars)',
    'Ships faster by treating AI as a pair-programmer, not a crutch',
    'Once cut a query from 690ms to 2ms — that\'s a 99.7% glow-up',
    'Currently teaching LLMs to inspect factories instead of write poetry',
  ];

  const openEasterEgg = () => {
    easterEggFacts.innerHTML = '';
    funFacts.forEach((fact) => {
      const li = document.createElement('li');
      li.textContent = fact;
      easterEggFacts.appendChild(li);
    });
    easterEgg.classList.remove('hidden');
  };
  const closeEasterEgg = () => easterEgg.classList.add('hidden');

  easterEggClose.addEventListener('click', closeEasterEgg);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEasterEgg();
  });

  // Konami code
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
  ];
  let konamiProgress = 0;
  document.addEventListener('keydown', (e) => {
    konamiProgress = e.key === konamiSequence[konamiProgress] ? konamiProgress + 1 : 0;
    if (konamiProgress === konamiSequence.length) {
      konamiProgress = 0;
      openEasterEgg();
    }
  });

  // 5x logo click
  const logo = document.querySelector('.logo');
  let logoClicks = 0;
  let logoClickTimer = null;
  logo.addEventListener('click', (e) => {
    logoClicks++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 2000);
    if (logoClicks >= 5) {
      e.preventDefault();
      logoClicks = 0;
      openEasterEgg();
    }
  });

  // ---------- Contact form (static site -> mailto fallback) ----------
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:mdnuraminsifat380@gmail.com?subject=${subject}&body=${body}`;

    formNote.textContent = 'Opening your email client...';
    formNote.classList.add('success');
    launchConfetti();
    showToast('Message ready — check your email app! 🚀');
  });

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();
})();
