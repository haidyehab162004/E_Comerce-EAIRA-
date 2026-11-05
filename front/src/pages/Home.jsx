import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeCategoryCards from '../components/HomePage/HomeCategoryCards';
import { useAuth } from '../context/useAuth';
import { storeApi } from '../services/api';
import PopularCategory from '../components/HomePage/PopularCategory';
import SaleBanner from '../components/HomePage/SaleBanner';
import TrustBadges from '../components/HomePage/TrustBadges';
import CustomerReviews from '../components/HomePage/CustomerReviews';
import NewArrivals from '../components/HomePage/NewArrivals';
import About from './About';
import HeroSection from '../components/HomePage/HeroSection';



const Home = () => {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleProduct, setSaleProduct] = useState(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('app-ready');
  }, []);

  useEffect(() => {
    let active = true;

    storeApi.getProducts({ sort: 'newest', limit: 4 })
      .then((data) => {
        if (active) setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((error) => {
        if (active) console.error('Unable to load featured products:', error.message);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    storeApi.getSaleProducts({ limit: 1 })
      .then((data) => {
        if (active) setSaleProduct(Array.isArray(data) ? data[0] || null : null);
      })
      .catch(() => {
        if (active) setSaleProduct(null);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    storeApi.getNewArrivals({ limit: 8 })
      .then((data) => {
        if (active) setNewArrivals(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setNewArrivals([]);
      });
    return () => { active = false; };
  }, []);

  const handleProductSelect = useCallback((productId) => {
    if (isLoggedIn) {
      navigate(`/product/${productId}`);
      return;
    }
    window.dispatchEvent(new Event('show-guest-overlay'));
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-bg text-gray-900">
      <HeroSection />
      <HomeCategoryCards />
      <NewArrivals products={newArrivals} onProductSelect={handleProductSelect} />
      <PopularCategory products={products} onProductSelect={handleProductSelect} />
      <SaleBanner product={saleProduct} onProductSelect={handleProductSelect} />
      <CustomerReviews />
      <TrustBadges />
      <About />

    </div>
  );
};

export default Home;
