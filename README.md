# CRC360 - Comprehensive Risk and Compliance 360° Dashboard

![CRC360 Logo](public/logo.png)

## 🌟 Overview

CRC360 is a comprehensive risk management and compliance platform designed for BCP Securities Services. It provides a unified dashboard integrating multiple specialized applications for risk assessment, compliance monitoring, document management, and reporting.

## 🚀 Features

### 🏠 **Main Dashboard**
- Unified navigation across all modules
- Real-time status indicators
- Responsive design for all devices
- Modern UI with consistent theming

### 📊 **Rep Watch - Risk Monitoring**
- Comprehensive risk analysis and reporting
- Real-time dashboard with key metrics
- Advanced analytics and visualizations
- Customizable reporting tools

### 🛡️ **AML Center - Anti-Money Laundering**
- Client risk assessment tools
- Excel file processing and analysis
- Sanctions list management
- Compliance reporting and monitoring

### 📄 **Doc Secure - Document Management**
- Secure document storage and retrieval
- Category-based organization (Procedures, Policies, etc.)
- Advanced search and filtering
- Version control and audit trails

### 📈 **R-Sense - Risk Calculation**
- Advanced risk modeling and calculations
- Market risk analysis tools
- Portfolio management features
- Stress testing capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Node.js, Express.js
- **File Processing**: XLSX, PDF-Parse, XML2JS
- **Database**: SQLite (for document metadata)
- **Build Tools**: PostCSS, ESLint

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CRC360.git
   cd CRC360
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Build and Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t crc360 .
docker run -p 3000:3000 crc360
```

## 📁 Project Structure

```
CRC360/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── amlcenter/               # AML Center module
│   ├── docsecure/               # Document Security module
│   ├── rep-watch/               # Risk monitoring module
│   ├── rsense/                  # Risk calculation module
│   └── api/                     # API routes
├── components/                   # Reusable UI components
├── lib/                         # Utility functions
├── public/                      # Static assets
├── uploads/                     # File upload directory
├── docsecureDOCS/              # Document storage
└── integrated-server.js        # Custom server integration
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NODE_ENV=production
PORT=3000
UPLOAD_MAX_SIZE=50MB
```

### Server Configuration
The application uses a custom integrated server (`integrated-server.js`) that combines:
- Next.js application server
- Express.js for API routes
- File upload handling
- Static file serving

## 🚀 Usage

### Accessing Modules

- **Main Dashboard**: `http://localhost:3000`
- **Rep Watch**: `http://localhost:3000/rep-watch`
- **AML Center**: `http://localhost:3000/amlcenter`
- **Doc Secure**: `http://localhost:3000/docsecure`
- **R-Sense**: `http://localhost:3000/rsense`

### File Upload Limits
- Maximum file size: 50MB
- Supported formats: PDF, XLSX, DOCX, XML
- Automatic file categorization

## 🔒 Security Features

- Secure file upload validation
- Admin-only access controls
- Session-based authentication
- Input sanitization and validation
- CORS protection

## 📊 Monitoring and Analytics

- Real-time performance metrics
- Error tracking and logging
- User activity monitoring
- System health indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About BCP Securities Services

CRC360 is developed for BCP Securities Services, providing comprehensive risk management and compliance solutions for financial institutions.

## 📞 Support

For support and questions:
- Email: support@bcpsecurities.ma
- Documentation: [Wiki](https://github.com/yourusername/CRC360/wiki)
- Issues: [GitHub Issues](https://github.com/yourusername/CRC360/issues)

---

**Built with ❤️ by the BCP Securities Services Development Team**
