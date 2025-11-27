# Inference Economics Calculator

**Created by:** Godwin B.

A comprehensive web-based calculator for AI inference economics, silicon performance comparison, and MW yield analysis.

---

## 📁 Project Structure

```
inference-calculator/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling
├── js/
│   └── app.js             # React application logic
├── docs/
│   └── feature-guide.md   # Detailed feature documentation
└── README.md              # This file
```

---

## 🚀 Quick Start

### Option 1: Open Locally (Simplest)

1. Double-click `index.html`
2. Opens in your default browser
3. ✅ Works completely offline!

### Option 2: Local Web Server (Recommended for development)

```bash
# Using Python 3
cd inference-calculator
python3 -m http.server 8000

# Then open: http://localhost:8000
```

Or using Node.js:
```bash
npx http-server
```

---

## 🌐 Deployment Options

### 1. **Netlify** (Easiest - Free)

#### Option A: Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the entire `inference-calculator` folder
3. Get instant URL like: `https://your-site.netlify.app`

#### Option B: Netlify CLI
```bash
npm install -g netlify-cli
cd inference-calculator
netlify deploy --prod
```

### 2. **GitHub Pages** (Free)

```bash
# 1. Create a GitHub repository
# 2. Push this folder to the repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/inference-calculator.git
git push -u origin main

# 3. Enable GitHub Pages in repository settings
# Your site: https://yourusername.github.io/inference-calculator/
```

### 3. **Vercel** (Free)

```bash
npm install -g vercel
cd inference-calculator
vercel
```

### 4. **AWS S3 + CloudFront** (Professional)

```bash
# Upload to S3 bucket
aws s3 sync . s3://your-bucket-name --acl public-read

# Configure CloudFront for CDN distribution
```

### 5. **Traditional Web Hosting** (cPanel, FTP)

1. Zip the `inference-calculator` folder
2. Upload via FTP/cPanel File Manager
3. Extract in your web root directory
4. Access via: `https://yourdomain.com/inference-calculator/`

---

## 📧 Sharing Options

### Option A: Send as Files

**Via Email:**
1. Zip the entire `inference-calculator` folder
2. Email as attachment (< 25MB)
3. Recipient downloads and opens `index.html`

**Via Cloud Storage:**
- Google Drive: Share folder link
- Dropbox: Share folder link
- OneDrive: Share folder link

### Option B: Host Online

**Best for multiple users:**
1. Deploy using any method above
2. Share the URL (e.g., `https://your-calculator.netlify.app`)
3. Users access directly in browser
4. No downloads needed!

### Option C: Use Built-in Share Feature

**After hosting:**
1. Open the calculator
2. Configure your settings
3. Click "🔗 Share" button
4. Link is copied to clipboard
5. Anyone with the link sees your configuration

---

## ✨ Features

### Core Functionality
- **12 Essential Input Fields** - Complete configuration
- **10 Calculated Fields** - Comprehensive metrics
- **4 Analysis Tabs** - Calculator, MW Yield, Comparison, Pricing
- **Silicon Types** - GPU, FPGA, ASIC, Wafer-Scale

### Data Management
- 💾 **Save** - Store calculations locally
- 📂 **Load** - Restore saved configurations
- 🕐 **Recent** - Quick access to last 10 calculations
- 📥 **Export JSON** - Full data backup
- 📊 **Export CSV** - Spreadsheet format
- 📤 **Import** - Load JSON files
- 🔗 **Share** - Generate shareable links
- ✉️ **Email** - Send results via email
- 🖨️ **Print** - Print-friendly output

### Calculations
- Joules per Token (J/token)
- MW Yield (TPS/MW)
- Cost per Token
- Monthly/Annual Quotes
- ROI Analysis
- Financial Projections
- Energy Efficiency Metrics

---

## 🎯 Use Cases

### For Engineers
- Compare silicon performance
- Calculate energy efficiency
- Optimize hardware selection
- ROI analysis

### For Business
- Client quotes
- Cost projections
- Competitive analysis
- Investment planning

### For Research
- Silicon comparison studies
- Energy efficiency research
- Economic modeling
- Performance benchmarking

---

## 🔧 Technical Details

### Dependencies
- **React 18** - UI framework (CDN)
- **Babel Standalone** - JSX transpiler (CDN)
- **Google Fonts** - Typography (CDN)

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Requirements
- Modern browser (2020+)
- JavaScript enabled
- LocalStorage enabled (for save feature)

### File Sizes
- `index.html`: ~1KB
- `css/styles.css`: ~20KB
- `js/app.js`: ~50KB
- **Total**: ~71KB (excluding CDN libraries)

---

## 📱 Mobile Support

Fully responsive design works on:
- Desktop computers
- Laptops
- Tablets
- Smartphones

---

## 🔒 Privacy & Security

- ✅ **No server required** - Runs entirely in browser
- ✅ **No data collection** - Zero tracking
- ✅ **Local storage only** - Data stays on your device
- ✅ **No authentication** - Instant access
- ✅ **Open source** - Transparent code

---

## 🛠️ Customization

### Update Branding
Edit `index.html`:
```html
<title>Your Company | Inference Calculator</title>
```

### Change Colors
Edit `css/styles.css`:
```css
:root {
    --primary: #00ffaa;    /* Change to your brand color */
    --secondary: #0066ff;
}
```

### Modify Presets
Edit `js/app.js`:
```javascript
const siliconPresets = {
    'GPU': { modelName: 'Your Model', power: 700, ... }
}
```

---

## 📚 Documentation

Detailed feature guide available in:
- `docs/feature-guide.md`

Covers:
- All 9 features in detail
- Workflow examples
- Best practices
- Troubleshooting

---

## 🐛 Troubleshooting

### Calculator doesn't load
- Check browser console for errors
- Ensure JavaScript is enabled
- Try different browser
- Clear browser cache

### Save feature not working
- Check if cookies/localStorage enabled
- Try incognito mode (data won't persist)
- Check browser storage limits

### Share link not working
- Ensure calculator is hosted online
- Check if URL encoding is supported
- Try copying link manually

### Print formatting issues
- Use "Print to PDF" option
- Check printer settings
- Try different browser

---

## 🎓 Quick Examples

### Example 1: Basic Calculation
1. Select silicon type (e.g., GPU)
2. Adjust power and throughput
3. Click "Calculate Metrics"
4. View all results

### Example 2: Save & Compare
1. Configure GPU setup → Calculate → Save as "GPU-Config"
2. Switch to ASIC → Calculate → Save as "ASIC-Config"
3. Use Recent to toggle and compare

### Example 3: Client Quote
1. Configure for client requirements
2. Calculate metrics
3. Export CSV for analysis
4. Email results to client
5. Print PDF for proposal

---

## 📞 Support

**Creator:** Godwin B.

For questions or support:
- Check `docs/feature-guide.md` for detailed documentation
- Review code comments in `js/app.js`
- Test in different browsers

---

## 📄 License

This calculator is provided as-is for inference economics analysis and educational purposes.

---

## 🚀 Getting Started Checklist

- [ ] Extract/download the folder
- [ ] Open `index.html` in browser (or set up local server)
- [ ] Configure your first calculation
- [ ] Save it locally
- [ ] Export a backup (JSON)
- [ ] Deploy online (optional)
- [ ] Share with your team

---

## 💡 Pro Tips

1. **Regular Backups**: Export JSON files weekly
2. **Naming Convention**: Use descriptive names like "H100-Production-2024"
3. **Share Smart**: Use hosted version for team collaboration
4. **Print PDFs**: Print to PDF for documentation
5. **Compare Efficiently**: Use Recent tab for quick comparisons

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Created by:** Godwin B.
