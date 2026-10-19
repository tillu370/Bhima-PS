import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHero, PageSection } from '../components/PageHero.jsx';
import { useUi } from '../context/UiContext.jsx';

// Information pages. Content only states what this site actually does.
export default function Info() {
  const { page } = useParams();
  const { openEnquiry } = useUi();

  const pages = {
    shipping: {
      title: 'Shipping & Delivery',
      body: (
        <>
          <h2>Where we deliver</h2>
          <p>We ship across India with trusted courier partners. Express delivery is available for Visakhapatnam and the Andhra Pradesh region.</p>
          <h2>How long printing takes</h2>
          <p>Standard printing takes 24 to 48 hours after your design is approved. Express same-day printing is available for select urgent requirements.</p>
          <h2>Charges and timelines</h2>
          <p>Delivery charges and the exact delivery time depend on the product, quantity and your location. Our team confirms them with you on WhatsApp when we confirm your order.</p>
          <h2>Questions?</h2>
          <p>Call <a href="tel:+919491811360">+91 94918 11360</a> or email <a href="mailto:bhimaxerox1@gmail.com">bhimaxerox1@gmail.com</a>, or{' '}
            <a href="#enquiry" onClick={e => { e.preventDefault(); openEnquiry('Shipping & Delivery Question'); }}>send us an enquiry</a>.</p>
        </>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      draft: true,
      body: (
        <>
          <h2>What we collect</h2>
          <p>When you create an account we store your name, phone number and email address. When you send an enquiry through the website form we store the details you enter. When you order on WhatsApp, your order message is sent through WhatsApp and is not stored on this website.</p>
          <h2>How we use it</h2>
          <p>We use this information only to respond to your enquiries and manage your account. Orders you send on WhatsApp are used to confirm and deliver your order.</p>
          <h2>Where it is stored</h2>
          <p>Your data is stored in a Supabase database. Access is limited by database security rules: you can see your own account data, and authorised Bhima Print staff can see enquiries to respond to them.</p>
          <h2>Your choices</h2>
          <p>You can update your name and phone number from <Link to="/account/profile">My Account</Link>. To ask us to delete your data, contact us at <a href="mailto:bhimaxerox1@gmail.com">bhimaxerox1@gmail.com</a>.</p>
        </>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      draft: true,
      body: (
        <>
          <h2>Order requests</h2>
          <p>Checkout on this website opens WhatsApp with your order written out. No payment is taken on the website. An order is confirmed only when our team confirms the final price, delivery charges and timeline with you on WhatsApp.</p>
          <h2>Prices</h2>
          <p>Prices shown are starting prices (&quot;from&quot;). The final price depends on quantity, size, material and finish.</p>
          <h2>Artwork</h2>
          <p>You are responsible for the artwork, text and images you provide and for having the right to print them.</p>
          <h2>Contact</h2>
          <p>Questions about these terms: <a href="mailto:bhimaxerox1@gmail.com">bhimaxerox1@gmail.com</a>.</p>
        </>
      )
    }
  };
  const c = pages[page] || { title: 'Page not found', body: <p>We could not find that page. <Link to="/">Go to the home page</Link>.</p> };
  useEffect(() => { document.title = c.title + ' | Bhima Print Solutions'; }, [c.title]);

  return (
    <>
      <PageHero title={c.title} />
      <PageSection>
        <div className="prose">
          {c.draft && <div className="draft-banner"><strong>Draft:</strong> this page describes how the website currently works. Please have it reviewed and completed by Bhima Print Solutions (and legal advice if needed) before launch.</div>}
          {c.body}
        </div>
      </PageSection>
    </>
  );
}
