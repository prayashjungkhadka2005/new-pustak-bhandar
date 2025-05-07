import React from 'react';
import { Link } from 'react-router-dom';

// You can replace this SVG with any other relevant illustration
const BookIllustration = () => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-md mx-auto">
    <rect x="60" y="100" width="380" height="300" rx="30" fill="#e0f2fe"/>
    <rect x="90" y="130" width="320" height="240" rx="20" fill="#fff"/>
    <rect x="120" y="160" width="260" height="180" rx="10" fill="#bae6fd"/>
    <rect x="150" y="190" width="200" height="120" rx="5" fill="#38bdf8"/>
    <rect x="180" y="220" width="140" height="60" rx="3" fill="#0ea5e9"/>
    <rect x="200" y="240" width="100" height="20" rx="2" fill="#fff"/>
    <rect x="200" y="270" width="100" height="10" rx="2" fill="#fff"/>
    <rect x="200" y="290" width="60" height="10" rx="2" fill="#fff"/>
    <rect x="200" y="310" width="80" height="10" rx="2" fill="#fff"/>
  </svg>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">PustakBhandar</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between min-h-[60vh]">
          {/* Left: Text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-start py-12 lg:py-24">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-primary-600 mt-2">PustakBhandar</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 sm:mt-8 sm:text-xl sm:max-w-xl md:mt-8 md:text-2xl">
              Your one-stop destination for all your reading needs. Discover a world of books, from bestsellers to rare finds, all at your fingertips.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/books" className="btn btn-primary px-8 py-3 text-lg">
                Browse Books
              </Link>
              <Link to="/register" className="btn btn-secondary px-8 py-3 text-lg">
                Join Now
              </Link>
              <Link to="/admin/login" className="btn btn-primary px-8 py-3 text-lg">
                Admin Login
              </Link>
              <Link to="/admin/register" className="btn btn-secondary px-8 py-3 text-lg">
                Admin Signup
              </Link>
            </div>
          </div>
          {/* Right: Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center items-center mb-12 lg:mb-0">
            <BookIllustration />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose PustakBhandar?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We provide the best reading experience with our comprehensive features and services.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              <div className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute -top-4 left-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-16">
                  <h3 className="text-xl font-semibold text-gray-900">Vast Collection</h3>
                  <p className="mt-2 text-gray-500">
                    Access thousands of books across various genres, from fiction to academic.
                  </p>
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute -top-4 left-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                </div>
                <div className="ml-16">
                  <h3 className="text-xl font-semibold text-gray-900">Best Prices</h3>
                  <p className="mt-2 text-gray-500">
                    Get the best deals on books with our competitive pricing and regular discounts.
                  </p>
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute -top-4 left-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-16">
                  <h3 className="text-xl font-semibold text-gray-900">Fast Delivery</h3>
                  <p className="mt-2 text-gray-500">
                    Quick and reliable delivery to your doorstep with real-time tracking.
                  </p>
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute -top-4 left-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-16">
                  <h3 className="text-xl font-semibold text-gray-900">24/7 Support</h3>
                  <p className="mt-2 text-gray-500">
                    Our customer support team is always ready to help you with any queries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start reading?</span>
            <span className="block mt-2">Join PustakBhandar today.</span>
          </h2>
          <p className="mt-6 text-lg leading-6 text-primary-200">
            Create an account now and get access to our entire collection of books.
          </p>
          <div className="mt-10">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
              <p className="mt-4 text-base text-gray-500">
                PustakBhandar is your trusted online bookstore, offering a wide range of books across various genres.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/about" className="text-base text-gray-500 hover:text-primary-600">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-base text-gray-500 hover:text-primary-600">Contact</Link>
                </li>
                <li>
                  <Link to="/faq" className="text-base text-gray-500 hover:text-primary-600">FAQ</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
              <ul className="mt-4 space-y-4">
                <li className="text-base text-gray-500">
                  Email: support@pustakbhandar.com
                </li>
                <li className="text-base text-gray-500">
                  Phone: +1 (555) 123-4567
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-gray-400">© 2024 PustakBhandar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 