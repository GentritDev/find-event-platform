const translations = {
  en: {
    // Navigation
    nav: {
      events: 'Events',
      myTickets: 'My Tickets',
      organizer: 'Organizer',
      scan: 'Scan',
      admin: 'Admin',
      login: 'Login',
      signUp: 'Sign Up',
      logout: 'Logout',
      hi: 'Hi',
    },

    // Home Page
    home: {
      badge: 'Discover & Book Amazing Events',
      heroTitle1: 'Find Your Next',
      heroTitle2: 'Unforgettable',
      heroTitle3: 'Experience',
      heroSubtitle:
        'Browse thousands of events — concerts, tech talks, workshops, and more. Book tickets instantly and get your QR code.',
      browseEvents: 'Browse Events',
      createAccount: 'Create Account',
      feature1Title: 'Instant Booking',
      feature1Desc:
        'Book tickets in seconds with PayPal. Your QR code is ready immediately.',
      feature2Title: 'QR Verification',
      feature2Desc:
        'Organizers scan your unique QR code at entry. No paper needed.',
      feature3Title: 'Email Confirmation',
      feature3Desc:
        'Receive ticket confirmation directly to your email with all event details.',
      featuredEvents: 'Featured Events',
      featuredSubtitle: "Upcoming events you shouldn't miss",
      viewAll: 'View all',
      noEventsYet: 'No events yet. Check back soon!',
      ctaTitle: 'Are you an Organizer?',
      ctaDesc:
        'Create and manage events, track ticket sales, and verify attendees with QR scanning.',
      startAsOrganizer: 'Start as Organizer',
    },

    // Auth
    auth: {
      welcomeBack: 'Welcome back',
      signInSubtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      createOne: 'Create one',
      createAccount: 'Create account',
      joinToday: 'Join FindEvent today',
      fullName: 'Full Name',
      minCharacters: 'Min. 6 characters',
      accountType: 'Account Type',
      attendee: '👤 Attendee',
      attendeeDesc: 'Browse & buy tickets',
      organizerRole: '🎪 Organizer',
      organizerDesc: 'Create & manage events',
      alreadyHaveAccount: 'Already have an account?',
      signInLink: 'Sign in',
      welcomeToast: 'Welcome back,',
      welcomeNewToast: 'Welcome,',
      accountCreated: '! Account created.',
    },

    // Events
    events: {
      browseTitle: 'Browse Events',
      browseSubtitle: 'Discover amazing events near you',
      searchPlaceholder: 'Search events...',
      allCategories: 'All Categories',
      noEventsFound: 'No events found',
      adjustSearch: 'Try adjusting your search or filters',
      eventsFound: 'events found',
      updating: 'Updating...',
      previous: 'Previous',
      next: 'Next',
      pageOf: 'Page {page} of {total}',
    },

    // Event Detail
    eventDetail: {
      backToEvents: 'Back to Events',
      aboutEvent: 'About this event',
      organizedBy: 'Organized by',
      free: 'Free',
      perTicket: 'per ticket',
      cancelled: 'This event has been cancelled',
      soldOut: 'This event is sold out',
      getFreeTicket: 'Get Free Ticket',
      buyWithPayPal: 'Buy with PayPal',
      loginToPurchase: 'Login to Purchase',
      capacity: 'Capacity',
      ticketsSold: 'Tickets sold',
      available: 'Available',
      soldOutLabel: 'Sold out',
      spotsAvailable: '{spots} of {total} spots available',
      eventNotFound: 'Event not found',
      start: 'Start:',
      end: 'End:',
    },

    // My Tickets
    tickets: {
      myTickets: 'My Tickets',
      subtitle: 'Your purchased event tickets with QR codes',
      failedLoad: 'Failed to load tickets. Please try again.',
      noTickets: 'No tickets yet',
      noTicketsDesc: 'Browse events and purchase your first ticket!',
      browseEvents: 'Browse Events',
      showAtEntrance: 'Show at entrance',
      usedOn: '✅ Used on',
      notAvailable: 'N/A',
    },

    // Organizer Dashboard
    organizer: {
      dashboard: 'Organizer Dashboard',
      manageEvents: 'Manage your events',
      newEvent: 'New Event',
      totalEvents: 'Total Events',
      published: 'Published',
      draft: 'Draft',
      totalCapacity: 'Total Capacity',
      noEvents: 'No events yet',
      createFirstEvent: 'Create your first event to get started',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      event: 'Event',
      date: 'Date',
      tickets: 'Tickets',
      status: 'Status',
      actions: 'Actions',
      cancel: 'Cancel',
      updateEvent: 'Update Event',
      uploading: 'Uploading...',
      upload: 'Upload',
      imageUrlPlaceholder: 'Image URL or upload below',
      selectCategory: 'Select category',
      titleLabel: 'Title *',
      descriptionLabel: 'Description *',
      categoryLabel: 'Category',
      locationLabel: 'Location *',
      startDateLabel: 'Start Date & Time *',
      endDateLabel: 'End Date & Time *',
      priceLabel: 'Price (EUR)',
      capacityLabel: 'Capacity *',
      coverImageLabel: 'Cover Image',
      statusLabel: 'Status',
      draftStatus: 'Draft',
      publishedStatus: 'Published',
      eventUpdated: 'Event updated!',
      eventCreated: 'Event created!',
      eventDeleted: 'Event deleted',
      eventPublished: 'Event published!',
      imageUploaded: 'Image uploaded!',
      uploadFailed: 'Upload failed',
      deleteConfirm: 'Delete this event?',
    },

    // QR Scanner
    scan: {
      title: 'QR Ticket Scanner',
      subtitle: 'Verify attendee tickets at event entry',
      enterToken: 'Enter QR Token',
      tokenPlaceholder: 'Paste QR token here or type it manually...',
      verifyTicket: 'Verify Ticket',
      validTicket: 'VALID TICKET',
      invalidTicket: 'INVALID TICKET',
      howToUse: 'How to use:',
      howTo1: 'Ask attendee to show their QR code from the My Tickets page',
      howTo2: 'Copy the QR token text or use a QR scanner app to get the token',
      howTo3: 'Paste the token in the box above and click Verify',
      howTo4: 'Green = Valid ✅ | Red = Invalid or already used ❌',
    },

    // Admin Dashboard
    admin: {
      dashboard: 'Admin Dashboard',
      subtitle: 'Platform overview and management',
      totalUsers: 'Total Users',
      publishedEvents: 'Published Events',
      activeTickets: 'Active Tickets',
      totalRevenue: 'Total Revenue',
      usersByRole: 'Users by Role',
      eventsByStatus: 'Events by Status',
      recentUsers: 'Recent Users',
      user: 'User',
      joined: 'Joined',
      role: 'Role',
      changeRole: 'Change Role',
      attendees: 'Attendees',
      organizers: 'Organizers',
      admins: 'Admins',
      roleUpdated: 'User role updated',
    },

    // Payment
    payment: {
      processing: 'Processing your payment...',
      successTitle: 'Payment Successful!',
      successDesc:
        'Your ticket has been confirmed. Check your email for details and your QR code.',
      viewMyTickets: 'View My Tickets',
      cancelTitle: 'Payment Cancelled',
      cancelDesc: 'Your payment was cancelled. No charges were made.',
      browseEvents: 'Browse Events',
      goHome: 'Go Home',
      successToast: 'Payment successful! Your ticket is ready.',
    },

    // Footer
    footer: {
      allRights: 'All rights reserved.',
      events: 'Events',
      support: 'Support',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Try again',
    },
  },
}

export default translations
