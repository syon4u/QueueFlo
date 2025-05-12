import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck } from 'lucide-react'; // Example icons

const LandingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to QueueFlo
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Efficiently manage your appointments and queues. Access the portal that suits your needs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">Customer Portal</CardTitle>
            <Users className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Book new appointments, manage your existing bookings, check your queue status, and provide feedback.
            </CardDescription>
            <Link to="/customer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Go to Customer Portal
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">Admin & Staff Portal</CardTitle>
            <ShieldCheck className="h-8 w-8 text-green-500" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage locations, services, staff schedules, queue configurations, and view system analytics.
            </CardDescription>
            {/* Link to /login which will then redirect to /admin or /staff based on role after auth */}
            <Link to="/login">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Access Admin/Staff Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center mt-16 text-gray-500">
        <p>&copy; {new Date().getFullYear()} QueueFlo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

