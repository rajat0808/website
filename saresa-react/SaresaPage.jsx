import { useEffect, useRef, useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    function onClick(event) {
      if (!triggerRef.current?.contains(event.target) && !contentRef.current?.contains(event.target)) setMenuOpen(false);
      if (!dropdownRef.current?.contains(event.target)) setDropdownOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (<>
    <header className="header header--overlay">
      <div className="header-container">
        <a className="logo" href="/" aria-label="Sindh Emporio home">
          <strong className="logo-text"><span>SINDH</span><span className="sub">EMPORIO</span></strong>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <ul>
            <li><a href="/">HOME</a></li>
            <li ref={dropdownRef} className={`nav-item nav-item--has-dropdown${dropdownOpen ? " is-open" : ""}`}>
  <a href="/brand" aria-haspopup="true" aria-expanded={dropdownOpen} onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setDropdownOpen(true); }}>BRANDS</a>
  <ul className="nav-dropdown" aria-label="Featured brands">
    <li><a href="/boss">BOSS</a></li>
    <li><a href="/basanti">BASANTI_kapdeaurkoffee</a></li>
    <li><a href="/kora">KORA</a></li>
    <li><a href="/saresa">SARESA</a></li>
    <li><a href="/sindh-emporio">SINDH EMPORIO</a></li>
    <li><a href="/la-martina">LA MARTINA</a></li>
    <li><a href="/lacoste">LACOSTE</a></li>
  </ul>
</li>
            <li><a href="/events">EVENTS</a></li>
            <li><a href="contact.html">CONTACT US</a></li>
          </ul>
        </nav>
        <button
          className="menu-trigger"
          id="menuTrigger" ref={triggerRef} onClick={() => setMenuOpen((open) => !open)}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="menuPanel"
        >
          <span className="menu-text">{menuOpen ? "CLOSE" : "MENU"}</span>
          <span className="menu-lines" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <nav className="menu-panel" id="menuPanel" aria-label="Menu panel" hidden={!menuOpen} onClick={(event) => { if (event.target.closest("a")) setMenuOpen(false); }}>
        <div className="menu-layout">
          <div className="menu-content" ref={contentRef}>
            <div className="menu-columns">
              <div className="menu-heading">
                <span className="menu-title">Explore</span>
                <span className="menu-rule" aria-hidden="true"></span>
              </div>
              <ul className="menu-panel-links">
                <li><a href="/">HOME</a></li>
                <li><a href="/brand">BRANDS</a></li>
                <li><a href="/events">EVENTS</a></li>
                <li>
                  <a href="contact.html">CONTACT US</a>
                </li>
                <li>
                  <a
                    href="https://www.google.com/maps/place/Sindh+Emporio/@26.8488642,80.9398655,17z/data=!3m1!4b1!4m6!3m5!1s0x399bfd00043c74f1:0x21cfff0319a125db!8m2!3d26.8488642!4d80.9424404!16s%2Fg%2F11lz1mr8x4"
                    target="_blank"
                    rel="noopener"
                    >LOCATION</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>

  </>);
}

const heroSlides = [
  "White embroidered kurta set", "Mauve embroidered kurta set",
  "Pastel yellow kurta with dupatta", "Mint green embroidered kurta",
  "Blue kurta with dupatta", "Floral kurta with white trousers",
];

export function HeroSlider({ slides = heroSlides, imageSources, label = "Saresa collection", sliderClassName = "", viewIndex = 5, viewHref = "saresa-catalog.html", viewLabel = "View More+", showViewOnAll = false }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const touchStart = useRef(null);
  const offset = useRef(0);

  const advance = (distance) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const loopWidth = track.scrollWidth / 2;
    if (!loopWidth) return;
    offset.current = (offset.current + distance + loopWidth) % loopWidth;
    viewport.scrollLeft = offset.current;
  };
  const move = (direction) => {
    const slide = trackRef.current?.firstElementChild;
    if (slide) advance(direction * (slide.getBoundingClientRect().width + parseFloat(getComputedStyle(trackRef.current).columnGap)));
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    let previous;
    const tick = (time) => {
      if (previous !== undefined && !document.hidden) advance(Math.min(time - previous, 50) * 0.075);
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className={`saresa-slider ${sliderClassName}`.trim()} aria-label={label} aria-roledescription="carousel" data-slider-shell="gallery"
      onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
      <div className="saresa-slider__viewport" ref={viewportRef}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => { if (touchStart.current !== null) { const distance = touchStart.current - event.changedTouches[0].clientX; if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1); } touchStart.current = null; }}>
        <div className="saresa-slider__track" ref={trackRef}>
          {[...slides, ...slides].map((alt, slide) => (
            <div className={`saresa-slider__slide${!showViewOnAll && slide % slides.length === viewIndex ? " saresa-slider__slide--catalog" : ""}`} key={slide} aria-hidden={slide >= slides.length ? true : undefined}>
              <img src={imageSources ? imageSources[slide % slides.length] : slide % slides.length < 9 ? `assets/saresa-slide-${String(slide % slides.length + 1).padStart(2, "0")}.png` : `assets/saresa-new-${String(slide % slides.length - 8).padStart(2, "0")}.png`} alt={slide < slides.length ? alt : ""}
                loading={slide < 3 ? "eager" : "lazy"} decoding="async" />
              {showViewOnAll || slide % slides.length === viewIndex ? <a className="saresa-slider__view-more" href={viewHref} tabIndex={slide >= slides.length ? -1 : undefined}>{viewLabel}</a> : null}
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="instagram-reels__arrow slider-arrow saresa-slider__arrow" data-slider-direction="-1" aria-label="Previous slide" onClick={() => move(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5l-7 7 7 7 M20 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" className="instagram-reels__arrow slider-arrow saresa-slider__arrow" data-slider-direction="1" aria-label="Next slide" onClick={() => move(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5l7 7-7 7 M13 5l7 7-7 7" /></svg>
      </button>
    </section>
  );
}
function BrandContent() {

  return (<>
    <main className="brand-main">
      <HeroSlider />
      <section className="saresa-story" id="brand-details" aria-labelledby="saresa-title">
          <img className="saresa-story__logo" src="assets/logo-saresa-red.webp" alt="Saresa" width="300" height="250" loading="lazy" />
          <div className="saresa-story__contacts">
            <a href="mailto:customersupport.saresa@gmail.com" className="saresa-story__contact"><span className="saresa-story__icon" aria-hidden="true">✉</span><span>customersupport.saresa@gmail.com</span></a>
            <div className="saresa-story__contact"><span className="saresa-story__icon" aria-hidden="true">◷</span><span>Mon–Sun 11:00 AM – 9:00 PM</span></div>
            <a href="https://wa.me/918130852777" target="_blank" rel="noopener noreferrer" className="saresa-story__contact" aria-label="Chat with Saresa on WhatsApp at +91 81308 52777"><span className="saresa-story__icon" aria-hidden="true"><i className="fab fa-whatsapp"></i></span><span>+91 81308 52777</span></a>
            <details className="saresa-story__share">
              <summary className="saresa-story__contact"><span className="saresa-story__icon" aria-hidden="true"><i className="fas fa-share-alt"></i></span><span>Share</span></summary>
              <nav className="saresa-story__social" aria-label="Social media links">
                <a href="https://www.instagram.com/sindhemporio/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" aria-hidden="true"></i> Instagram</a>
                <a href="https://in.pinterest.com/sindhemporio/" target="_blank" rel="noopener noreferrer"><i className="fab fa-pinterest-p" aria-hidden="true"></i> Pinterest</a>
                <a href="https://www.facebook.com/profile.php?id=61572688416998" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" aria-hidden="true"></i> Facebook</a>
              </nav>
            </details>
          </div>
          <article className="saresa-story__about">

              <h2 id="saresa-title">About Saresa</h2>
              <div className="saresa-story__category">CHIKANKARI</div>
              <p>
                Saresa was born from a deep love for Lucknow and its timeless
                craft of Chikankari.
              </p>

              <p>
                Founded by Palak Khatri, Saresa is an effort to take Lucknow's
                iconic craft to a global platform — celebrating not only the
                beauty of Chikankari, but also the hands and stories behind it.
              </p>

              <p>
                Growing up in the city, she witnessed how Chikankari was more
                than embroidery — it was emotion, heritage, patience, and
                identity woven delicately into fabric. From the bustling lanes of
                Lucknow to celebrations across generations, Chikankari has always
                remained one of the city's most treasured and admired crafts. Yet
                behind its beauty lies the silent dedication of artisans whose
                skill, hard work, and artistry often remained unrecognized.
              </p>

              <p>
                For her, Saresa began as a childhood dream — a vision to create a
                brand that could reimagine Chikankari for today while preserving
                the soul of its legacy.
              </p>

              <p>
                At Saresa, we believe Chikankari reflects softness, grace, and
                quiet confidence. It carries a royal elegance that never demands
                attention, yet leaves a lasting impression. Every piece is
                designed to blend traditional craftsmanship with contemporary
                silhouettes, making heritage relevant for the modern woman.
              </p>

              <p>
                Saresa — Chikankari reimagined for today.<br />
                With love from Lucknow.
              </p>
          </article>

        <div className="brand-profile-actions">
          <a className="brand-back-link" href="/brand">Back to brands</a>
        </div>
      </section>
    </main>

  </>);
}

export function Footer() {

  return (<>
    <footer className="footer defer-render">
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-logo">SINDH EMPORIO</h2>
          <p className="tagline"></p>
          
          <p className="address">
            <a
              href="https://www.google.com/maps/place/Sindh+Emporio/@26.8488642,80.9398655,17z/data=!3m1!4b1!4m6!3m5!1s0x399bfd00043c74f1:0x21cfff0319a125db!8m2!3d26.8488642!4d80.9424404!16s%2Fg%2F11lz1mr8x4"
              target="_blank"
              rel="noopener"
            >
              31/54, Mahatma Gandhi Marg,<br />
              Sushanpura, Nagar Nigam Market,<br />
              Hazratganj, Lucknow,<br />
              Uttar Pradesh 226001
            </a>
          </p>
          <p className="phone">Phone: +91 9120067888</p>
          <p className="email">
            Email:{" "}
            <a href="mailto:Emporio@sindhgroup.in">emporio@sindhgroup.in</a>
          </p>
        </div>

        <div className="footer-links">
          <h3>QUICK LINKS</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/" data-scroll-target="about" onClick={() => { try { window.sessionStorage.setItem("sindhScrollTarget", "about"); } catch {} }}>About Us</a></li>
            <li><a href="/brand">Brands</a></li>
            <li><a href="/events">Events</a></li>
            <li>
              <a
                href="https://www.google.com/maps/place/Sindh+Emporio/@26.8488642,80.9398655,17z/data=!3m1!4b1!4m6!3m5!1s0x399bfd00043c74f1:0x21cfff0319a125db!8m2!3d26.8488642!4d80.9424404!16s%2Fg%2F11lz1mr8x4"
                target="_blank"
                rel="noopener"
                >Location</a
              >
            </li>
            <li>
              <a href="contact.html">Contact Us</a>
            </li>
          </ul>
        </div>

        <div className="footer-right">
          <div className="footer-social">
            <h3>SOCIAL</h3>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61572688416998"
                aria-label="Facebook"
                target="_blank"
                rel="noopener"
                ><i className="fab fa-facebook-f"></i
              ></a>
              <a
                href="https://www.instagram.com/sindhemporio/?hl=en"
                aria-label="Instagram"
                target="_blank"
                rel="noopener"
                ><i className="fab fa-instagram"></i
              ></a>
              <a
                href="https://www.threads.com/@sindhemporio?hl=en"
                aria-label="Threads"
                target="_blank"
                rel="noopener"
                ><i className="fa-brands fa-threads"></i
              ></a>
              <a
                href="https://in.pinterest.com/sindhemporio/"
                aria-label="Pinterest"
                target="_blank"
                rel="noopener"
                ><i className="fab fa-pinterest-p"></i
              ></a>
            </div>
          </div>

          <div className="footer-timing">
            <h3>MALL TIMINGS</h3>
            <p>
              Monday – Sunday<br />
              11:00 AM – 9:00 PM
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">&copy; 2026 Sindh Emporio. All rights reserved.</p>
        <p className="mall-tagline">
          UP's Finest <span className="gold">Luxury</span> Landmark
        </p>
      </div>
    </footer>
  </>);
}

export function ContactWidgets() {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), 2000);
    function onClick(event) {
      if (!widgetRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (<>
  <aside ref={widgetRef} className={`whatsapp-widget${open ? " is-open" : ""}`} id="whatsappWidget" aria-label="WhatsApp stylist support">
    <button className="whatsapp-widget__close" type="button" aria-label="Hide WhatsApp message"
      data-whatsapp-dismiss onClick={() => setOpen(false)}>
      <span aria-hidden="true">&times;</span>
    </button>
    <a className="whatsapp-widget__message"
      href="https://wa.me/9120067888?text=Namaste%21%20I%27d%20like%20to%20connect%20with%20a%20stylist."
      target="_blank" rel="noopener" aria-label="Connect with a stylist on WhatsApp">
      <span>Namaste! Connect with stylist</span>
      <span>for same day delivery.</span>
    </a>
    <a className="whatsapp-widget__action"
      data-whatsapp-toggle aria-expanded={open} onClick={(event) => { if (!open) { event.preventDefault(); setOpen(true); } }}
      href="https://wa.me/9120067888?text=Namaste%21%20I%27d%20like%20to%20connect%20with%20a%20stylist."
      target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
      <i className="fab fa-whatsapp" aria-hidden="true"></i>
    </a>
  </aside>
  </>);
}

export default function SaresaPage() {
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  return <><Header /><BrandContent /><Footer /><ContactWidgets /></>;
}
