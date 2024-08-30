// frontend/watchly-web/components/auth/withAuth.tsx

'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function AuthComponent(props: P & { children?: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
      } else {
        setIsAuthenticated(true);
      }
    }, [router]);

    if (!isAuthenticated) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;