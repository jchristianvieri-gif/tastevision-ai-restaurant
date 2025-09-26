// components/Layout/RestaurantLayout.tsx
import React from 'react';
import Head from 'next/head';

interface RestaurantLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function RestaurantLayout({ children, title = "TasteVision AI Restaurant" }: RestaurantLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Modern AI-powered restaurant experience" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-heading font-bold text-primary-600">
                    TasteVision
                  </h1>
                </div>
                <nav className="ml-10 flex space-x-8">
                  <a href="/" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    Menu
                  </a>
                  <a href="/about" className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    About
                  </a>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <a href="/admin" className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Admin
                </a>
                <a href="/cart" className="relative text-gray-500 hover:text-primary-600 p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2024 TasteVision AI Restaurant. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
