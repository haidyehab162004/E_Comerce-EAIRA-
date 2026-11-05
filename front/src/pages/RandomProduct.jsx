import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { storeApi } from '../services/api';
import { useLanguage } from '../context/useLanguage';

const RandomProduct = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const pickRandom = async () => {
      try {
        const data = await storeApi.getProducts();
        const products = data.products || data || [];
        if (products.length > 0) {
          const random = products[Math.floor(Math.random() * products.length)];
          // Replace current history entry so back button works naturally
          navigate(`/product/${random._id || random.id}`, { replace: true });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching random product:', err);
        setError(true);
      }
    };
    pickRandom();
  }, [navigate]);

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {t('random.none')}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        {t('random.loading')}
      </div>
    </Layout>
  );
};

export default RandomProduct;
