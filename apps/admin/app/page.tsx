// apps/admin/app/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { ImageUpload } from '../components/image-upload';
import { AIExtractionResult } from '../components/ai-extraction';
import { ProductList } from '../components/product-list';
import { AdminHeader } from '../components/admin-header';
import { StatsDashboard } from '../components/stats-dashboard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default function AdminPage() {
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadedImage(URL.createObjectURL(file));
    
    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      
      if (!response.ok) throw new Error('Extraction failed');
      
      const result = await response.json();
      setExtractedData(result);
    } catch (error) {
      console.error('Extraction error:', error);
      alert('AI extraction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveProduct = async (productData: any) => {
    try {
      // Upload image to Supabase Storage
      let imageUrl = uploadedImage;
      if (uploadedImage.startsWith('blob:')) {
        // Handle image upload to storage
        const { data: uploadData, error } = await supabase.storage
          .from('product-images')
          .upload(`products/${Date.now()}.jpg`, await fetch(uploadedImage).then(r => r.blob()));
        
        if (!error && uploadData) {
          imageUrl = supabase.storage.from('product-images').getPublicUrl(uploadData.path).data.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          ...productData, 
          image_url: imageUrl,
          ai_generated: true 
        }])
        .select();

      if (error) throw error;
      
      alert('Product saved successfully!');
      setExtractedData(null);
      setUploadedImage('');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving product: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/backgrounds/admin-pattern.svg')] opacity-10"></div>
      
      <AdminHeader />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Restaurant Manager
          </h1>
          <p className="text-gray-600 mt-2">Manage your menu with AI-powered automation</p>
        </motion.div>

        <StatsDashboard />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* AI Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
              AI Menu Upload
            </h2>
            
            <ImageUpload 
              onUpload={handleImageUpload} 
              disabled={isProcessing}
            />
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-700 font-medium">AI is analyzing your menu image...</p>
                </div>
              </motion.div>
            )}
            
            {extractedData && (
              <AIExtractionResult 
                data={extractedData}
                imagePreview={uploadedImage}
                onSave={saveProduct}
                onCancel={() => {
                  setExtractedData(null);
                  setUploadedImage('');
                }}
              />
            )}
          </motion.div>

          {/* Product Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
              Menu Management
            </h2>
            
            <ProductList />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
    reader.onerror = error => reject(error);
  });
                  }
