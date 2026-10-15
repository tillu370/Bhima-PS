import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found | Bhima Printing Solutions'; }, []);
  return (
    <>
      <PageHero title="Page not found" />
      <PageSection>
        <StateBox title="This page doesn't exist" action={<Link className="btn btn-primary" to="/">Go to the home page</Link>}>
          The link may be wrong or the page may have moved.
        </StateBox>
      </PageSection>
    </>
  );
}
