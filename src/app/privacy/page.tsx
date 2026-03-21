import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';

export default function PrivacyPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
        <h1>Privacy Policy</h1>
        <p>
          TripRescue AI stores claim details, evidence metadata, and email delivery records
          only for claim processing, delivery, and tracking.
        </p>
        <p>
          We do not sell personal data. We rely on trusted infrastructure providers for hosting,
          storage, and transactional email.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
