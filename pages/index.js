// Minimal homepage route: redirects / to the static landing page in public/.
// The landing page is plain HTML served from public/, not a React page —
// this route exists only so `/` resolves to something instead of 404ing.
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/power-of-your-story-landing.html',
      permanent: false,
    },
  };
}

export default function Index() {
  return null;
}
