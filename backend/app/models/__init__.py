# Import all models so they are registered with Base.metadata
from .user import UserRole
from .consultant import Consultant, ConsultantService, ConsultantReview
from .consultant_application import ConsultantApplication
from .consultant_onboarding import ConsultantOnboarding
from .booking import Booking, BookingDocument, BookingStatus, PaymentStatus
from .blog import BlogPost, BlogComment, BlogLike
from .testimonial import Testimonial
from .service import Service
from .service_template import ServiceTemplate
from .faq import FAQ
from .payment import Payment, PaymentMethod, PaymentStatusExtended
from .notification import Notification, NotificationType
from .intake import ClientIntake, IntakeDocument, IntakeStatus
