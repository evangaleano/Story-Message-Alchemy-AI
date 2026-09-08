import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Portal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setUserEmail(session.user.email);
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Story Message Alchemy Portal</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.welcome}>
        <p>Welcome, {userEmail}</p>
      </div>

      <div style={styles.content}>
        <h2>Your AI Assistants</h2>
        <div style={styles.assistantGrid}>
          <div style={styles.assistantCard}>
            <h3>Story-Driven Message</h3>
            <p>Know Your Story</p>
            <p style={styles.description}>Extract your founder story that initiated you into becoming a guide.</p>
            <button style={styles.startBtn}>Start Interview</button>
          </div>

          <div style={styles.assistantCard}>
            <h3>Conversion Client Impact Story</h3>
            <p>Prove Your Impact</p>
            <p style={styles.description}>Turn one real client transformation into proof that your remedy works.</p>
            <button style={styles.startBtn}>Start Interview</button>
          </div>

          <div style={styles.assistantCard}>
            <h3>Story-Driven Offer</h3>
            <p>Build the Offer That Connects Them</p>
            <p style={styles.description}>Use your story + proven client transformation to build a credible offer.</p>
            <button style={styles.startBtn}>Start Interview</button>
          </div>
        </div>
      </div>

      <div style={styles.bookSection}>
        <h2>Your Book</h2>
        <p>Download "Unlock the Power of Your Story"</p>
        <button style={styles.downloadBtn}>Download Book (PDF)</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  welcome: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  content: {
    marginBottom: '40px',
  },
  assistantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  assistantCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
  },
  startBtn: {
    backgroundColor: '#8b7355',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px',
    width: '100%',
  },
  bookSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  downloadBtn: {
    backgroundColor: '#8b7355',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '16px',
  },
  logoutBtn: {
    backgroundColor: '#d32f2f',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
};
