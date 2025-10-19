# Culinary Command Center

## Project Overview

Culinary Command Center is an intelligent web application that automates weekly meal planning, recipe suggestions, and shopping list generation. It integrates AI-powered recipe generation with pantry management and store-specific shopping lists to streamline meal preparation and grocery shopping.

## Features

### Phase 1: Minimum Viable Product (MVP)
- Weekly Planner UI with a 7-day calendar.
- AI Meal Suggestion integration for recipe generation.
- Recipe detail viewing with ingredients and instructions.
- Basic shopping list generation from planned meals.

### Phase 2: Smart Logistics Engine
- Pantry management system to track available ingredients.
- Custom multi-list manager for different stores.
- Intelligent shopping list generation that subtracts pantry stock.
- Sorting interface for shopping lists and store-specific shopping completion.

### Phase 3: Adaptive AI Assistant & Advanced Features
- Favorites and weekly recap feedback loop.
- Multi-week planning with scrollable week selector and auto-advance.
- Recipe book with search, categories, and quick add to week.
- Progressive Web App (PWA) support and external API integrations.

## Project Structure

- `client/`: React front-end application.
- `server/`: Express backend API server.
- `README.md`: Project documentation and development notes.

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Client Setup
```bash
cd client
npm install
npm run dev
```

### Server Setup
```bash
cd server
npm install
# Create a .env file with your OpenAI API key and other configs
npm start
```

### Running Both
Use separate terminals or a tool like `concurrently` to run client and server simultaneously.

## Environment Variables

Create a `.env` file in the `server/` directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Development Workflow

- Implement features in phases as outlined above.
- Commit changes frequently with descriptive messages.
- Update this README with new features, design decisions, and workflows.
- Use React Context for state management in the client.
- Use Express routes for backend API endpoints.

## README Maintenance

- The README will be updated continuously as new features, designs, and workflows are added.
- Each update will include a date and summary of changes.
- This ensures documentation stays current and useful for developers and users.

## Future Enhancements

- User authentication and profiles.
- Integration with external grocery APIs for "Send to Cart".
- Offline support and PWA installation.
- Collaborative meal planning and sharing.

## License

MIT License

---

_Last updated: October 18, 2025_
