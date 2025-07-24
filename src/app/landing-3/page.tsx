'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing3Page() {
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
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white" style={{scrollBehavior: 'smooth'}}>
      {/* Header (Navigation Bar) */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/cveralogo.svg" alt="CVERA Logo" className="w-10 h-10" />
              <span className="text-3xl font-bold text-black">CVERA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#about" className="text-black hover:text-blue-600 font-medium transition-colors">About us</a>
              <a href="#features" className="text-black hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#templates" className="text-black hover:text-blue-600 font-medium transition-colors">Templates</a>
              <a href="#pricing" className="text-black hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#blog" className="text-black hover:text-blue-600 font-medium transition-colors">Blog</a>
            </nav>
            
            <Link href="/auth/register" className="hidden lg:block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Create your CV
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
            <nav className="px-4 py-6 space-y-4">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-black font-medium py-2">About us</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-black font-medium py-2">Features</a>
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="block text-black font-medium py-2">Templates</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-black font-medium py-2">Pricing</a>
              <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="block text-black font-medium py-2">Blog</a>
              <Link href="/auth/register" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold mt-4">
                Create your CV
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div data-aos="fade-right">
              <h1 className="text-5xl lg:text-7xl font-bold text-black mb-8 leading-tight">
                Build Your Future With a 
                <span className="text-blue-600"> Professional CV</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                At CVERA, we help you craft standout CVs using smart design and expert insights. Your career journey starts here.
              </p>
              <Link href="/auth/register" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                <span>Get Started Now</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Right side - Illustration */}
            <div className="relative" data-aos="fade-left">
              <div className="bg-blue-50 rounded-3xl p-8 relative overflow-hidden">
                {/* Laptop illustration */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4 transform rotate-1">
                  <div className="bg-white rounded h-48 p-4 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-blue-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                
                <div className="absolute bottom-8 left-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact in Numbers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">Our Impact in Numbers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A snapshot of our progress and how we empower job seekers.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-black mb-2">200K+</div>
              <div className="text-gray-600 font-medium">CVs Created</div>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-black mb-2">100+</div>
              <div className="text-gray-600 font-medium">Custom Templates</div>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L8.5 7h-3l2.5 2-1 3 3-2 3 2-1-3 2.5-2h-3L10 2z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="text-4xl font-bold text-black mb-2">95%</div>
              <div className="text-gray-600 font-medium">User Satisfaction</div>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-black mb-2">50+</div>
              <div className="text-gray-600 font-medium">Industry Experts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey (Timeline) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600">
              See how CVERA evolved to become a trusted career companion.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-600"></div>
            
            <div className="space-y-12">
              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="100">
                <div className="absolute left-6 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
                    <div className="text-blue-600 font-bold text-lg mb-2">2020 — The Beginning</div>
                    <p className="text-gray-700 text-lg">Launched with a vision to help professionals create strong CVs.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="200">
                <div className="absolute left-6 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
                    <div className="text-blue-600 font-bold text-lg mb-2">2022 — User Growth</div>
                    <p className="text-gray-700 text-lg">Reached 100K+ active users globally.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="300">
                <div className="absolute left-6 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
                    <div className="text-blue-600 font-bold text-lg mb-2">2023 — AI Integration</div>
                    <p className="text-gray-700 text-lg">Introduced AI-powered CV builder with LinkedIn import feature.</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-start" data-aos="fade-right" data-aos-delay="400">
                <div className="absolute left-6 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
                    <div className="text-blue-600 font-bold text-lg mb-2">2024 — Personalization</div>
                    <p className="text-gray-700 text-lg">Offering industry-specific tips and dynamic designs for every career.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">Core Values</h2>
            <p className="text-xl text-gray-600">What we stand for</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">User Success First</h3>
              <p className="text-gray-600 text-lg">Helping users land interviews with effective CVs.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Innovation</h3>
              <p className="text-gray-600 text-lg">Constantly enhancing our tools with cutting-edge technologies.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Collaboration</h3>
              <p className="text-gray-600 text-lg">Working with career experts and recruiters to offer the best advice.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100" data-aos="fade-up" data-aos-delay="400">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Transparency</h3>
              <p className="text-gray-600 text-lg">Clear communication, no hidden charges or surprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <svg className="w-20 h-20 text-blue-200 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
            <blockquote className="text-2xl lg:text-4xl font-medium text-white mb-8 leading-relaxed">
              "At CVERA, we believe that every CV should tell your story clearly and powerfully — that's why we focus on precision, design, and personal touch."
            </blockquote>
            <cite className="text-blue-200 font-semibold text-xl">
              — Elvin Rahimov, Founder of CVERA
            </cite>
          </div>
        </div>
      </section>

      {/* Awards and Recognition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">Awards & Recognition</h2>
            <p className="text-xl text-gray-600">
              Celebrating milestones in career empowerment.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L8.5 7h-3l2.5 2-1 3 3-2 3 2-1-3 2.5-2h-3L10 2z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-bold text-black text-lg">Best Career Tech Startup 2023</h3>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-black text-lg">Top UI/UX Design for CV Tools</h3>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-black text-lg">Trusted by HR Experts Worldwide</h3>
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-bold text-black text-lg">Recognized by Global Job Boards</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Join Our Team
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always looking for creative minds who want to shape the future of career building.
            </p>
            <Link href="#careers" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              <span>Explore Careers</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Illustration: Characters working together */}
          <div className="mt-12 flex justify-center space-x-6" data-aos="fade-up" data-aos-delay="200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍💼</span>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍💻</span>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍🎨</span>
            </div>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🔬</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and links */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/cveralogo.svg" alt="CVERA Logo" className="w-8 h-8" />
                <span className="text-2xl font-bold">CVERA</span>
              </div>
              
              <div className="flex flex-wrap gap-6 mb-6">
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About us</a>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#templates" className="text-gray-300 hover:text-white transition-colors">Templates</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="mailto:support@cvera.com" className="hover:text-white transition-colors">
                    support@cvera.com
                  </a>
                </li>
                <li>
                  <a href="tel:+1234567890" className="hover:text-white transition-colors">
                    +1 (234) 567-890
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Newsletter</h3>
              <form onSubmit={handleNewsletterSubmit} className="mb-4">
                <div className="flex">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-r-lg font-semibold transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>© 2025 CVERA. All rights reserved.</p>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
