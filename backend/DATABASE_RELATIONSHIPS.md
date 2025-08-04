# Database Relationships Structure

This document outlines the proper relationship structure for the consultation platform database.

## Key Design Principles

### 1. Supabase Auth Integration
- **No User Model**: We use Supabase Auth's `auth.users` table for user management
- **UUID References**: All user references use `UUID` type pointing to `auth.users.id`
- **Role Management**: User roles are stored in enum and can be extended with user profile data if needed

### 2. Relationship Structure

```
auth.users (Supabase managed)
    ↓ (user_id references)
    ├── Consultant (one-to-one for RCIC users)
    │   ├── ConsultantService (one-to-many)
    │   ├── ConsultantReview (one-to-many)
    │   ├── Booking (one-to-many)
    │   └── Payment (one-to-many)
    │
    ├── BlogPost (one-to-many via author_id)
    │   ├── BlogComment (one-to-many)
    │   └── BlogLike (one-to-many)
    │
    ├── BlogComment (one-to-many via author_id)
    ├── BlogLike (one-to-many via user_id)
    ├── ConsultantReview (one-to-many via client_id)
    ├── Booking (one-to-many via client_id)
    ├── Payment (one-to-many via client_id)
    └── Notification (one-to-many via user_id)
```

## Model Relationships

### Core Business Models

#### Consultant
- **Has many**: services, reviews, bookings, payments
- **Belongs to**: Supabase auth.users (via user_id)

#### ConsultantService
- **Belongs to**: consultant
- **Has many**: bookings

#### Booking
- **Belongs to**: consultant, service, client (auth.users)
- **Has many**: documents
- **Has one**: payment

#### Payment
- **Belongs to**: booking, consultant, client (auth.users)

### Content Models

#### BlogPost
- **Belongs to**: author (auth.users)
- **Has many**: comments, likes

#### BlogComment
- **Belongs to**: post, author (auth.users)

#### BlogLike
- **Belongs to**: post, user (auth.users)

### System Models

#### Notification
- **Belongs to**: user (auth.users)

#### ConsultantApplication
- **Standalone**: References email but not directly linked to users until approved

## Benefits of This Structure

### 1. **Clean Separation of Concerns**
- Authentication handled by Supabase
- Business logic in application models
- Clear relationship boundaries

### 2. **Scalable Architecture**
- Easy to add new relationships
- Proper foreign key constraints
- Cascade deletion where appropriate

### 3. **Query Efficiency**
- Direct joins possible between related models
- Lazy loading supported via relationships
- Optimized for common access patterns

### 4. **Data Integrity**
- Foreign key constraints enforce referential integrity
- Cascade deletes prevent orphaned records
- Proper indexing on relationship fields

## Usage Examples

### Access consultant's bookings:
```python
consultant = db.query(Consultant).filter(Consultant.id == 1).first()
bookings = consultant.bookings  # Automatic join via relationship
```

### Access booking with all related data:
```python
booking = db.query(Booking).options(
    joinedload(Booking.consultant),
    joinedload(Booking.service),
    joinedload(Booking.documents),
    joinedload(Booking.payment)
).filter(Booking.id == 1).first()
```

### Access user's activities across the platform:
```python
# Get all user's blog posts
user_posts = db.query(BlogPost).filter(BlogPost.author_id == user_id).all()

# Get all user's bookings as client
user_bookings = db.query(Booking).filter(Booking.client_id == user_id).all()

# Get all user's reviews given
user_reviews = db.query(ConsultantReview).filter(ConsultantReview.client_id == user_id).all()
```

## Migration Strategy

1. **Current State**: Basic foreign keys exist
2. **Enhancement**: Relationships added to models
3. **Future**: Can add indexes, constraints, and additional relationship optimizations

This structure provides a solid foundation for the consultation platform while maintaining clean integration with Supabase Auth.
