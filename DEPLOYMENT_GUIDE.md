# CRC360 Deployment Guide

## 🚀 GitHub Repository Setup

### Step 1: Create GitHub Repository
1. Go to [GitHub New Repository](https://github.com/new)
2. Set repository name: **CRC360**
3. Set description: **CRC360 - Comprehensive Risk and Compliance 360° Dashboard for BCP Securities Services**
4. Make it **Public** (or Private if preferred)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 2: Push Code to GitHub
The local repository is already initialized and committed. Run these commands:

```bash
# Push to GitHub (remote origin is already configured)
git branch -M main
git push -u origin main
```

## 📋 Application Status

### ✅ Completed Features
- **Main Dashboard**: Unified navigation and overview
- **Rep Watch**: Risk monitoring and reporting
- **AML Center**: Anti-money laundering compliance tools
- **Doc Secure**: Document management with admin features
- **R-Sense**: Risk calculation platform (core functionality)
- **Admin System**: Centralized admin access
- **Authentication**: Secure login system
- **File Processing**: Excel, PDF, XML handling
- **Build System**: Optimized Next.js build

### ⚠️ Known Limitations
- Some R-Sense advanced features temporarily disabled for stability
- Windows-specific path warnings (non-critical)
- Large file uploads may need server configuration

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Python 3.8+ (for Excel processing)

### Installation
```bash
# Clone repository
git clone https://github.com/gitsupportb/CRC360.git
cd CRC360

# Install dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Start development server
npm run dev
```

### Access Points
- **Main Dashboard**: http://localhost:3000
- **Rep Watch**: http://localhost:3000/rep-watch
- **AML Center**: http://localhost:3000/amlcenter
- **Doc Secure**: http://localhost:3000/docsecure
- **R-Sense**: http://localhost:3000/rsense
- **Admin Panel**: http://localhost:3000/admin

## 🐳 Docker Deployment

### Build and Run
```bash
# Build Docker image
docker build -t crc360 .

# Run container
docker run -p 3000:3000 crc360
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Environment Variables
Create `.env.production`:
```env
NODE_ENV=production
PORT=3000
UPLOAD_MAX_SIZE=50MB
```

### Build for Production
```bash
# Build application
npm run build

# Start production server
npm start
```

### Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ for documents and uploads
- **Network**: HTTPS recommended for production

## 🔧 Configuration

### File Upload Limits
Edit `integrated-server.js`:
```javascript
// Increase upload limit
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
```

### Database Configuration
- SQLite database for document metadata
- File-based storage for uploads
- Automatic backup recommended

### Security Settings
- Admin credentials in `utils/docsecure/auth.json`
- Session-based authentication
- CORS protection enabled

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Log Files
- Application logs: Console output
- Upload logs: `uploads/` directory
- Error logs: Browser console

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Update npm packages
npm update

# Update Python packages
pip install -r requirements.txt --upgrade
```

### Backup Strategy
```bash
# Backup documents
tar -czf backup-$(date +%Y%m%d).tar.gz docsecureDOCS/ uploads/

# Backup database
cp utils/docsecure/*.db backup/
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear cache: `rm -rf .next node_modules`
   - Reinstall: `npm install`

2. **File Upload Issues**
   - Check disk space
   - Verify upload directory permissions
   - Increase server timeout

3. **Python Script Errors**
   - Verify Python installation
   - Check requirements.txt dependencies
   - Ensure proper file permissions

### Support
- Check GitHub Issues
- Review application logs
- Contact development team

## 📈 Performance Optimization

### Production Optimizations
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategy
- Monitor resource usage

### Scaling Considerations
- Load balancer for multiple instances
- Separate database server
- File storage optimization
- API rate limiting

---

## 🎉 Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Local development tested
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Security settings verified
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete

**CRC360 is now ready for production use!** 🚀
