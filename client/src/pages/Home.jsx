// Home page for Echoes with the main explanation and quick guidance

import { Link } from "react-router-dom";

export default function Home() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isPublicUser = user && user.role === "public";

  return (
    <div className="page-shell" style={{ paddingTop: "10px" }}>
      <div
        className="home-page-content"
        style={{
          fontFamily:
            '"Cormorant Garamond", "Palatino Linotype", "Book Antiqua", serif',
          marginTop: "-10px",
        }}
      >
        <h1
          className="page-title home-title"
          style={{
            marginTop: "0",
            marginBottom: "14px",
            fontSize: "3.3rem",
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            fontFamily:
              '"Cinzel Decorative", "Cormorant Garamond", "Palatino Linotype", serif',
          }}
        >
          Echoes
        </h1>

        <div className="home-section" style={{ marginTop: "0" }}>
          <p className="home-paragraph">
            When someone disappears, what follows is often a long and difficult
            uncertainty. Information becomes scattered, emotion runs high, and
            the spaces people turn to are not always built for care.
          </p>

          <p className="home-paragraph">
            Echoes gives authorised representatives a more responsible way to
            present a case, and gives public users a more disciplined way to
            take part. Practical contributions and messages of support are kept
            separate so that neither overwhelms the other.
          </p>

          <p className="home-paragraph">
          The platform is <strong>not an alternative to official investigation.</strong>{" "}
          Its purpose is narrower and steadier: to preserve clarity around the case and
          offer a more contained environment for everyone involved.
         </p>

          <p className="home-paragraph">
            If you want something a little gentler for a moment, you can visit
            the{" "}
            <Link to="/wellness" className="home-inline-button">
              Wellness section
            </Link>
            .
          </p>

          {isPublicUser ? (
            <p className="home-paragraph" style={{ fontWeight: 700 }}>
              If you want to submit a case, you need to register again as an
              authorised representative. Public contributor accounts cannot
              create case records.
            </p>
          ) : null}
        </div>

        <div className="home-section">
          <h2
            style={{
              marginBottom: "14px",
              fontFamily:
                '"Cormorant Garamond", "Palatino Linotype", "Book Antiqua", serif',
              fontWeight: 500,
            }}
          >
            A short guide
          </h2>

          <p className="home-paragraph">
            Start with{" "}
            <Link to="/browse" className="home-inline-button">
              Browse
            </Link>{" "}
            to explore published cases.
          </p>

          <p className="home-paragraph">
            If you are an authorised representative, use{" "}
            <Link to="/submit" className="home-inline-button">
              Submit Case
            </Link>{" "}
            to create a case record.
          </p>

          <p className="home-paragraph" style={{ fontWeight: 700 }}>
            If you want to contribute to a case, log in or register first, open
            the case&apos;s details page and choose whether your message belongs
            under Leads & Information or Support & Compassion.
          </p>
        </div>
      </div>
    </div>
  );
}