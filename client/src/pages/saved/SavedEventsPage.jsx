import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { savedEventsService } from "../../services/savedEventsService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { Calendar, MapPin, Users, Bookmark } from "lucide-react";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedEventsPage() {
  const queryClient = useQueryClient();
  const {
    data: savedEventsResponse = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["saved-events"],
    queryFn: savedEventsService.getSavedEvents,
  });

  const savedEvents = savedEventsResponse.data || [];

  const removeMutation = useMutation({
    mutationFn: savedEventsService.unsaveEvent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-events"] }),
  });

  const handleRemove = async (eventId) => {
    await removeMutation.mutateAsync(eventId);
  };

  if (isLoading) return <LoadingSpinner size="xl" className="py-32" />;

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-accent-purple" />
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Saved Events</h1>
            <p className="text-slate-400">Events you saved for later.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-6 text-center text-red-400">
          Failed to load saved events. Please refresh.
        </div>
      )}

      {savedEvents.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📌</p>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">
            No saved events yet
          </h2>
          <p className="text-slate-500 mb-6">
            Browse events and save the ones you like.
          </p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {savedEvents.map((event) => (
          <div key={event.event_id} className="card overflow-hidden">
            {event.cover_image_url && (
              <div className="h-44 overflow-hidden">
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-accent-purple font-semibold">
                  Saved
                </span>
                <span className="text-xs text-slate-500">
                  {formatDate(event.start_at)}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-3 line-clamp-2">
                {event.title}
              </h2>
              <div className="space-y-2 text-sm text-slate-400 mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-purple" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-purple" />
                  <span>Organized by {event.organizer_name}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/events/${event.event_id}`}
                  className="btn-secondary text-sm py-2"
                >
                  View event
                </Link>
                <button
                  onClick={() => handleRemove(event.event_id)}
                  className="btn-danger text-sm py-2"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
