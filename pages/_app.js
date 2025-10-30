import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (!token && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;
