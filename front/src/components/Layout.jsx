
import { lazy, Suspense } from 'react';
import Navbar from './Navbar';

const Footer = lazy(() => import('./Footer'));

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Suspense fallback={<div className="min-h-64" aria-hidden="true" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Layout;
