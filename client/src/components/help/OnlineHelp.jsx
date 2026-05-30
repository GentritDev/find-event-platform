import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export default function OnlineHelp() {
  const location = useLocation();

  const routeMapping = useMemo(() => ({
    '/': 'home_page.html',
    '/events': 'events_list.html',
    '/events/detail': 'event_detail.html', 
    '/login': 'login.html',
    '/register': 'register.html',
    '/tickets/my': 'my_tickets.html', // U rregullua sipas App.jsx tënd
    '/dashboard/organizer': 'organizer_dashboard.html',
    '/scan': 'scan_qr.html',
    '/dashboard/admin': 'admin_dashboard.html',
    '/saved-events': 'index.html' // Mund të hapë faqen kryesore ose ndonjë faqe tjetër
  }), []);

  const getHelpFile = (pathname) => {
    // Kap ngjarjet dinamike si /events/665421-id
    if (pathname.startsWith('/events/') && pathname !== '/events') {
      return routeMapping['/events/detail'];
    }
    return routeMapping[pathname] || 'index.html';
  };

  const openHelp = () => {
    const helpFile = getHelpFile(location.pathname);
    window.open(`/help/${helpFile}`, '_blank');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        openHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, routeMapping]);

  return (
    <button
      onClick={openHelp}
      className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transition-all duration-200 z-50 group hover:scale-105"
      title="Shtyp F1 për ndihmë"
    >
      <span className="text-lg">❓</span>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-semibold">
        Ndihmë (F1)
      </span>
    </button>
  );
}