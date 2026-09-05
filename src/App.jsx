import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Faq from './components/Faq';
import Developer from './components/Developer';
import Footer from './components/Footer';
import Formats from './components/Formats';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Strip from './components/Strip';
import UploadTool from './components/UploadTool';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Home() {
  return (
    <>
      <Hero />
      <Strip />
      <UploadTool />
      <HowItWorks />
      <Formats />
      <Faq />
      <Developer />
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-dvh">
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy.html" element={<Privacy />} />
          <Route path="/terms.html" element={<Terms />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
