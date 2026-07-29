// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Projects carousel
const pinSection = document.querySelector('.projects-pin');
const carousel = document.querySelector('.projects-carousel');
const track = document.querySelector('.projects-track');
const slides = document.querySelectorAll('.project-slide');
const dots = document.querySelectorAll('.projects-dots .dot');
const prevBtn = document.getElementById('projects-prev');
const nextBtn = document.getElementById('projects-next');
const desktopQuery = window.matchMedia('(min-width: 769px)');

if (pinSection && carousel && track && slides.length && prevBtn && nextBtn) {
  const setActiveDot = (index) => {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
  };

  // Desktop: page scroll pins the section and drags the track horizontally (L-shaped scroll).
  // Both the first and last card settle centered in the visible area (not flush against an
  // edge), so neither sits in the right-edge fade mask's dimmed zone. The start offset can be
  // negative (shifts the track right of its natural position) when a card is narrower than
  // the visible carousel width.
  // slide.offsetLeft is relative to the carousel's padding edge, not its border edge, so its
  // own padding-left has to be added back in to line up with clientWidth (border-edge based).
  // These measurements force a layout read, so they're cached and only re-measured on
  // load/resize rather than on every scroll frame (which was causing the scroll jank/lag).
  let startOffset = 0;
  let endOffset = 0;
  let pinTotalScroll = 0;

  const measureLayout = () => {
    const carouselPaddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
    const slideCenterOffset = (slide) =>
      carouselPaddingLeft + slide.offsetLeft + slide.offsetWidth / 2 - carousel.clientWidth / 2;
    startOffset = slideCenterOffset(slides[0]);
    endOffset = Math.max(startOffset, slideCenterOffset(slides[slides.length - 1]));
    pinTotalScroll = pinSection.offsetHeight - window.innerHeight;
  };

  // The section locks in place first (dwell), then the remaining scroll drives the cards,
  // then it holds again on the last card (end dwell) before releasing.
  const START_DWELL = 0.15;
  const END_DWELL = 0.15;
  const CARD_RANGE = 1 - START_DWELL - END_DWELL;

  const updatePinnedScroll = () => {
    const rect = pinSection.getBoundingClientRect();
    const rawProgress = pinTotalScroll > 0 ? Math.min(1, Math.max(0, -rect.top / pinTotalScroll)) : 0;
    let cardProgress;
    if (rawProgress <= START_DWELL) {
      cardProgress = 0;
    } else if (rawProgress >= 1 - END_DWELL) {
      cardProgress = 1;
    } else {
      cardProgress = (rawProgress - START_DWELL) / CARD_RANGE;
    }
    const offset = startOffset + cardProgress * (endOffset - startOffset);
    track.style.transform = `translateX(${-offset}px)`;
    setActiveDot(Math.round(cardProgress * (slides.length - 1)));
    return cardProgress;
  };

  const scrollWindowToProgress = (cardProgress) => {
    const clamped = Math.max(0, Math.min(1, cardProgress));
    const rawTarget = START_DWELL + clamped * CARD_RANGE;
    const sectionTop = pinSection.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop + rawTarget * pinTotalScroll, behavior: 'smooth' });
  };

  let rafId = null;
  const onScroll = () => {
    if (!desktopQuery.matches) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updatePinnedScroll);
  };

  const onResize = () => {
    if (!desktopQuery.matches) return;
    measureLayout();
    updatePinnedScroll();
  };

  // Mobile: native horizontal swipe/scroll on the track itself
  const scrollToSlide = (index) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: slides[clamped].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  const currentSlideIndexMobile = () => {
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  };

  let mobileScrollTimeout;
  const onMobileScroll = () => {
    clearTimeout(mobileScrollTimeout);
    mobileScrollTimeout = setTimeout(() => setActiveDot(currentSlideIndexMobile()), 100);
  };

  prevBtn.addEventListener('click', () => {
    if (desktopQuery.matches) {
      const currentIndex = Math.round(updatePinnedScroll() * (slides.length - 1));
      scrollWindowToProgress((currentIndex - 1) / (slides.length - 1));
    } else {
      scrollToSlide(currentSlideIndexMobile() - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (desktopQuery.matches) {
      const currentIndex = Math.round(updatePinnedScroll() * (slides.length - 1));
      scrollWindowToProgress((currentIndex + 1) / (slides.length - 1));
    } else {
      scrollToSlide(currentSlideIndexMobile() + 1);
    }
  });

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    if (desktopQuery.matches) {
      scrollWindowToProgress(i / (slides.length - 1));
    } else {
      scrollToSlide(i);
    }
  }));

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  track.addEventListener('scroll', onMobileScroll);

  if (desktopQuery.matches) {
    measureLayout();
    updatePinnedScroll();
  } else {
    setActiveDot(0);
  }
}

// Contact form (front-end only placeholder — wire up to a real backend/service later)
const form = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formNote.textContent = 'Thanks for reaching out! This form is not yet connected to an email service.';
  form.reset();
});
