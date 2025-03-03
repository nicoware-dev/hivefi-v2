# AI Chat Client

A modern, feature-rich chat interface for AI agents built with React, TypeScript, and the Next.js App Router.

## Features

### Current Features

#### Home Page
- Landing Page
- Agents Directory

#### Chat Interface
- Real-time messaging with AI agents
- Markdown message rendering with code highlighting
- Auto-scrolling chat window
- Message timestamps
- Copy message content
- Loading states and typing indicators

#### Navigation & Layout
- Responsive sidebar navigation
- Mobile-friendly design
- Dark mode interface
- Collapsible agent list
- Breadcrumb navigation

#### Analytics Dashboard (Mock-Up)
- Real-time data visualization
- Interactive charts and graphs
- Key metrics display
- Performance tracking
- Custom date range selection

#### Portfolio Management (Mock-Up)
- Asset overview
- Performance tracking
- Distribution charts
- Transaction history
- Real-time value updates

#### Settings Panel (Mock-Up)
- Agent configuration
- System preferences
- API key management
- Service integrations
- Usage monitoring
- Resource management

### Technical Features
- TypeScript for type safety
- React Server Components
- Tanstack Query for data fetching
- Responsive Tailwind CSS design
- Shadcn UI components
- Error boundaries
- Performance optimizations

## Planned Improvements

### Short Term
- [ ] File attachments support (images)
- [ ] Message history (Short Term - Last 50 messages)
- [ ] Enhanced file upload preview
- [ ] Toast notifications
- [ ] Loading skeletons
- [ ] Improved error handling

### Medium Term
- [ ] Wallet Connection Improvements
- [ ] Portfolio Page Implementation
- [ ] Analytics Page Implementation
- [ ] Settings Page Implementation
- [ ] Transactions Page Implementation
- [ ] Token Gating
- [ ] Keyboard shortcuts
- [ ] Customizable themes (Dark Mode, Light Mode)
- [ ] Export chat history

### Long Term
- [ ] Voice messages
- [ ] One-Click Deploy Custom agent templates
- [ ] Plugin system
- [ ] Analytics export
- [ ] Team collaboration features

## Architecture

The application follows a modular architecture with:
- Component-based structure
- Server/Client component separation
- Type-safe data fetching
- State management with React Query
- Responsive design patterns

## Pages

### `/chat/[agentId]`
Main chat interface with:
- Message history
- Input area
- File attachments
- Agent information

### `/analytics`
Analytics dashboard featuring:
- Performance metrics
- Usage statistics
- Interactive charts
- Data filtering

### `/portfolio`
Portfolio management with:
- Asset overview
- Performance tracking
- Distribution charts
- Transaction history

### `/settings`
Settings panel including:
- Agent configuration
- System preferences
- Integration management
- Usage monitoring

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Technology Stack
- React 18
- TypeScript
- Next.js 14
- Tailwind CSS
- Shadcn UI
- Tanstack Query
- Recharts
- Radix UI

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - see LICENSE for details

