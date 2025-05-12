import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names
import { LayoutDashboard, MapPin, Settings, Users, BarChart3, MessageSquare, CalendarDays } from 'lucide-react';

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/services", label: "Services", icon: Settings }, // Using Settings icon as placeholder
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/queue-settings", label: "Queue Settings", icon: Settings },
  { href: "/admin/message-templates", label: "Message Templates", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const AdminDashboardLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>
        <nav>
          <ul>
            {adminNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors",
                    location.pathname.startsWith(item.href) && "bg-gray-700 font-semibold"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default AdminDashboardLayout;

