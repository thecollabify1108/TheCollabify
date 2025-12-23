# Instagram Creator-Seller Promotion Marketplace

A production-ready web application connecting Instagram creators with sellers for paid promotions, featuring AI-assisted matching and profile insights.

## Features

- 🔐 **JWT Authentication** - Secure login/register with role-based access (Creator, Seller, Admin)
- 👤 **Creator Module** - Profile management, AI insights, promotion discovery
- 🏪 **Seller Module** - Campaign creation, AI-powered creator matching, campaign tracking
- 🤖 **AI Matching** - Two-layer matching with rule-based filtering + weighted scoring
- 🔔 **Notifications** - Real-time in-app notification system
- 🛡️ **Admin Panel** - User management and content moderation

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
project 2/
├── backend/
│   ├── config/         # Database configuration
│   ├── middleware/     # Auth and role-check middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # AI insights & matching services
│   └── utils/          # Email and utility services
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # React context providers
│       ├── pages/      # Page components
│       └── services/   # API service
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/creator-marketplace
   JWT_SECRET=your-secret-key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Creators
- `GET /api/creators/profile` - Get creator profile
- `POST /api/creators/profile` - Create profile
- `PUT /api/creators/profile` - Update profile
- `GET /api/creators/promotions` - Get matching promotions
- `POST /api/creators/promotions/:id/apply` - Apply to promotion

### Sellers
- `GET /api/sellers/requests` - Get promotion requests
- `POST /api/sellers/requests` - Create request
- `POST /api/sellers/requests/:id/accept/:creatorId` - Accept creator
- `PUT /api/sellers/requests/:id/status` - Update campaign status

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List users
- `DELETE /api/admin/users/:id` - Delete user

## AI Features

### Profile Insights
- Engagement quality analysis (Low/Medium/High)
- Audience authenticity detection
- Strength identification
- Profile score calculation (0-100)

### Smart Matching
1. **Rule-Based Filtering**: Follower range, budget, category, promotion type
2. **AI Ranking Layer**: Weighted scoring based on engagement, niche similarity, price compatibility

## Creating Admin Account

To create an admin account, you can use the following MongoDB command:

```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$12$...", // bcrypt hashed password
  name: "Admin User",
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

Or use an existing admin account to create new admins via the API.

## License

MIT
