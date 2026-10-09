import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Clock3, ListChecks, Phone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CITY } from "@/config/city";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <div className="home-page">
        <section className="home-intro" aria-labelledby="home-title">
          <h1 id="home-title">See a problem in {CITY.name}?</h1>
          <p className="muted">
            Tell the municipality. Submit a report and follow its progress as the relevant team works on it.
          </p>

          <Link to="/report" className="home-action home-action-report">
            <Camera size={32} /> Report a problem
          </Link>

          <Link to="/reports" className="home-action home-action-reports">
            <ListChecks size={28} /> Show all reports
          </Link>
        </section>

        <section className="home-assistance card" aria-labelledby="assistance-title">
          <div className="home-assistance-heading">
            <Phone size={22} aria-hidden="true" />
            <h2 id="assistance-title">Need municipal assistance?</h2>
          </div>
          <p>
            Call the City of Tshwane Call Centre:{" "}
            <a href="tel:+27123589999"><strong>(012) 358 9999</strong></a>
            {" "}or toll-free at{" "}
            <a href="tel:08001111556"><strong>080 111 1556</strong></a>.
          </p>
          <p className="home-office-hours">
            <Clock3 size={18} aria-hidden="true" />
            <span><strong>Municipal office hours:</strong> Monday to Friday, 07:45–15:15.</span>
          </p>
          <p className="muted">
            When calling, provide your contact details, the physical address where service is needed,
            and a description of the issue. Keep the reference number the call centre gives you.
          </p>
          <a
            className="home-contact-source"
            href="https://www.tshwane.gov.za/?page_id=953"
            target="_blank"
            rel="noreferrer"
          >
            More contact information from the City of Tshwane
          </a>
        </section>
      </div>
    </AppShell>
  );
}