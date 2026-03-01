# Family Bridge Web Application

A web platform connecting residents, family members, and staff in care facilities.

## Features

- 🔐 **Role-based Authentication** - Separate dashboards for residents, family members, and staff
- 💰 **Credit System** - Family members can send credits to residents
- 🎯 **Service Booking** - Residents can book services using credits
- 💬 **Messaging** - Real-time communication between all user types
- 📊 **Admin Dashboard** - Staff can manage residents, services, and bookings
- ⚡ **Real-time Sync** - Powered by Supabase for instant updates

## Tech Stack

- **Frontend**: Expo + React Native Web
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Jotai
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md) to:
- Run the database schema
- Create test users
- Verify setup

### 3. Start the Development Server

```bash
npm run web
```

The app will open at `http://localhost:8081`

### 4. Test Accounts

- **Resident**: `resident@test.com` / `password123`
- **Family**: `family@test.com` / `password123`
- **Staff**: `staff@test.com` / `password123`

## Project Structure

```
family-bridge-web/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (resident)/        # Resident dashboard
│   ├── (family)/          # Family dashboard
│   └── (admin)/           # Admin dashboard
├── components/            # Reusable components
│   └── ui/               # UI components (Button, Input, Card)
├── lib/                  # Libraries and utilities
│   └── supabase.ts       # Supabase client
├── store/                # State management
│   └── atoms.ts          # Jotai atoms
├── constants/            # App constants
│   └── theme.ts          # Design system
└── types/                # TypeScript types
    └── database.ts       # Database types
```

## Available Scripts

- `npm run web` - Start web development server
- `npm run android` - Start Android development
- `npm run ios` - Start iOS development

## Features by Role

### 🏠 Resident
- View credit balance
- Book services
- Send/receive messages
- View activity feed

### 👨‍👩‍👧 Family
- Send credits to residents
- Gift services
- View resident activity
- Message residents and staff

### 🔧 Staff/Admin
- Manage residents
- Manage services
- View bookings
- Analytics and reports
- Broadcast messages

## Database Schema

See [supabase_schema.sql](./supabase_schema.sql) for the complete database schema including:
- User profiles with roles
- Messages
- Credit transactions
- Services
- Bookings
- Row Level Security policies

## Environment Variables

The app uses the following environment variables (already configured in `.env`):

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon public key

## License

MIT
