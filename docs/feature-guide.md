# Inference Economics Calculator - Feature Guide

## 🎯 All Features Overview

Your calculator now includes **comprehensive data management** with 8 major features:

---

## 1. 💾 **SAVE** - Store Calculations Locally

### How it works:
- Click the **"💾 Save"** button in the toolbar
- Enter a descriptive name (e.g., "H100 Production Config")
- Your calculation is saved to browser localStorage
- Saves all inputs, results, and price settings

### What's saved:
- All 12 input parameters
- All 10 calculated results
- Current price list settings
- Timestamp for reference

### Use cases:
- Compare different silicon configurations
- Save baseline scenarios
- Track configurations over time
- Quick access to frequently used setups

---

## 2. 📂 **LOAD** - Restore Saved Calculations

### How it works:
- Click **"📂 Load"** to view all saved calculations
- Each saved item shows:
  - Calculation name
  - Silicon type and model
  - Save date
- Click **📂** icon to load
- Click **🗑️** icon to delete

### Features:
- Restores all inputs and results
- Preserves price list settings
- Loads MW Yield configurations
- Instant restore of complete state

---

## 3. 🕐 **RECENT** - View Recent History

### How it works:
- Click **"🕐 Recent"** to see last 10 calculations
- Shows detailed preview:
  - Silicon type and model
  - Date and time saved
  - Key metrics (J/token, ROI, Monthly Profit)
- Quick load or delete from history

### Benefits:
- Fast access to recent work
- Compare recent scenarios
- Track calculation history
- Quick reload without searching

---

## 4. 📥 **EXPORT JSON** - Download Full Data

### How it works:
- Click **"📥 Export JSON"**
- Downloads a `.json` file with:
  - All input parameters
  - All calculated results
  - Price list settings
  - Export timestamp

### Use cases:
- Backup calculations
- Share with colleagues
- Transfer between devices
- Archive historical data
- Integration with other tools

### File format:
```json
{
  "inputs": { ... },
  "results": { ... },
  "priceList": { ... },
  "exportedAt": "2024-11-23T..."
}
```

---

## 5. 📊 **EXPORT CSV** - Spreadsheet Format

### How it works:
- Click **"📊 Export CSV"**
- Downloads a `.csv` file with:
  - Input parameters section
  - Calculated results section
  - Financial analysis section
  - All formatted and labeled

### Use cases:
- Import to Excel/Google Sheets
- Create reports
- Financial analysis
- Data visualization
- Record keeping

### CSV Structure:
- Section headers
- Label-value pairs
- Timestamp
- Ready for spreadsheet import

---

## 6. 📤 **IMPORT** - Load JSON Files

### How it works:
- Click **"📤 Import"**
- Select a `.json` file (previously exported)
- Calculator automatically loads:
  - All input parameters
  - Price list settings
  - MW configurations
  - Results (if included)

### Features:
- Validates file format
- Error handling for corrupt files
- Preserves all settings
- Works with any exported JSON

### Use cases:
- Restore backups
- Load shared configurations
- Transfer between sessions
- Import baseline scenarios

---

## 7. 🔗 **SHARE** - Generate Shareable Links

### How it works:
- Click **"🔗 Share"**
- Generates a URL with encoded data
- Link is automatically copied to clipboard
- Anyone with link can view your configuration

### What's shared:
- All input parameters
- MW Yield settings
- Price list configuration
- NOT shared: Results (recalculated on load)

### Features:
- No server required
- Data encoded in URL
- Works across devices
- Permanent link (data in URL)

### Example URL:
```
https://yoursite.com/calculator.html?data=eyJpIjp7InNpbGljb25UeXBlIjoiR1BVIi...
```

---

## 8. ✉️ **EMAIL** - Send Results via Email

### How it works:
- Click **"✉️ Email"**
- Opens your email client with:
  - Pre-filled subject line
  - Formatted results summary
  - Key metrics highlighted
  - Configuration details

### What's included:
- Configuration summary
- Key calculated results
- J/token, MW Yield
- Monthly/Annual quotes
- ROI period
- Net monthly profit

### Use cases:
- Share with stakeholders
- Quick reports
- Client quotes
- Team collaboration

---

## 9. 🖨️ **PRINT** - Print-Friendly Output

### How it works:
- Click **"🖨️ Print"**
- Opens print dialog with:
  - Clean, professional layout
  - All inputs and results
  - No UI clutter
  - Optimized for paper

### Features:
- Hides navigation elements
- Removes background effects
- Black & white friendly
- Page break optimization
- Professional formatting

### Use cases:
- Physical reports
- PDF generation (print to PDF)
- Documentation
- Archival purposes

---

## 🔄 Data Persistence

### LocalStorage:
- All saved calculations stored in browser
- Persists across sessions
- Max ~5-10MB storage
- Cleared only when:
  - Browser cache cleared
  - Manual deletion
  - Incognito mode closes

### Privacy:
- All data stays local
- No server uploads
- No tracking
- Complete privacy

---

## 💡 Best Practices

### Organization:
1. Use descriptive names for saves
2. Regular export backups
3. Delete old calculations periodically
4. Use Recent for quick access

### Collaboration:
1. Export JSON for version control
2. Share links for quick reviews
3. Email for formal quotes
4. Print for presentations

### Workflow:
1. Configure inputs
2. Calculate results
3. Save locally
4. Export for backup
5. Share/Email as needed
6. Print for documentation

---

## 🚀 Quick Tips

### Speed:
- **Recent (🕐)** = Fastest access to last 10
- **Load (📂)** = Browse all saved
- **Share (🔗)** = Instant clipboard copy

### Backup:
- Export JSON weekly
- Keep critical configs in files
- Email yourself important setups

### Collaboration:
- Share links for quick review
- Export CSV for spreadsheet analysis
- Print PDF for formal reports
- Email for client communication

---

## 🛠️ Technical Details

### File Formats:

**JSON Export:**
- Full state preservation
- Human-readable
- Re-importable
- ~1-2KB per calculation

**CSV Export:**
- Spreadsheet-ready
- Row-based format
- No re-import support
- ~1KB per calculation

**Share URL:**
- Base64 encoded JSON
- ~500-1000 characters
- Self-contained
- No expiration

### Storage Limits:
- LocalStorage: ~5MB typical
- Approximately 1000-2000 calculations
- Automatic cleanup available
- No artificial limits

### Browser Compatibility:
- All modern browsers supported
- Requires localStorage API
- Requires clipboard API (for share)
- Print works everywhere

---

## 📞 Support

**Created by:** Godwin B.

**Features:**
- ✅ 8 data management functions
- ✅ LocalStorage persistence
- ✅ Full import/export support
- ✅ Shareable configurations
- ✅ Print-optimized output
- ✅ Email integration
- ✅ Complete privacy

---

## 🎓 Usage Examples

### Example 1: Quick Comparison
1. Configure GPU setup
2. Calculate
3. Save as "GPU-Baseline"
4. Change to ASIC
5. Calculate
6. Save as "ASIC-Option"
7. Use Recent to toggle between

### Example 2: Client Quote
1. Configure for client needs
2. Calculate
3. Export CSV for Excel analysis
4. Email summary to client
5. Print PDF for proposal

### Example 3: Team Collaboration
1. Configure optimal setup
2. Save locally
3. Export JSON backup
4. Share link with team
5. Team views without login

---

**End of Guide**
