// Minimal homepage route: redirects / to the portal login.
// Landing page is now handled by external GHL service.
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/portal-login.html',
      permanent: false,
    },
  };
}

export default function Index() {
  return null;
}
