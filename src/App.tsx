import { FormEvent, useEffect, useRef, useState } from "react";

const services = [
  {
    title: "Audit & Assurance",
    description:
      "Statutory, internal and tax audits with findings that are useful, not just filed.",
  },
  {
    title: "Income Tax & Planning",
    description:
      "Returns, assessments and year-round planning for individuals, firms and companies.",
  },
  {
    title: "GST & Indirect Tax",
    description: "Registration, monthly returns, reconciliations and notice handling.",
  },
  {
    title: "Startup & Company Law",
    description: "Incorporation, ROC compliance, funding paperwork and secretarial support.",
  },
  {
    title: "Bookkeeping & Virtual CFO",
    description: "Monthly accounts, MIS and cash-flow guidance for owners who want clarity.",
  },
];

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "agarwal-theme-preference";
const lightArrow = "/assets/e4c5c.svg";
const darkArrow = "/assets/c5c95.svg";
const lightChevron = "/assets/c4610.svg";
const darkChevron = "/assets/bc6a2.svg";
const heroPrefix = "Numbers that hold up. ";
const heroEmphasis = "Advice";
const heroSuffix = " you can act on.";
const heroText = `${heroPrefix}${heroEmphasis}${heroSuffix}`;
const approachText =
  "Good accounting should feel calm: no surprises, no jargon, and no last-minute scramble before a deadline.";

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Ignore storage access errors and fall back to system preference.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Reveal({
  children,
  className = "",
  delay = 0,
  scrollUp = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  scrollUp?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!scrollUp) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            observer.unobserve(element);
          }
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.01,
        },
      );
      observer.observe(element);
      return () => observer.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove("reveal-complete");
          element.classList.add("is-visible");
        } else if (entry.boundingClientRect.top >= window.innerHeight * 0.85) {
          element.classList.remove("is-visible", "reveal-complete");
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.1,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollUp]);

  return (
    <div
      ref={ref}
      className={`reveal${scrollUp ? " scroll-up" : ""} ${className}`}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "transform") {
          event.currentTarget.classList.add("reveal-complete");
        }
      }}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  arrowSrc,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  arrowSrc: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button className="action-button" type={type} disabled={disabled}>
      <span>{children}</span>
      <img src={arrowSrc} alt="" />
    </button>
  );
}

function useTypewriter<T extends HTMLElement>(
  fullText: string,
  startDelay = 340,
  isPageReady = true,
) {
  const ref = useRef<T>(null);
  const [visibleLength, setVisibleLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!isPageReady) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const networkInformation = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean };
      }
    ).connection;
    const isConstrainedDevice =
      navigator.hardwareConcurrency <= 2 ||
      networkInformation?.saveData === true ||
      /^(slow-2g|2g)$/.test(networkInformation?.effectiveType ?? "");
    let timer: number | undefined;
    let hasStarted = false;

    const showFullText = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      setVisibleLength(fullText.length);
      setIsComplete(true);
    };

    if (motionPreference.matches || isConstrainedDevice) {
      showFullText();
      return;
    }

    const typeNextCharacter = (index: number) => {
      if (index >= fullText.length) {
        setIsComplete(true);
        return;
      }

      const character = fullText[index];
      setVisibleLength(index + 1);

      const delay = /[.!?]/.test(character)
        ? 360
        : /[,;:]/.test(character)
          ? 200
          : character === " "
            ? 30
            : 56;

      timer = window.setTimeout(() => typeNextCharacter(index + 1), delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted) return;

        hasStarted = true;
        observer.unobserve(element);
        timer = window.setTimeout(() => typeNextCharacter(0), startDelay);
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.01,
      },
    );

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) {
        observer.disconnect();
        showFullText();
      }
    };

    observer.observe(element);
    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, [fullText, isPageReady, startDelay]);

  return { ref, visibleLength, isComplete };
}

function HeroTypewriterHeading({ isPageReady }: { isPageReady: boolean }) {
  const { ref, visibleLength, isComplete } = useTypewriter<HTMLHeadingElement>(
    heroText,
    240,
    isPageReady,
  );

  const visiblePrefix = heroPrefix.slice(0, Math.min(visibleLength, heroPrefix.length));
  const visibleEmphasis =
    visibleLength > heroPrefix.length
      ? heroEmphasis.slice(0, Math.min(visibleLength - heroPrefix.length, heroEmphasis.length))
      : "";
  const visibleSuffix =
    visibleLength > heroPrefix.length + heroEmphasis.length
      ? heroSuffix.slice(0, visibleLength - heroPrefix.length - heroEmphasis.length)
      : "";

  return (
    <h1
      ref={ref}
      className={`typewriter hero-typewriter${isComplete ? " is-complete" : ""}`}
      aria-label={heroText}
    >
      <span className="typewriter-reserve" aria-hidden="true">
        {heroPrefix}
        <em>{heroEmphasis}</em>
        {heroSuffix}
      </span>
      <span className="typewriter-output" aria-hidden="true">
        {visiblePrefix}
        {visibleEmphasis ? <em>{visibleEmphasis}</em> : null}
        {visibleSuffix}
        <span className="typewriter-caret" />
      </span>
    </h1>
  );
}

function TypewriterText({ isPageReady }: { isPageReady: boolean }) {
  const { ref, visibleLength, isComplete } = useTypewriter<HTMLQuoteElement>(
    approachText,
    360,
    isPageReady,
  );

  return (
    <blockquote
      ref={ref}
      className={`typewriter${isComplete ? " is-complete" : ""}`}
      aria-label={approachText}
    >
      <span className="typewriter-reserve" aria-hidden="true">
        {approachText}
      </span>
      <span className="typewriter-output" aria-hidden="true">
        {approachText.slice(0, visibleLength)}
        <span className="typewriter-caret" />
      </span>
    </blockquote>
  );
}

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsPageReady(true);
      return;
    }

    const handlePageLoad = () => setIsPageReady(true);
    window.addEventListener("load", handlePageLoad, { once: true });
    return () => window.removeEventListener("load", handlePageLoad);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event: MediaQueryListEvent) => {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark") return;
      } catch {
        // Fall through to system preference update.
      }
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage write errors in restricted browsing modes.
    }
  }

  const arrow = theme === "dark" ? darkArrow : lightArrow;
  const chevron = theme === "dark" ? darkChevron : lightChevron;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
  }

  return (
    <main>
      <section className="intro-shell page-padding">
        <header className="site-header">
          <a className="identity" href="#" aria-label="Agarwal & Associates, home">
            <span>Agarwal & Associates</span>
            <small>CHARTERED ACCOUNTANTS</small>
          </a>
          <nav aria-label="Main navigation">
            <a className="mobile-hidden-link" href="#services">
              Services
            </a>
            <a className="mobile-hidden-link" href="#approach">
              Our approach
            </a>
            <a href="#enquire">Enquire ↗</a>
          </nav>
        </header>

        <div className="rule" />

        <div className="hero">
          <p className="eyebrow gold">AUDIT, TAX &amp; ADVISORY</p>
          <div className="hero-grid">
            <HeroTypewriterHeading isPageReady={isPageReady} />
            <div className="hero-detail">
              <p>
                A partner-led practice for founders, families and growing businesses, handling your
                compliance quietly so you can focus on the work that matters.
              </p>
              <a className="action-link" href="#enquire">
                <span>Book a consultation</span>
                <img src={arrow} alt="" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section page-padding" id="services">
        <div className="rule" />
        <div className="split-layout services-layout">
          <div className="section-intro">
            <p className="eyebrow">OUR SERVICES</p>
            <h2>Everything your books need, in one place.</h2>
            <p className="supporting-copy">
              Clear scope, fixed timelines and one point of contact from start to finish.
            </p>
          </div>

          <div className="service-list">
            <div className="mobile-rule rule" />
            {services.map((service, index) => (
              <Reveal className="service-row" delay={index * 110} key={service.title} scrollUp>
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="approach-section page-padding" id="approach">
        <Reveal className="approach-grid">
          <p className="eyebrow">OUR APPROACH</p>
          <TypewriterText isPageReady={isPageReady} />
        </Reveal>
      </section>

      <section className="enquiry-section page-padding" id="enquire">
        <Reveal className="section-intro">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>Let’s talk about your books.</h2>
          <p className="supporting-copy">
            Tell us a little about what you need. We’ll be in touch to discuss the next step.
          </p>
        </Reveal>

        <Reveal className="form-wrap" delay={80}>
          {submitted ? (
            <div className="success-panel" role="status" aria-live="polite">
              <p className="eyebrow gold">ENQUIRY RECEIVED</p>
              <h2>Thank you. We’ll be in touch.</h2>
              <p>Your details have been noted for this demo. We’ll get back to you shortly.</p>
              <button type="button" onClick={() => setSubmitted(false)}>
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="personal-fields">
                <label>
                  <span>Name</span>
                  <input name="name" type="text" placeholder="Your name" required />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" placeholder="you@company.com" required />
                </label>
              </div>

              <label>
                <span>Service needed</span>
                <span className="select-wrap">
                  <select name="service" defaultValue="" required>
                    <option value="" disabled>
                      Select a service
                    </option>
                    {services.map((service) => (
                      <option value={service.title} key={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                  <img src={chevron} alt="" />
                </span>
              </label>

              <label>
                <span>Message</span>
                <textarea name="message" placeholder="A line or two is plenty" required />
              </label>

              <div className="form-submit">
                <ActionButton arrowSrc={arrow} type="submit">
                  Request a callback
                </ActionButton>
                <p>Your details will only be used to respond to your enquiry.</p>
              </div>
            </form>
          )}
        </Reveal>
      </section>

      <footer className="page-padding">
        <div className="rule" />
        <div className="footer-copy">
          <p>Agarwal &amp; Associates · Chartered Accountants</p>
          <div className="footer-meta">
            <p>Concept design · Placeholder firm details</p>
            <span aria-hidden="true">·</span>
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
