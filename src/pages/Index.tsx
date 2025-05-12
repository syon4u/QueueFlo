
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  Smartphone,
  MessageSquare,
  LayoutDashboard,
  ChartBar,
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    customers: 0,
    waitTime: 0,
    satisfaction: 0,
    locations: 0
  });

  // Animate stats when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const statsInterval = setInterval(() => {
            setStats(prev => ({
              customers: Math.min(prev.customers + 157, 15000),
              waitTime: Math.min(prev.waitTime + 3, 30),
              satisfaction: Math.min(prev.satisfaction + 1, 98),
              locations: Math.min(prev.locations + 7, 500)
            }));
          }, 50);
          
          return () => clearInterval(statsInterval);
        }
      },
      { threshold: 0.1 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);

    return () => {
      if (statsElement) observer.unobserve(statsElement);
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
    }, 3000);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Customer Service Manager",
      company: "TechCorp Inc.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      content: "QueueFlow revolutionized our customer service department. Wait times decreased by 45% and customer satisfaction increased dramatically."
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Director",
      company: "Healthcare Solutions",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      content: "The analytics provided by QueueFlow helped us optimize staffing and improve patient flow throughout our facilities."
    },
    {
      name: "Jennifer Lee",
      role: "Retail Store Manager",
      company: "Fashion Forward",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      content: "Our customers love the mobile check-in feature. The implementation was smooth and the support team was exceptional."
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-white to-blue-50/30">
      {/* App-style header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-lg bg-white/90 px-4 py-3 shadow-sm border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QueueFlow
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl border-t border-gray-100 overflow-hidden animate-fade-in">
            <nav className="container mx-auto py-4 px-6 flex flex-col space-y-3">
              <button 
                onClick={() => scrollToSection(heroRef)}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <Smartphone className="mr-3 h-4 w-4" />
                Home
              </button>
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <CheckCircle className="mr-3 h-4 w-4" />
                Features
              </button>
              <button 
                onClick={() => scrollToSection(howItWorksRef)}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <Clock className="mr-3 h-4 w-4" />
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection(testimonialsRef)}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <Star className="mr-3 h-4 w-4" />
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection(contactRef)}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <MessageSquare className="mr-3 h-4 w-4" />
                Contact
              </button>
              
              {user ? (
                <Button 
                  onClick={() => navigate('/staff')} 
                  className="w-full mt-2"
                  size="lg"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full mt-2"
                  size="lg"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>
      
      <main className="pt-16">
        {/* Hero Section - App-focused */}
        <section 
          ref={heroRef} 
          className="relative py-12 md:py-20 px-4"
        >
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Manage Your Queue
                  </span>
                  <br />
                  From Your Pocket
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  The smart queue management app that eliminates waiting lines and transforms your customer experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transition-all"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate('/login')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
              
              {/* App mockup illustration */}
              <div className="md:w-1/2 flex justify-center relative">
                <div className="relative w-full max-w-xs md:max-w-sm">
                  {/* Decorative blobs */}
                  <div className="absolute -z-10 top-0 -left-4 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                  <div className="absolute -z-10 top-0 -right-4 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                  <div className="absolute -z-10 -bottom-8 left-20 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                  
                  {/* Phone mockup */}
                  <div className="relative">
                    <div className="bg-gray-900 rounded-[3rem] p-2 shadow-xl rotate-0 transform transition-all animate-float">
                      <div className="bg-white rounded-[2.5rem] overflow-hidden h-[530px] w-[260px]">
                        <div className="bg-gray-900 h-8 flex justify-center items-center">
                          <div className="w-1/3 h-5 bg-black rounded-full"></div>
                        </div>
                        {/* Updated app image */}
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
                          {/* App mockup content */}
                          <div className="p-3">
                            <div className="flex justify-between items-center mb-4">
                              <div className="text-blue-600 font-bold text-lg">QueueFlow</div>
                              <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
                                <span className="font-medium text-sm">JD</span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">Current Position</div>
                                <div className="text-blue-600 font-bold">3</div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <div className="text-sm text-gray-500">Est. wait time: 12 min</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                              <div className="text-sm font-medium text-blue-600 mb-1">Appointment Details</div>
                              <div className="text-sm text-gray-700 mb-2">Dental Checkup - Dr. Smith</div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Today, 2:30 PM</span>
                              </div>
                            </div>
                            <div className="text-sm font-medium mb-2">Upcoming Services</div>
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm">Service #{i}</div>
                                    <div className="text-xs text-gray-500">Tomorrow</div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating notification */}
                    <div className="absolute -right-16 top-20 bg-white rounded-lg p-3 shadow-lg border border-gray-100 max-w-[180px] animate-float-delay">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="text-white w-4 h-4" />
                        </div>
                        <p className="font-medium text-sm">QueueFlow</p>
                      </div>
                      <p className="text-xs text-gray-600">Your appointment is in 5 minutes. You're next in line!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section - App-focused */}
        <section id="stats-section" className="py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 md:gap-8 text-center">
              <div className="px-4">
                <span className="text-3xl md:text-4xl font-bold mb-1 block">{stats.customers.toLocaleString()}</span>
                <span className="text-sm text-blue-100">Users Active</span>
              </div>
              <div className="px-4">
                <span className="text-3xl md:text-4xl font-bold mb-1 block">{stats.waitTime}%</span>
                <span className="text-sm text-blue-100">Time Saved</span>
              </div>
              <div className="px-4">
                <span className="text-3xl md:text-4xl font-bold mb-1 block">{stats.satisfaction}%</span>
                <span className="text-sm text-blue-100">Satisfaction</span>
              </div>
              <div className="px-4">
                <span className="text-3xl md:text-4xl font-bold mb-1 block">{stats.locations}</span>
                <span className="text-sm text-blue-100">Locations</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section - App-focused */}
        <section ref={featuresRef} className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Powerful App Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to transform your customer experience in one simple app
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {/* Mobile Ticketing */}
              <Card className="overflow-hidden border-none shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow rounded-xl">
                <div className="h-1 bg-blue-600"></div>
                <CardContent className="p-5">
                  <div className="bg-blue-50 text-blue-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Mobile Ticketing</h3>
                  <p className="text-sm text-gray-500">
                    Allow customers to join queues remotely via their mobile devices, eliminating physical wait lines.
                  </p>
                </CardContent>
              </Card>
              
              {/* SMS Alerts */}
              <Card className="overflow-hidden border-none shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow rounded-xl">
                <div className="h-1 bg-indigo-600"></div>
                <CardContent className="p-5">
                  <div className="bg-indigo-50 text-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">SMS Alerts</h3>
                  <p className="text-sm text-gray-500">
                    Send automated notifications to customers as their turn approaches, giving them freedom to wait anywhere.
                  </p>
                </CardContent>
              </Card>
              
              {/* Real-Time Dashboards */}
              <Card className="overflow-hidden border-none shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow rounded-xl">
                <div className="h-1 bg-purple-600"></div>
                <CardContent className="p-5">
                  <div className="bg-purple-50 text-purple-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Dashboards</h3>
                  <p className="text-sm text-gray-500">
                    Monitor queue status, wait times, and staff performance through intuitive real-time analytics dashboards.
                  </p>
                </CardContent>
              </Card>
              
              {/* Visitor Analytics */}
              <Card className="overflow-hidden border-none shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow rounded-xl">
                <div className="h-1 bg-pink-600"></div>
                <CardContent className="p-5">
                  <div className="bg-pink-50 text-pink-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <ChartBar className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-gray-500">
                    Gain valuable insights into customer flow patterns, peak hours, and service efficiency to optimize operations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* How It Works Section - App-focused */}
        <section ref={howItWorksRef} className="py-16 px-4 bg-blue-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How QueueFlow Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A seamless experience from check-in to service completion
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connection dots for desktop */}
              <div className="absolute top-24 left-0 right-0 h-0.5 bg-blue-200 hidden md:block"></div>
              
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-blue-500/20">1</div>
                <h3 className="text-lg font-semibold text-center mb-3">Join the Queue</h3>
                <div className="flex justify-center mb-4">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Open the app, select your service, and join the virtual queue from anywhere.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-indigo-500/20">2</div>
                <h3 className="text-lg font-semibold text-center mb-3">Wait Anywhere</h3>
                <div className="flex justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Receive real-time updates on your position and estimated wait time through push notifications.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-purple-500/20">3</div>
                <h3 className="text-lg font-semibold text-center mb-3">Get Service</h3>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Get notified when it's your turn, receive service, and rate your experience in the app.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - App-focused */}
        <section ref={testimonialsRef} className="py-16 px-4 bg-gradient-to-b from-indigo-900 to-blue-800 text-white">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">What Our Users Say</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Join thousands of satisfied businesses and customers
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Carousel
                className="w-full"
                opts={{
                  loop: true,
                  align: "center",
                }}
              >
                <CarouselContent>
                  {testimonials.map((testimonial, i) => (
                    <CarouselItem key={i}>
                      <div className="p-1">
                        <Card className="border-none bg-white/10 backdrop-blur-md overflow-hidden shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                              <div className="shrink-0 flex justify-center">
                                <img 
                                  src={testimonial.image} 
                                  alt={testimonial.name} 
                                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                                />
                              </div>
                              <div>
                                <div className="flex items-center mb-2 justify-center md:justify-start">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                                <p className="text-sm md:text-base mb-4 text-center md:text-left">"{testimonial.content}"</p>
                                <div className="text-center md:text-left">
                                  <h4 className="font-semibold text-base">{testimonial.name}</h4>
                                  <p className="text-xs text-blue-200">{testimonial.role}, {testimonial.company}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-6">
                  <CarouselPrevious className="static translate-y-0 mr-2 bg-white/10 hover:bg-white/20 border-white/10" />
                  <CarouselNext className="static translate-y-0 bg-white/10 hover:bg-white/20 border-white/10" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>
        
        {/* App Promo CTA */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Transform Your Business?</h2>
                  <p className="text-gray-600 mb-6">
                    Get started with QueueFlow today and see the difference it makes for your customers and staff.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full md:w-auto shadow-lg shadow-blue-500/20"
                    onClick={() => navigate('/login')}
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white rounded-2xl p-2 shadow-lg rotate-3 transform hover:rotate-0 transition-transform">
                    <img 
                      src="https://cdn.lovable.dev/images/QueueFlow-app-icon.png" 
                      alt="QueueFlow app icon" 
                      className="w-32 h-32 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Form Section - App-focused */}
        <section ref={contactRef} className="py-16 px-4 bg-blue-50">
          <div className="container mx-auto">
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Request a Demo</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  See how QueueFlow can work for your specific business needs
                </p>
              </div>
              
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <form onSubmit={handleDemoRequest} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input 
                          id="name" 
                          placeholder="Your name" 
                          required 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <Input 
                          id="company" 
                          placeholder="Your company" 
                          required 
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your.email@company.com" 
                        required 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea 
                        id="message" 
                        rows={3} 
                        placeholder="How can we help you?" 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      ></textarea>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Request Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">QueueFlow</h3>
              <p className="text-sm text-gray-400 mb-4">
                Simple and effective queue management for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm text-gray-300">App</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm text-gray-300">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">About</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Support</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm text-gray-300">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">Privacy</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Terms</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} QueueFlow. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Get Started Modal - App-focused */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            
            {!formSubmitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold">Get Started with QueueFlow</h2>
                  <p className="text-gray-500 text-sm mt-1">Fill out this quick form to begin your journey</p>
                </div>
                
                <form onSubmit={handleDemoRequest} className="space-y-4">
                  <div>
                    <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input id="modal-name" placeholder="Your name" required />
                  </div>
                  <div>
                    <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input id="modal-email" type="email" placeholder="your.email@company.com" required />
                  </div>
                  <div>
                    <label htmlFor="modal-company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <Input id="modal-company" placeholder="Your company" required />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Submit Request
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="bg-green-100 text-green-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">
                  Your request has been submitted. Our team will contact you shortly.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFormSubmitted(false);
                    setIsModalOpen(false);
                  }}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
