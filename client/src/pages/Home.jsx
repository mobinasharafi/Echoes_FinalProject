import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-shell">
      <div className="home-page-content">
        <h1
          className="page-title home-title"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <span style={{ fontSize: "0.95em" }}>🕊️</span>
          <span>Echoes</span>
        </h1>

        <div className="home-section">
          <p className="home-paragraph">
            When someone disappears, what remains is not only fear or grief, but
            also a long and difficult uncertainty. Information spreads unevenly,
            emotions run high, and the spaces people turn to are not always
            built for care. Echoes is designed to answer that problem with
            greater thoughtfulness.
          </p>

          <p className="home-paragraph">
            It gives authorised representatives a more responsible way to
            present a case, and gives public users a more disciplined way to
            take part. Practical contributions and messages of support are kept
            separate so that neither overwhelms the other.
          </p>

          <p className="home-paragraph">
            The platform is not an alternative to official investigation. Its
            purpose is narrower and steadier: to make public participation more
            coherent, preserve clarity around the case, and offer a more
            contained environment for everyone involved.
          </p>
        </div>

        <div className="home-section">
          <h2 style={{ marginBottom: "14px" }}>A short guide</h2>

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

          <p className="home-paragraph">
            If you want to contribute to a case, open its details page and
            choose whether your message belongs under Leads & Information or
            Support & Compassion.
          </p>
        </div>
      </div>
    </div>
  );
}