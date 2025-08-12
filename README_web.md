# BirthLink Ghana – Web Edition

A **web-first** birth registration application designed for remote Ghanaian communities, enabling offline registration with automatic data sync when connectivity becomes available.

## 🌟 Features

- **Offline-First Design**: Works without internet, syncing when back online  
- **PWA Support**: Installable and works like a native app in browsers  
- **Firebase Integration**: Firestore for data storage & Auth for secure access  
- **Multi-Language Support**: English, Twi, Ga, and Ewe  
- **Role-Based Access**: Admin, Registrar, and Viewer roles  
- **SMS Fallback**: Twilio integration for low-connectivity alerts  
- **Secure**: Firebase Authentication, HTTPS, and data validation

## 🏗️ Project Structure

```
birthlink-ghana-web/
├── src/             # React application source
├── public/          # Static assets
├── functions/       # Firebase Cloud Functions for backend logic
├── docs/            # Documentation
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (≥18.0.0)  
- Yarn (≥1.22.0)  
- Firebase CLI (`npm install -g firebase-tools`)  
- A Firebase project set up

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd birthlink-ghana-web
   yarn install
   ```

2. **Environment Configuration:**
   
   Create `.env` in the project root:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_sid
   REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_token
   ```

3. **Firebase Setup:**
   - Create a Firebase project  
   - Enable **Authentication** (Email/Password)  
   - Enable **Firestore Database**  
   - Enable **Hosting** and **Cloud Functions**  
   - Configure `firebaserc` and `firebase.json` for deployment

### Development

```bash
# Start the development server
yarn start
```

For backend logic (Cloud Functions):
```bash
cd functions
yarn serve
```

### Build & Deploy

```bash
yarn build
firebase deploy
```

---

## 🖥️ Web Application Stack

- **Frontend**: React + Vite (fast builds & HMR)  
- **State Management**: Redux Toolkit + Redux Persist  
- **Routing**: React Router v6  
- **Internationalization**: i18next  
- **Offline Support**: Workbox + IndexedDB  
- **Backend**: Firebase Cloud Functions (Node.js)  
- **Hosting**: Firebase Hosting  
- **SMS**: Twilio API

---

## 🌍 Internationalization

Supported languages:
- **English** (en) – Default  
- **Twi** (tw) – Ghana  
- **Ga** (ga) – Ghana  
- **Ewe** (ee) – Ghana  

Language JSON files are stored in `src/i18n/`.

---

## 🔐 Security Features

- Firebase Authentication  
- Role-based access control  
- Input sanitization & validation  
- HTTPS enforced via Firebase Hosting  
- Rate limiting & abuse protection in Cloud Functions

---

## 📊 Offline Capabilities

- IndexedDB for local data storage  
- Automatic background sync via Service Workers  
- Queue management for form submissions  
- Network status detection

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Submit a pull request

**Development Guidelines**
- Follow ESLint & Prettier rules  
- Add tests for new features  
- Maintain offline-first behavior

---

## 📄 License

MIT License – see LICENSE file

---

**Made with ❤️ for Ghana's birth registration initiative**
