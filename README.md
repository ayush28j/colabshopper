# 🛒 ColabShopper

<div align="center">
  <h3>A collaborative shopping list management platform with real-time synchronization</h3>
  <p>Create, share, and manage shopping lists with friends and family</p>
</div>

---

## ✨ Features

### 🎯 Core Features
- **📝 Create Shopping Lists**: Create both public and private shopping lists
- **👥 Collaboration**: Add collaborators with granular permission controls
- **🔄 Real-time Sync**: WebSocket-powered real-time updates across all devices
- **📊 Custom Columns**: Add custom columns like "Store", "Category", "Price", etc.
- **👤 Who Brings**: Track who is bringing which items and quantities
- **🔍 Smart Filtering**: Filter items by any column (person, store, category, etc.)
- **🔐 Authentication**: Secure JWT-based authentication system
- **📱 Mobile Responsive**: Fully optimized for mobile, tablet, and desktop

### 🎨 User Experience
- **Beautiful UI**: Modern gradient-based design with smooth animations
- **Intuitive Interface**: Easy-to-use interface with inline editing
- **Real-time Collaboration**: See changes as they happen
- **Permission Management**: Fine-grained control over who can do what
- **List Management**: Organize your lists (owned vs shared with you)

---

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **WebSocket (ws)** - Real-time communication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server (production)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **npm** or **yarn**

### Option 1: Docker (Recommended)

The easiest way to run ColabShopper is using Docker Compose:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/colabshopper.git
   cd colabshopper
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=your-secure-password
   MONGO_INITDB_DATABASE=colabshopper
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - MongoDB: localhost:27017

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd colabshopper-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/colabshopper
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start the backend server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   Backend will run on http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd colabshopper-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL** (if needed)
   
   Edit `src/utils/api.ts` and update the base URL:
   ```typescript
   const BASE_URL = 'http://localhost:8000/api/v1';
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Frontend will run on http://localhost:3000

---

## 📁 Project Structure

```
colabshopper/
├── colabshopper-backend/          # Backend API server
│   ├── controllers/            # Business logic
│   │   ├── list.controller.js
│   │   └── user.controller.js
│   ├── models/                 # MongoDB models
│   │   ├── List.js
│   │   ├── ListItem.js
│   │   └── User.js
│   ├── ws/                     # WebSocket implementation
│   │   ├── ws-server.js
│   │   └── ws-client.js
│   ├── auth.js                 # JWT authentication middleware
│   ├── routes.js               # API routes
│   ├── server.js               # Express server setup
│   └── package.json
│
├── colabshopper-frontend/         # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── header/
│   │   │   └── footer/
│   │   ├── pages/              # Page components
│   │   │   ├── home/
│   │   │   ├── list/
│   │   │   ├── my-lists/
│   │   │   └── my-profile/
│   │   ├── modals/             # Modal components
│   │   ├── utils/              # Utilities
│   │   │   └── api.ts          # API client
│   │   └── App.tsx             # Main app component
│   └── package.json
│
├── docker-compose.yml          # Docker orchestration
├── API_DOCUMENTATION.md        # Complete API reference
└── README.md                   # This file
```

---

## 📖 Usage Guide

### Creating Your First List

1. **Sign up or Login**
   - Click "Login" in the header
   - Register a new account or login with existing credentials

2. **Create a List**
   - Click "Create List" on the home page
   - Choose "Public" (anyone can access) or "Private" (requires authentication)
   - Enter list name and optional description
   - Click "Create"

3. **Add Items**
   - In the table, use the first row to add new items
   - Enter item name, quantity, and unit
   - Click the "+" button to add

4. **Customize Your List**
   - **Add Custom Columns**: Use "Add Column" to add fields like "Store", "Category", etc.
   - **Filter Items**: Click the 🔍 icon on any column header to filter items
   - **Assign Bringers**: Click the ✎ icon in the "whoBrings" column to assign items to people

### Collaborating on Lists

1. **Add Collaborators** (Private lists only)
   - Scroll to "Collaborators" section
   - Enter collaborator email
   - Select permissions for the collaborator
   - Click "Add Collaborator"

2. **Manage Permissions**
   - Edit permissions anytime by clicking "✎ Edit Permissions"
   - Available permissions:
     - Add/Edit/Delete Items
     - Edit Description
     - Add/Remove Collaborators
     - Update Permissions
     - Add/Remove Columns

### Filtering Items

- Click the 🔍 filter button on any column header
- Select a value from the dropdown to filter items
- Multiple filters can be active simultaneously
- Use "Clear All Filters" to remove all filters

---

## 🔌 API Documentation

The complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Base URL
```
http://localhost:8000/api/v1
```

### Main Endpoints

- **Authentication**: `/register`, `/login`, `/token/refresh`
- **User**: `/user`, `/user/name`, `/user/country`
- **Lists**: `/lists`, `/list/:listId`, `/list/:listId/description`
- **Collaborators**: `/list/:listId/collaborators`
- **Columns**: `/list/:listId/additional-columns`
- **Items**: `/list/:listId/item`

All endpoints require JWT authentication (except registration and login).

---

## 🌐 WebSocket Integration

ColabShopper uses WebSocket for real-time updates. Connect to:

```
ws://localhost:8000/ws
```

After connection, send:
```json
{
  "listId": "your-list-id",
  "token": "your-jwt-token"  // Required for private lists
}
```

The server will send updates for:
- List description changes
- Collaborator additions/removals
- Column additions/removals
- Item additions/updates/deletions

See [colabshopper-backend/ws/README.md](./colabshopper-backend/ws/README.md) for detailed WebSocket documentation.

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Permission System**: Fine-grained access control
- **CORS Configuration**: Cross-origin resource sharing configured
- **Input Validation**: Server-side validation for all inputs

---

## 🎨 Customization

### Adding Custom Columns

1. Navigate to your list
2. Scroll to "Additional Columns" section
3. Enter column name
4. Select column type:
   - **Text**: Free-form text input
   - **Number**: Numeric values only
   - **Person**: Dropdown of collaborators/bringers
5. Click "Add Column"

### Column Types

- **Text**: General purpose text field
- **Number**: Numeric values (validated on input)
- **Person**: Links to people (collaborators for private lists, bringers for public lists)

---

## 📱 Mobile Support

ColabShopper is fully responsive and optimized for:
- 📱 Mobile phones (320px and above)
- 📱 Tablets (768px and above)
- 💻 Desktop (1024px and above)

All features work seamlessly across devices with touch-friendly interfaces.

---

## 🧪 Testing

### Backend API Testing

Use the provided Postman collection:
1. Import `postman_collection.json` into Postman
2. Set environment variables:
   - `base_url`: http://localhost:8000
   - `access_token`: Your JWT token (after login)

### Frontend Testing

```bash
cd colabshopper-frontend
npm test
```

---

## 🚢 Deployment

### Docker Deployment

1. Update `docker-compose.yml` with production environment variables
2. Build and start:
   ```bash
   docker-compose up -d --build
   ```

### Manual Deployment

1. **Backend**:
   ```bash
   cd colabshopper-backend
   npm install --production
   npm start
   ```

2. **Frontend**:
   ```bash
   cd colabshopper-frontend
   npm install
   npm run build
   # Serve the build folder with nginx or any static server
   ```

### Environment Variables

**Backend:**
- `PORT`: Server port (default: 8000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

**Docker:**
- `MONGO_INITDB_ROOT_USERNAME`: MongoDB root username
- `MONGO_INITDB_ROOT_PASSWORD`: MongoDB root password
- `MONGO_INITDB_DATABASE`: Database name
- `JWT_SECRET`: JWT secret key

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👤 Author

**ayush28j**

- GitHub: [@ayush28j](https://github.com/ayush28j)

---

## 🙏 Acknowledgments

- Built with ❤️ using React, Node.js, and MongoDB
- Inspired by the need for better collaborative shopping experiences

---

## 📞 Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/colabshopper/issues).

---

## 🔮 Future Enhancements

- [ ] Email notifications for list updates
- [ ] Mobile app (React Native)
- [ ] List templates
- [ ] Export lists (PDF, CSV)
- [ ] Shopping cart integration
- [ ] Multi-language support
- [ ] Dark mode theme

---

<div align="center">
  <p>Made with ❤️ by the ColabShopper team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

