import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

export default function PrivacyPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 16px' }}>
          <h1 style={{ fontSize: 40, margin: 0, color: '#111827' }}>Privacy Policy</h1>
          <p style={{ color: '#6b7280', marginTop: 16, lineHeight: 1.9 }}>
            TripRescue AI stores claim data, uploaded evidence, and billing information only as needed
            to provide the service, process claims, and manage subscriptions.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
