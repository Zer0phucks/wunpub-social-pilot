import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-12 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            ← Back to home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            This Privacy Policy explains how WunPub collects, uses, and protects your
            information. It applies to the WunPub application, website, and any
            related services.
          </p>
        </header>

        <article className="space-y-10 text-sm leading-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
            <p>
              We collect information you provide directly, such as account details,
              profile information, and any content created or uploaded within the
              platform. We also automatically collect technical data like device
              information, browser type, and usage patterns to help us operate and
              improve WunPub.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">How we use information</h2>
            <p>
              We use collected data to deliver the service, personalize your
              experience, provide customer support, and communicate important
              updates. Aggregated and anonymized analytics may be used to guide
              product decisions. We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Sharing and disclosure</h2>
            <p>
              We may share information with trusted service providers that help us
              operate the platform, such as hosting, analytics, and customer support
              partners. These providers are bound by confidentiality obligations.
              We also may disclose information when required by law or when necessary
              to protect the rights, property, or safety of WunPub or its users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Data retention and security</h2>
            <p>
              We retain personal information for as long as needed to provide the
              service and comply with legal obligations. We use industry-standard
              security measures to protect your data, though no system can be fully
              secure. We encourage you to use strong passwords and keep your account
              credentials confidential.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Your choices</h2>
            <p>
              You can review and update your account information within WunPub.
              You may request deletion of your account by contacting our support
              team. Depending on your location, you may have additional rights
              regarding access, correction, portability, or restriction of your
              personal data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Contact us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your
              information, please contact us at support@wunpub.com.
            </p>
          </section>

          <p className="text-xs text-muted-foreground/80">
            This Privacy Policy was last updated on {new Date().getFullYear()}.
          </p>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
