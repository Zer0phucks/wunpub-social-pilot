import { Link } from "react-router-dom";

const TermsOfService = () => {
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
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            These Terms of Service govern your use of WunPub. By accessing or using
            the platform, you agree to comply with these terms.
          </p>
        </header>

        <article className="space-y-10 text-sm leading-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Using WunPub</h2>
            <p>
              You must be at least 18 years old and capable of entering into a
              binding agreement to use WunPub. You are responsible for the
              activities that occur under your account and for maintaining the
              security of your credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Account responsibilities</h2>
            <p>
              Keep your contact information up to date and promptly notify us of any
              unauthorized use of your account. You agree not to misuse the service,
              interfere with its operation, or attempt to access areas you are not
              authorized to use.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Content and permissions</h2>
            <p>
              You retain ownership of the content you create within WunPub. By using
              the platform, you grant us the rights necessary to store, display, and
              process that content to provide the service. You are responsible for
              ensuring your content complies with applicable laws and third-party
              rights.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Subscription and payment</h2>
            <p>
              If you purchase a paid plan, you authorize us to charge the applicable
              fees and taxes. Subscriptions automatically renew unless cancelled in
              accordance with the terms presented at purchase. We may update pricing
              with prior notice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Termination</h2>
            <p>
              You may stop using WunPub at any time. We may suspend or terminate the
              service if you violate these terms or if your use poses a risk to the
              platform or other users. Upon termination we may delete or restrict
              access to your content, subject to any legal obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Disclaimers and liability</h2>
            <p>
              WunPub is provided on an "as is" basis. We disclaim all warranties to
              the extent permitted by law. Our liability is limited to the amount
              you paid for the service in the 12 months preceding the claim. Some
              jurisdictions do not allow certain disclaimers or limitations, so they
              may not apply to you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. When we make material
              changes, we will provide notice within the product or via email. Your
              continued use of WunPub after the effective date constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Contact us</h2>
            <p>
              If you have questions about these Terms of Service, contact us at
              support@wunpub.com.
            </p>
          </section>

          <p className="text-xs text-muted-foreground/80">
            These Terms of Service were last updated on {new Date().getFullYear()}.
          </p>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;
