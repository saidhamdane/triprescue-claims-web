import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

export default function ContactPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
        <h1>Contact</h1>
        <p>Support: support@triprescue.site</p>
        <p>Sales: sales@triprescue.site</p>
      </main>
      <SiteFooter />
    </>
  );
}
