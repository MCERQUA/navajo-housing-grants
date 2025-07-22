# Navajo Housing Grant Assistant

Yá'át'ééh! A culturally sensitive, AI-powered web application designed to help Navajo Nation members complete federal housing grant applications with step-by-step guidance and intelligent assistance.

## 🏠 Features

- **Step-by-Step Form Guidance**: 5 comprehensive steps covering all necessary federal grant information
- **AI-Powered Assistant**: OpenAI GPT-4o-mini integration with focused housing grant expertise
- **Rate Limited & Secure**: 20 questions per hour limit to prevent API abuse
- **Mobile Responsive**: Optimized for all devices with prevent-zoom functionality
- **Cultural Sensitivity**: Designed specifically for Navajo Nation community members
- **Export Functionality**: Download PDF, share, or email completed applications
- **Multiple Grant Types**: Support for NAHASDA, IHBG, Section 184, and more

## 🚀 Live Demo

**Deployed at**: [Your Netlify URL will be here]

## 🛠️ Technologies Used

- **Frontend**: React 18, Tailwind CSS
- **AI Integration**: OpenAI GPT-4o-mini API
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Build Tool**: Create React App

## 📋 Grant Types Supported

- NAHASDA (Native American Housing Assistance)
- IHBG (Indian Housing Block Grant)  
- Title VI Loan Guarantee
- Section 184 Indian Home Loan Guarantee
- Rural Development Section 502 Direct Loan
- USDA Rural Repair & Rehabilitation Grant

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/MCERQUA/navajo-housing-grants.git
   cd navajo-housing-grants
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🚀 Deployment to Netlify

### Option 1: Direct GitHub Integration (Recommended)

1. **Fork this repository** to your GitHub account

2. **Create a Netlify account** at [netlify.com](https://netlify.com)

3. **Connect your repository**:
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your forked repository

4. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18`

5. **Add environment variables**:
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_OPENAI_API_KEY` with your OpenAI API key

6. **Deploy**: Netlify will automatically build and deploy your site

### Option 2: Manual Deployment

1. **Build the project locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `build` folder to [netlify.com/drop](https://netlify.com/drop)
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=build
     ```

## 🤖 AI Assistant Features

### Rate Limiting
- **20 questions per hour** per user
- **150 tokens maximum** per response
- **Local storage tracking** of usage
- **Automatic reset** after 1 hour

### Focused Assistance
The AI assistant is specifically programmed to:
- ✅ Help with housing grant applications
- ✅ Explain federal assistance programs
- ✅ Guide through form completion
- ✅ Answer eligibility questions
- ✅ Provide Navajo-specific housing resources

- ❌ **Will NOT answer off-topic questions** (food, weather, entertainment, etc.)
- ❌ Politely redirects non-housing-related queries

## 📱 Mobile Optimization

- **Responsive design** for all screen sizes
- **Prevent zoom on input focus** (16px font size)
- **Touch-friendly interfaces**
- **Optimized chat experience**

## 🔒 Security & Privacy

- **Client-side only**: No data stored on servers
- **Local storage**: Form data saved locally for convenience
- **API key protection**: Environment variables for sensitive data
- **Rate limiting**: Prevents API abuse

## 🎨 Customization

### Styling
- Uses Tailwind CSS for responsive design
- Navajo Nation color scheme (red/orange theme)
- Cultural symbols and respectful language

### Rate Limits
Edit these constants in `src/App.js`:
```javascript
const MAX_REQUESTS_PER_HOUR = 20;
const MAX_TOKENS_PER_REQUEST = 150;
```

### Grant Types
Add or modify grant types in the `grantTypes` array in `src/App.js`

## 📄 File Structure

```
navajo-housing-grants/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── App.js             # Main React component
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For technical support or questions:
- Open an issue in this repository
- Contact your local Navajo Nation housing authority
- Email: [your-support-email@example.com]

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Navajo Nation Housing Authority
- Federal housing assistance programs
- OpenAI for AI capabilities
- React and open-source community

---

**Ahéhee'** (Thank you) for helping make housing assistance more accessible to the Navajo Nation community!