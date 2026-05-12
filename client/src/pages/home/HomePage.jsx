import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { eventsService } from "../../services/eventsService";
import { savedEventsService } from "../../services/savedEventsService";
import { ticketsService } from "../../services/ticketsService";
import EventCard from "../../components/shared/EventCard";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => eventsService.getEvents({ status: "published", limit: 6 }),
  });

  const { data: savedEventsData } = useQuery({
    queryKey: ["saved-events"],
    queryFn: savedEventsService.getSavedEvents,
    enabled: !!user,
  });

  const { data: ticketsData } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: ticketsService.getMyTickets,
    enabled: !!user,
  });

  const savedEvents = savedEventsData?.data || [];
  const myTickets = ticketsData || [];

  const excludedEventIds = new Set([
    ...savedEvents.map((e) => e.event_id || e.id),
    ...myTickets.map((t) => t.event_id),
  ]);

  const categoryCounts = {};

  for (const event of savedEvents) {
    if (event.category) {
      categoryCounts[event.category] =
        (categoryCounts[event.category] || 0) + 1;
    }
  }

  for (const ticket of myTickets) {
    if (ticket.event_category) {
      categoryCounts[ticket.event_category] =
        (categoryCounts[ticket.event_category] || 0) + 3;
    }
  }

  const recommendedCategories = Object.keys(categoryCounts)
    .sort((a, b) => categoryCounts[b] - categoryCounts[a])
    .slice(0, 3);

  const { data: recommendedData, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["events", "recommended", recommendedCategories],
    queryFn: async () => {
      const results = await Promise.all(
        recommendedCategories.map((category) =>
          eventsService.getEvents({
            status: "published",
            category,
            limit: 3,
          }),
        ),
      );

      return {
        data: results.flatMap((r) => r.data),
      };
    },
    enabled: recommendedCategories.length > 0,
  });

  const featuredEvents = featuredData?.data || [];
  const recommendedEvents = (recommendedData?.data || []).filter(
    (event) => !excludedEventIds.has(event.id),
  );
  const hasRecommendations = recommendedEvents.length > 0;

  return (
    <div className="bg-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-dark-900 to-dark-900" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-purple/5 rounded-full blur-3xl" />

        <div className="page-container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-dark-700 border border-accent-purple/30 text-accent-purple-light text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              Discover & Book Amazing Events
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Find Your Next{" "}
              <span className="bg-gradient-to-r from-accent-purple-light via-blue-400 to-accent-pink bg-clip-text text-transparent">
                Unforgettable
              </span>{" "}
              Experience
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Browse thousands of events — concerts, tech talks, workshops, and
              more. Book tickets instantly and get your QR code.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link to="/events" className="btn-primary text-base px-8 py-3">
                Browse Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="btn-outline text-base px-8 py-3"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-dark-600">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Booking",
                desc: "Book tickets in seconds with PayPal. Your QR code is ready immediately.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "QR Verification",
                desc: "Organizers scan your unique QR code at entry. No paper needed.",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Email Confirmation",
                desc: "Receive ticket confirmation directly to your email with all event details.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card p-6 hover:border-accent-purple/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Events */}
      {user && (isRecommendedLoading || hasRecommendations) && (
        <section className="py-16 border-t border-dark-600">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Recommended for you
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Based on your saved events and purchased tickets.
                </p>
              </div>
              {recommendedCategories.length > 0 && (
                <span className="text-sm text-slate-500">
                  Categories: {recommendedCategories.join(", ")}
                </span>
              )}
            </div>

            {isRecommendedLoading ? (
              <LoadingSpinner size="lg" className="py-20" />
            ) : recommendedEvents.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-5xl mb-4">✨</p>
                <p className="text-lg">
                  No recommendations yet. Save or book an event to get
                  suggestions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                Featured Events
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Upcoming events you shouldn't miss
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-1.5 text-sm text-accent-purple-light hover:text-accent-purple transition-colors font-medium"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isFeaturedLoading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-5xl mb-4">🎪</p>
              <p className="text-lg">No events yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 border-t border-dark-600">
          <div className="page-container">
            <div className="card p-10 text-center bg-gradient-to-br from-dark-700 to-dark-800 border-accent-purple/20">
              <h2 className="text-2xl font-bold mb-3">Are you an Organizer?</h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                Create and manage events, track ticket sales, and verify
                attendees with QR scanning.
              </p>
              <Link to="/register?role=organizer" className="btn-primary">
                Start as Organizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
