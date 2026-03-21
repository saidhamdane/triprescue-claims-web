import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

export default function TermsPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
        <h1>Terms of Service</h1>
        <p>
          TripRescue AI helps users generate and send travel claims. It does not replace legal advice.
        </p>
        <p>
          Users remain responsible for the accuracy of claim data, uploaded files, and submitted evidence.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
