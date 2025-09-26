// apps/frontend/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { ProductGrid } from '../components/product-grid';
import { CartSidebar } from '../components/cart-sidebar';
import { useCart } from '../contexts/cart-context';
import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isCartOpen } = useCart();

  useEffect(() => {
    loadProducts();
    setupRealtimeSubscription();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('products')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          setProducts(prev => [payload.new, ...prev]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts(prev => prev.map(p => 
            p.id === payload.new.id ? payload.new : p
          ));
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-semibold">Loading delicious menu...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 transition-all duration-300 ${isCartOpen ? 'pr-96' : ''}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/backgrounds/food-pattern.svg')] opacity-5"></div>
      
      <Header />
      <HeroSection productCount={products.length} />
      
      <main className="relative z-10 container mx-auto px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProductGrid products={products} />
        </motion.section>
      </main>

      <CartSidebar />
    </div>
  );
            }
