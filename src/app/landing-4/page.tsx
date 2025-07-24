'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing4Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
      anchorPlacement: 'top-bottom'
    });
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white font-sans" style={{scrollBehavior: 'smooth', fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/cveralogo.svg" alt="CVERA Logo" className="w-10 h-10" />
              <span className="text-3xl font-bold text-black">CVERA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-black font-medium transition-colors">Home</Link>
              <Link href="/templates" className="text-gray-700 hover:text-black font-medium transition-colors">Templates</Link>
              <Link href="/features" className="text-gray-700 hover:text-black font-medium transition-colors">Features</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-black font-medium transition-colors">Pricing</Link>
              <span className="text-black font-semibold border-b-2 border-lime-400 pb-1">About Us</span>
            </nav>
            
            <Link href="/auth/register" className="hidden lg:block border-2 border-black text-black hover:bg-black hover:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300">
              Create My CV
            </Link>
            
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <nav className="px-6 py-6 space-y-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Home</Link>
              <Link href="/templates" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Templates</Link>
              <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Features</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Pricing</Link>
              <span className="block text-black font-semibold py-2">About Us</span>
              <Link href="/auth/register" className="block w-full text-center border-2 border-black text-black px-6 py-3 rounded-xl font-medium mt-4">
                Create My CV
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div data-aos="fade-right">
              <h1 className="text-6xl lg:text-8xl font-bold text-black mb-8 leading-none">
                Craft Your Future
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Build a professional CV that stands out and opens doors to new opportunities.
              </p>
            </div>

            {/* Right side - Illustration */}
            <div className="relative" data-aos="fade-left">
              <div className="bg-lime-400 rounded-3xl p-12 relative overflow-hidden">
                {/* Abstract illustration - CV building concept */}
                <div className="relative z-10">
                  {/* Document base */}
                  <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg transform -rotate-2">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="mt-6 space-y-2">
                        <div className="h-2 bg-lime-400 rounded w-full"></div>
                        <div className="h-2 bg-lime-400 rounded w-4/5"></div>
                        <div className="h-2 bg-lime-400 rounded w-3/5"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Building blocks/people assembling */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  
                  {/* Floating geometric shapes */}
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-lg transform rotate-12"></div>
                  <div className="absolute top-1/2 -right-2 w-8 h-8 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact in Numbers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-5xl font-bold text-black mb-6">Our Impact in Numbers</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="100">
              <div className="text-5xl font-bold text-black mb-2">1M+</div>
              <div className="text-gray-600 font-medium text-lg">CVs Created</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="200">
              <div className="text-5xl font-bold text-black mb-2">500+</div>
              <div className="text-gray-600 font-medium text-lg">Professional Templates</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="300">
              <div className="text-5xl font-bold text-black mb-2">98%</div>
              <div className="text-gray-600 font-medium text-lg">User Satisfaction Rate</div>
            </div>

            <div className="text-center bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="400">
              <div className="text-5xl font-bold text-black mb-2">10+</div>
              <div className="text-gray-600 font-medium text-lg">Years of Expertise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-5xl font-bold text-black mb-6">Our Journey</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-lime-400"></div>
            
            <div className="space-y-16">
              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="100">
                <div className="absolute left-6 w-5 h-5 bg-lime-400 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                    <div className="text-lime-600 font-bold text-xl mb-3">2019: The Beginning</div>
                    <p className="text-gray-700 text-lg leading-relaxed">CVERA was founded with a simple mission: to make professional CV creation accessible to everyone.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-left" data-aos-delay="200">
                <div className="absolute left-6 w-5 h-5 bg-lime-400 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                    <div className="text-lime-600 font-bold text-xl mb-3">2021: Feature Expansion</div>
                    <p className="text-gray-700 text-lg leading-relaxed">Introduced AI-powered writing assistance and a wider range of premium, industry-specific templates.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="300">
                <div className="absolute left-6 w-5 h-5 bg-lime-400 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                    <div className="text-lime-600 font-bold text-xl mb-3">2023: Growth and Community</div>
                    <p className="text-gray-700 text-lg leading-relaxed">Reached our first million users and launched our career advice blog to support job seekers globally.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-left" data-aos-delay="400">
                <div className="absolute left-6 w-5 h-5 bg-lime-400 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                    <div className="text-lime-600 font-bold text-xl mb-3">2024: Shaping the Future</div>
                    <p className="text-gray-700 text-lg leading-relaxed">Integrating advanced AI for personalized career path recommendations and automated CV tailoring.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-5xl font-bold text-black mb-6">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Simplicity</h3>
              <p className="text-gray-600 text-lg leading-relaxed">An intuitive, user-friendly interface. No design skills are needed to create a stunning CV.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Innovation</h3>
              <p className="text-gray-600 text-lg leading-relaxed">We constantly update our tools with the latest AI technology and design trends to keep you ahead.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Empowerment</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Giving you the tools and the confidence you need to apply for your dream job and succeed.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="400">
              <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Professionalism</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Ensuring every template meets the highest standards of professional design, approved by recruiters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote/Mission Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-gray-900 rounded-3xl p-12 text-center relative overflow-hidden" data-aos="zoom-in">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <blockquote className="text-2xl lg:text-3xl font-medium text-white leading-relaxed">
                "At CVERA, we believe your CV is more than a document—it's the key to your next great opportunity. We build tools that unlock potential."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* As Featured In */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-5xl font-bold text-black mb-6">As Featured In</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex items-center justify-center h-32" data-aos="fade-up" data-aos-delay="100">
              <div className="text-2xl font-bold text-gray-600">Forbes</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex items-center justify-center h-32" data-aos="fade-up" data-aos-delay="200">
              <div className="text-2xl font-bold text-gray-600">TechCrunch</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex items-center justify-center h-32" data-aos="fade-up" data-aos-delay="300">
              <div className="text-2xl font-bold text-gray-600">HR Weekly</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex items-center justify-center h-32" data-aos="fade-up" data-aos-delay="400">
              <div className="text-2xl font-bold text-gray-600">FastCompany</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Build Your CV CTA */}
      <section className="py-20 bg-lime-400">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
              Ready to Build Your CV?
            </h2>
            <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join millions of professionals who trust CVERA to create a winning resume. Get started for free today and land the job you deserve.
            </p>
            <Link href="/auth/register" className="inline-flex items-center bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300">
              <span>Start Building Now</span>
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Diverse professionals illustration */}
          <div className="mt-12 flex justify-center space-x-6" data-aos="fade-up" data-aos-delay="200">
            <div className="w-16 h-16 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍💼</span>
            </div>
            <div className="w-16 h-16 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍💻</span>
            </div>
            <div className="w-16 h-16 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍🔬</span>
            </div>
            <div className="w-16 h-16 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🎨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side */}
            <div>
              <div className="mb-8 flex items-center space-x-3">
                <img src="/cveralogo.svg" alt="CVERA Logo" className="w-8 h-8" />
                <span className="text-3xl font-bold">CVERA</span>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-300 mb-4">
                  <a href="mailto:hello@cvera.com" className="hover:text-lime-400 transition-colors">hello@cvera.com</a>
                </p>
                <p className="text-gray-300 mb-6">
                  <a href="tel:+15551234567" className="hover:text-lime-400 transition-colors">+1 (555) 123-4567</a>
                </p>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Side */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6">Stay Updated</h3>
                <form onSubmit={handleNewsletterSubmit} className="mb-6">
                  <div className="flex">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" 
                      className="flex-1 px-6 py-3 rounded-l-2xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-lime-400"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-3 rounded-r-2xl font-semibold transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Footer Links */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-3 text-gray-300">
                    <li><Link href="/" className="hover:text-lime-400 transition-colors">Home</Link></li>
                    <li><Link href="/about" className="hover:text-lime-400 transition-colors">About</Link></li>
                    <li><Link href="/services" className="hover:text-lime-400 transition-colors">Services</Link></li>
                    <li><Link href="/contact" className="hover:text-lime-400 transition-colors">Contact</Link></li>
                    <li><Link href="/privacy" className="hover:text-lime-400 transition-colors">Privacy Policy</Link></li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3 text-gray-300">
                    <li><Link href="/templates" className="hover:text-lime-400 transition-colors">Templates</Link></li>
                    <li><Link href="/features" className="hover:text-lime-400 transition-colors">Features</Link></li>
                    <li><Link href="/pricing" className="hover:text-lime-400 transition-colors">Pricing</Link></li>
                    <li><Link href="/blog" className="hover:text-lime-400 transition-colors">Blog</Link></li>
                    <li><Link href="/support" className="hover:text-lime-400 transition-colors">Support</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
