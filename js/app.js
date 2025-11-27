        const { useState, useEffect } = React;

        const InferenceCalculator = () => {
            const [activeTab, setActiveTab] = useState('calculator');
            
            // Price List State
            const [priceList, setPriceList] = useState({
                electricityCost: 0.06,
                revenuePerToken: 0.00003,
                gpuCapex: 25000,
                fpgaCapex: 15000,
                asicCapex: 8000,
                waferCapex: 2000000
            });

            // Calculator State
            const [calcInput, setCalcInput] = useState({
                siliconType: 'GPU',
                modelName: 'NVIDIA H100',
                powerWatts: 700,
                tokensPerSec: 1000,
                capex: 25000,
                lifetime: 3,
                utilization: 80,
                pue: 1.2,
                workloadType: 'LLM Inference',
                monthlyTokenVolume: 2592000000
            });

            const [calcResults, setCalcResults] = useState(null);
            const [showDisclaimer, setShowDisclaimer] = useState(true);
            
            // Save/Load/History State
            const [savedCalculations, setSavedCalculations] = useState([]);
            const [showSaveModal, setShowSaveModal] = useState(false);
            const [showLoadModal, setShowLoadModal] = useState(false);
            const [showRecentModal, setShowRecentModal] = useState(false);
            const [saveName, setSaveName] = useState('');
            const [showActionMenu, setShowActionMenu] = useState(false);

            // MW Yield State
            const [mwInput, setMwInput] = useState({
                totalMW: 5,
                gpuMW: 2,
                fpgaMW: 1,
                asicMW: 2
            });

            const [mwResults, setMwResults] = useState(null);

            // Silicon presets
            const siliconPresets = {
                'GPU': { 
                    modelName: 'NVIDIA H100',
                    power: 700, 
                    tokens: 1000, 
                    capex: 25000,
                    workload: 'LLM Inference'
                },
                'FPGA': { 
                    modelName: 'Xilinx Versal',
                    power: 100, 
                    tokens: 3000, 
                    capex: 15000,
                    workload: 'Streaming/Vision'
                },
                'ASIC': { 
                    modelName: 'Groq LPU',
                    power: 200, 
                    tokens: 15000, 
                    capex: 8000,
                    workload: 'LLM Inference'
                },
                'Wafer-Scale': { 
                    modelName: 'Cerebras WSE-3',
                    power: 15000, 
                    tokens: 100000, 
                    capex: 2000000,
                    workload: 'Batch Inference'
                }
            };

            // Validation rules
            const validationRules = {
                powerWatts: { min: 1, max: 50000, step: 1 },
                tokensPerSec: { min: 1, max: 1000000, step: 1 },
                capex: { min: 100, max: 10000000, step: 100 },
                lifetime: { min: 1, max: 10, step: 0.5 },
                utilization: { min: 1, max: 100, step: 1 },
                pue: { min: 1.0, max: 3.0, step: 0.1 },
                monthlyTokenVolume: { min: 1000000, max: 1000000000000, step: 1000000 }
            };

            // Calculate J/token
            const calculateJoulesPerToken = (power, tokensPerSec) => {
                return power / tokensPerSec;
            };

            // Calculate cost per token
            const calculateCostPerToken = (joulesPerToken, electricityCost) => {
                const costPerJoule = electricityCost / 3600000;
                return joulesPerToken * costPerJoule;
            };

            // Handle silicon type change
            const handleSiliconChange = (type) => {
                const preset = siliconPresets[type];
                setCalcInput({
                    ...calcInput,
                    siliconType: type,
                    modelName: preset.modelName,
                    powerWatts: preset.power,
                    tokensPerSec: preset.tokens,
                    capex: preset.capex,
                    workloadType: preset.workload
                });
            };

            // Calculate results
            const calculate = () => {
                // Apply utilization factor
                const effectiveTokensPerSec = calcInput.tokensPerSec * (calcInput.utilization / 100);
                
                // 1. Actual Power (W × PUE)
                const actualPower = calcInput.powerWatts * calcInput.pue;
                
                // 2. Joules per Token
                const jpt = actualPower / effectiveTokensPerSec;
                
                // 3. Tokens per kWh
                const tokensPerKWh = (effectiveTokensPerSec * 3600) / (actualPower / 1000);
                
                // 4. Units per MW (how many units fit in 1 MW)
                const unitsPerMW = (1000000 / actualPower);
                
                // 5. MW Yield (tokens/sec per MW)
                const mwYield = effectiveTokensPerSec * unitsPerMW;
                
                // 6. Monthly Energy Cost
                const monthlyEnergyKWh = (actualPower / 1000) * 24 * 30;
                const monthlyEnergyCost = monthlyEnergyKWh * priceList.electricityCost;
                
                // 7. Cost per Token (energy only)
                const energyCostPerToken = calculateCostPerToken(jpt, priceList.electricityCost);
                
                // 8. Client Price per Token (from price list)
                const clientPricePerToken = priceList.revenuePerToken / 1000;
                
                // 9. Monthly Quote (based on expected volume)
                const monthlyQuote = (calcInput.monthlyTokenVolume / 1000) * priceList.revenuePerToken;
                
                // 10. Annual Quote
                const annualQuote = monthlyQuote * 12;
                
                // Additional useful metrics
                const dailyTokens = effectiveTokensPerSec * 86400;
                const monthlyTokens = effectiveTokensPerSec * 86400 * 30;
                const dailyEnergyCost = (actualPower / 1000) * 24 * priceList.electricityCost;
                const monthlyRevenue = (monthlyTokens / 1000) * priceList.revenuePerToken;
                const monthlyProfit = monthlyRevenue - monthlyEnergyCost;
                const annualRevenue = monthlyRevenue * 12;
                const annualEnergyCost = monthlyEnergyCost * 12;
                const annualProfit = annualRevenue - annualEnergyCost;
                const totalCapexDepreciation = calcInput.capex / (calcInput.lifetime * 12);
                const netMonthlyProfit = monthlyProfit - totalCapexDepreciation;
                const roiMonths = calcInput.capex / (monthlyProfit > 0 ? monthlyProfit : 1);

                setCalcResults({
                    // Primary 10 calculated fields
                    actualPower,
                    joulesPerToken: jpt,
                    tokensPerKWh,
                    unitsPerMW,
                    mwYield,
                    monthlyEnergyCost,
                    energyCostPerToken,
                    clientPricePerToken,
                    monthlyQuote,
                    annualQuote,
                    // Additional metrics
                    dailyTokens,
                    monthlyTokens,
                    dailyEnergyCost,
                    monthlyRevenue,
                    monthlyProfit,
                    annualRevenue,
                    annualEnergyCost,
                    annualProfit,
                    totalCapexDepreciation,
                    netMonthlyProfit,
                    roiMonths
                });
            };

            // Calculate MW Yield
            const calculateMWYield = () => {
                const gpuYield = 1.4e6; // tokens/sec per MW
                const fpgaYield = 5e6;
                const asicYield = 150e6;

                const gpuTPS = mwInput.gpuMW * gpuYield;
                const fpgaTPS = mwInput.fpgaMW * fpgaYield;
                const asicTPS = mwInput.asicMW * asicYield;
                const totalTPS = gpuTPS + fpgaTPS + asicTPS;

                const dailyTokens = totalTPS * 86400;
                const dailyRevenue = (dailyTokens / 1000) * priceList.revenuePerToken;
                const annualRevenue = dailyRevenue * 365;
                const energyCostAnnual = mwInput.totalMW * 1000 * 24 * 365 * priceList.electricityCost;
                const netProfit = annualRevenue - energyCostAnnual;

                setMwResults({
                    gpuTPS,
                    fpgaTPS,
                    asicTPS,
                    totalTPS,
                    dailyRevenue,
                    annualRevenue,
                    energyCostAnnual,
                    netProfit
                });
            };

            // Load saved calculations from localStorage on mount
            useEffect(() => {
                const saved = localStorage.getItem('inferenceCalculations');
                if (saved) {
                    setSavedCalculations(JSON.parse(saved));
                }
            }, []);

            // Save calculation
            const saveCalculation = () => {
                if (!saveName.trim()) {
                    alert('Please enter a name for this calculation');
                    return;
                }

                const calculation = {
                    id: Date.now(),
                    name: saveName,
                    timestamp: new Date().toISOString(),
                    inputs: { ...calcInput, ...mwInput },
                    results: calcResults,
                    priceList: priceList
                };

                const updated = [calculation, ...savedCalculations];
                setSavedCalculations(updated);
                localStorage.setItem('inferenceCalculations', JSON.stringify(updated));
                
                setSaveName('');
                setShowSaveModal(false);
                alert('Calculation saved successfully!');
            };

            // Load calculation
            const loadCalculation = (calc) => {
                setCalcInput({
                    siliconType: calc.inputs.siliconType,
                    modelName: calc.inputs.modelName,
                    powerWatts: calc.inputs.powerWatts,
                    tokensPerSec: calc.inputs.tokensPerSec,
                    capex: calc.inputs.capex,
                    lifetime: calc.inputs.lifetime,
                    utilization: calc.inputs.utilization,
                    pue: calc.inputs.pue,
                    workloadType: calc.inputs.workloadType,
                    monthlyTokenVolume: calc.inputs.monthlyTokenVolume
                });

                setMwInput({
                    totalMW: calc.inputs.totalMW,
                    gpuMW: calc.inputs.gpuMW,
                    fpgaMW: calc.inputs.fpgaMW,
                    asicMW: calc.inputs.asicMW
                });

                setPriceList(calc.priceList);
                setCalcResults(calc.results);
                setShowLoadModal(false);
                alert('Calculation loaded successfully!');
            };

            // Delete calculation
            const deleteCalculation = (id) => {
                if (!confirm('Are you sure you want to delete this calculation?')) {
                    return;
                }
                
                const updated = savedCalculations.filter(calc => calc.id !== id);
                setSavedCalculations(updated);
                localStorage.setItem('inferenceCalculations', JSON.stringify(updated));
            };

            // Export as JSON
            const exportJSON = () => {
                const data = {
                    inputs: { ...calcInput, ...mwInput },
                    results: calcResults,
                    priceList: priceList,
                    exportedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inference-calc-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            };

            // Export as CSV
            const exportCSV = () => {
                if (!calcResults) {
                    alert('Please calculate results first');
                    return;
                }

                const csvRows = [
                    ['Inference Economics Calculator - Results'],
                    ['Generated:', new Date().toLocaleString()],
                    [''],
                    ['INPUT PARAMETERS'],
                    ['Silicon Type', calcInput.siliconType],
                    ['Model Name', calcInput.modelName],
                    ['Power (W)', calcInput.powerWatts],
                    ['Throughput (TPS)', calcInput.tokensPerSec],
                    ['CapEx ($)', calcInput.capex],
                    ['Lifetime (years)', calcInput.lifetime],
                    ['Utilization (%)', calcInput.utilization],
                    ['PUE', calcInput.pue],
                    ['Workload Type', calcInput.workloadType],
                    ['Monthly Token Volume', calcInput.monthlyTokenVolume],
                    [''],
                    ['CALCULATED RESULTS'],
                    ['Actual Power (W)', calcResults.actualPower.toFixed(2)],
                    ['Joules per Token', calcResults.joulesPerToken.toFixed(6)],
                    ['Tokens per kWh', calcResults.tokensPerKWh.toFixed(2)],
                    ['Units per MW', calcResults.unitsPerMW.toFixed(0)],
                    ['MW Yield (TPS/MW)', calcResults.mwYield.toFixed(0)],
                    ['Monthly Energy Cost ($)', calcResults.monthlyEnergyCost.toFixed(2)],
                    ['Energy Cost per Token ($)', calcResults.energyCostPerToken.toExponential(4)],
                    ['Client Price per Token ($)', calcResults.clientPricePerToken.toExponential(4)],
                    ['Monthly Quote ($)', calcResults.monthlyQuote.toFixed(2)],
                    ['Annual Quote ($)', calcResults.annualQuote.toFixed(2)],
                    [''],
                    ['FINANCIAL ANALYSIS'],
                    ['Monthly Revenue ($)', calcResults.monthlyRevenue.toFixed(2)],
                    ['Annual Revenue ($)', calcResults.annualRevenue.toFixed(2)],
                    ['Annual Energy Cost ($)', calcResults.annualEnergyCost.toFixed(2)],
                    ['Net Monthly Profit ($)', calcResults.netMonthlyProfit.toFixed(2)],
                    ['ROI Period (months)', calcResults.roiMonths.toFixed(1)]
                ];

                const csvContent = csvRows.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inference-calc-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            };

            // Import from JSON
            const importJSON = (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.inputs) {
                            setCalcInput({
                                siliconType: data.inputs.siliconType || 'GPU',
                                modelName: data.inputs.modelName || 'NVIDIA H100',
                                powerWatts: data.inputs.powerWatts || 700,
                                tokensPerSec: data.inputs.tokensPerSec || 1000,
                                capex: data.inputs.capex || 25000,
                                lifetime: data.inputs.lifetime || 3,
                                utilization: data.inputs.utilization || 80,
                                pue: data.inputs.pue || 1.2,
                                workloadType: data.inputs.workloadType || 'LLM Inference',
                                monthlyTokenVolume: data.inputs.monthlyTokenVolume || 2592000000
                            });

                            if (data.inputs.totalMW !== undefined) {
                                setMwInput({
                                    totalMW: data.inputs.totalMW,
                                    gpuMW: data.inputs.gpuMW || 0,
                                    fpgaMW: data.inputs.fpgaMW || 0,
                                    asicMW: data.inputs.asicMW || 0
                                });
                            }
                        }

                        if (data.priceList) {
                            setPriceList(data.priceList);
                        }

                        if (data.results) {
                            setCalcResults(data.results);
                        }

                        alert('Data imported successfully!');
                    } catch (error) {
                        alert('Error importing file. Please check the file format.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
                event.target.value = '';
            };

            // Share calculation (copy link with encoded data)
            const shareCalculation = () => {
                const data = {
                    i: calcInput,
                    m: mwInput,
                    p: priceList
                };
                
                const encoded = btoa(JSON.stringify(data));
                const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
                
                navigator.clipboard.writeText(url).then(() => {
                    alert('Share link copied to clipboard!');
                }).catch(() => {
                    prompt('Copy this link to share:', url);
                });
            };

            // Email results
            const emailResults = () => {
                if (!calcResults) {
                    alert('Please calculate results first');
                    return;
                }

                const subject = encodeURIComponent('Inference Economics Calculator Results');
                const body = encodeURIComponent(`
Inference Economics Calculator Results
Generated: ${new Date().toLocaleString()}

CONFIGURATION:
Silicon Type: ${calcInput.siliconType}
Model: ${calcInput.modelName}
Power: ${calcInput.powerWatts}W
Throughput: ${calcInput.tokensPerSec} TPS
Utilization: ${calcInput.utilization}%

KEY RESULTS:
Joules/Token: ${calcResults.joulesPerToken.toFixed(4)} J
MW Yield: ${formatNumber(calcResults.mwYield)} TPS/MW
Monthly Quote: ${formatCurrency(calcResults.monthlyQuote)}
Annual Quote: ${formatCurrency(calcResults.annualQuote)}
ROI Period: ${calcResults.roiMonths.toFixed(1)} months

Net Monthly Profit: ${formatCurrency(calcResults.netMonthlyProfit)}

---
Created with Inference Economics Calculator by Godwin B.
                `);

                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            };

            // Print results
            const printResults = () => {
                window.print();
            };

            // Load data from URL on mount
            useEffect(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const dataParam = urlParams.get('data');
                
                if (dataParam) {
                    try {
                        const decoded = JSON.parse(atob(dataParam));
                        if (decoded.i) setCalcInput(decoded.i);
                        if (decoded.m) setMwInput(decoded.m);
                        if (decoded.p) setPriceList(decoded.p);
                    } catch (error) {
                        console.error('Error loading shared data:', error);
                    }
                }
            }, []);

            const formatNumber = (num) => {
                if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
                if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
                if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
                return num.toFixed(2);
            };

            const formatCurrency = (num) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            };

            const formatScientific = (num) => {
                if (num < 0.0001) return num.toExponential(4);
                return num.toFixed(6);
            };

            return (
                <div className="app-container">
                    <header>
                        <h1>INFERENCE ECONOMICS</h1>
                        <div className="subtitle">Silicon • Energy • Performance Calculator</div>
                        <div className="creator">Created by Godwin B.</div>
                    </header>

                    {showDisclaimer && (
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
                            borderColor: 'var(--warning)',
                            marginBottom: '30px'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                <div>
                                    <div className="card-header" style={{color: 'var(--warning)', marginBottom: '16px'}}>
                                        ⚠️ Important Disclaimer & Calculation Rules
                                    </div>
                                    
                                    <div style={{color: 'var(--text)', lineHeight: '1.8', fontSize: '0.95rem'}}>
                                        <p style={{marginBottom: '12px'}}>
                                            <strong>Purpose:</strong> This calculator provides estimates for AI inference economics based on silicon specifications, 
                                            energy consumption, and throughput metrics. Results are approximations and should not be considered financial advice.
                                        </p>
                                        
                                        <h4 style={{color: 'var(--primary)', marginTop: '16px', marginBottom: '8px', fontSize: '1rem'}}>
                                            Key Assumptions:
                                        </h4>
                                        <ul style={{marginLeft: '20px', marginBottom: '12px'}}>
                                            <li>Energy costs are based solely on electricity rates × power consumption</li>
                                            <li>CapEx depreciation is linear over the specified lifetime</li>
                                            <li>Utilization rate directly impacts effective throughput (idle power not modeled)</li>
                                            <li>PUE (Power Usage Effectiveness) multiplies base silicon power for total facility power</li>
                                            <li>Revenue calculations assume constant pricing per token</li>
                                            <li>Does NOT include: cooling upgrades, network costs, labor, maintenance, or downtime</li>
                                        </ul>

                                        <h4 style={{color: 'var(--primary)', marginTop: '16px', marginBottom: '8px', fontSize: '1rem'}}>
                                            Validation Ranges:
                                        </h4>
                                        <ul style={{marginLeft: '20px', marginBottom: '12px'}}>
                                            <li><strong>Power:</strong> 1W - 50,000W (single unit)</li>
                                            <li><strong>Throughput:</strong> 1 - 1M tokens/sec</li>
                                            <li><strong>CapEx:</strong> $100 - $10M per unit</li>
                                            <li><strong>Lifetime:</strong> 1 - 10 years</li>
                                            <li><strong>Utilization:</strong> 1% - 100%</li>
                                            <li><strong>PUE:</strong> 1.0 (perfect) - 3.0 (inefficient)</li>
                                            <li><strong>Monthly Volume:</strong> 1M - 1T tokens</li>
                                        </ul>

                                        <h4 style={{color: 'var(--primary)', marginTop: '16px', marginBottom: '8px', fontSize: '1rem'}}>
                                            Formula Reference:
                                        </h4>
                                        <ul style={{marginLeft: '20px', marginBottom: '12px'}}>
                                            <li><strong>Joules/Token:</strong> (Power × PUE) ÷ (Tokens/sec × Utilization%)</li>
                                            <li><strong>Tokens/kWh:</strong> (Tokens/sec × 3600) ÷ (Power/1000)</li>
                                            <li><strong>MW Yield:</strong> Units per MW × Effective Tokens/sec</li>
                                            <li><strong>Cost/Token:</strong> J/token × (Electricity Rate ÷ 3,600,000)</li>
                                        </ul>

                                        <p style={{marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-dim)'}}>
                                            <strong>Note:</strong> Real-world results may vary based on model size, batch size, quantization, 
                                            cooling efficiency, geographic location, and market dynamics. Always perform due diligence with 
                                            actual hardware testing before major investments.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowDisclaimer(false)}
                                    style={{
                                        background: 'none',
                                        border: '2px solid var(--border)',
                                        color: 'var(--text)',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        marginLeft: '16px',
                                        flexShrink: 0
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {!showDisclaimer && (
                        <button 
                            onClick={() => setShowDisclaimer(true)}
                            className="btn-secondary"
                            style={{marginBottom: '20px'}}
                        >
                            📋 View Disclaimer & Rules
                        </button>
                    )}

                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calculator')}
                        >
                            Calculator
                        </button>
                        <button 
                            className={`tab ${activeTab === 'mw-yield' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mw-yield')}
                        >
                            MW Yield
                        </button>
                        <button 
                            className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
                            onClick={() => setActiveTab('comparison')}
                        >
                            Comparison
                        </button>
                        <button 
                            className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pricing')}
                        >
                            Price List
                        </button>
                    </div>

                    {/* Action Toolbar */}
                    <div className="action-toolbar">
                        <div className="toolbar-section">
                            <button className="toolbar-btn" onClick={() => setShowSaveModal(true)}>
                                💾 Save
                            </button>
                            <button className="toolbar-btn" onClick={() => setShowLoadModal(true)}>
                                📂 Load
                            </button>
                            <button className="toolbar-btn" onClick={() => setShowRecentModal(true)}>
                                🕐 Recent ({savedCalculations.length})
                            </button>
                        </div>

                        <div className="toolbar-section">
                            <button className="toolbar-btn" onClick={exportJSON}>
                                📥 Export JSON
                            </button>
                            <button className="toolbar-btn" onClick={exportCSV}>
                                📊 Export CSV
                            </button>
                            <label className="toolbar-btn" style={{cursor: 'pointer'}}>
                                📤 Import
                                <input 
                                    type="file" 
                                    accept=".json"
                                    onChange={importJSON}
                                    style={{display: 'none'}}
                                />
                            </label>
                        </div>

                        <div className="toolbar-section">
                            <button className="toolbar-btn" onClick={shareCalculation}>
                                🔗 Share
                            </button>
                            <button className="toolbar-btn" onClick={emailResults}>
                                ✉️ Email
                            </button>
                            <button className="toolbar-btn" onClick={printResults}>
                                🖨️ Print
                            </button>
                        </div>
                    </div>

                    {/* Save Modal */}
                    {showSaveModal && (
                        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>💾 Save Calculation</h2>
                                    <button className="modal-close" onClick={() => setShowSaveModal(false)}>✕</button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Calculation Name</label>
                                        <input 
                                            type="text"
                                            value={saveName}
                                            onChange={(e) => setSaveName(e.target.value)}
                                            placeholder="e.g., H100 Production Config"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn" onClick={saveCalculation}>
                                        Save Calculation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Load Modal */}
                    {showLoadModal && (
                        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>📂 Load Calculation</h2>
                                    <button className="modal-close" onClick={() => setShowLoadModal(false)}>✕</button>
                                </div>
                                <div className="modal-body">
                                    {savedCalculations.length === 0 ? (
                                        <p style={{textAlign: 'center', color: 'var(--text-dim)', padding: '20px'}}>
                                            No saved calculations yet. Save your first calculation to see it here!
                                        </p>
                                    ) : (
                                        <div className="saved-list">
                                            {savedCalculations.map(calc => (
                                                <div key={calc.id} className="saved-item">
                                                    <div className="saved-info">
                                                        <div className="saved-name">{calc.name}</div>
                                                        <div className="saved-meta">
                                                            {calc.inputs.siliconType} • {calc.inputs.modelName} • 
                                                            {new Date(calc.timestamp).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="saved-actions">
                                                        <button 
                                                            className="btn-icon"
                                                            onClick={() => loadCalculation(calc)}
                                                            title="Load"
                                                        >
                                                            📂
                                                        </button>
                                                        <button 
                                                            className="btn-icon"
                                                            onClick={() => deleteCalculation(calc.id)}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Modal */}
                    {showRecentModal && (
                        <div className="modal-overlay" onClick={() => setShowRecentModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>🕐 Recent Calculations</h2>
                                    <button className="modal-close" onClick={() => setShowRecentModal(false)}>✕</button>
                                </div>
                                <div className="modal-body">
                                    {savedCalculations.length === 0 ? (
                                        <p style={{textAlign: 'center', color: 'var(--text-dim)', padding: '20px'}}>
                                            No recent calculations
                                        </p>
                                    ) : (
                                        <div className="saved-list">
                                            {savedCalculations.slice(0, 10).map(calc => (
                                                <div key={calc.id} className="saved-item">
                                                    <div className="saved-info">
                                                        <div className="saved-name">{calc.name}</div>
                                                        <div className="saved-meta">
                                                            {calc.inputs.siliconType} • {calc.inputs.modelName}<br/>
                                                            {new Date(calc.timestamp).toLocaleString()}
                                                        </div>
                                                        {calc.results && (
                                                            <div className="saved-results">
                                                                J/token: {calc.results.joulesPerToken.toFixed(4)} • 
                                                                ROI: {calc.results.roiMonths.toFixed(1)}mo • 
                                                                Monthly: {formatCurrency(calc.results.netMonthlyProfit)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="saved-actions">
                                                        <button 
                                                            className="btn-icon"
                                                            onClick={() => {
                                                                loadCalculation(calc);
                                                                setShowRecentModal(false);
                                                            }}
                                                            title="Load"
                                                        >
                                                            📂
                                                        </button>
                                                        <button 
                                                            className="btn-icon"
                                                            onClick={() => deleteCalculation(calc.id)}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="content-section">
                        {activeTab === 'calculator' && (
                            <div>
                                <div className="card">
                                    <div className="card-header">
                                        <span className="card-icon"></span>
                                        Inference Economics Calculator
                                    </div>
                                    
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>1. Silicon Type</label>
                                            <select 
                                                value={calcInput.siliconType}
                                                onChange={(e) => handleSiliconChange(e.target.value)}
                                            >
                                                <option value="GPU">GPU (NVIDIA H100)</option>
                                                <option value="FPGA">FPGA (Xilinx Versal)</option>
                                                <option value="ASIC">ASIC (Groq/Cerebras)</option>
                                                <option value="Wafer-Scale">Wafer-Scale (Cerebras WSE)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>2. Model Name</label>
                                            <input 
                                                type="text"
                                                value={calcInput.modelName}
                                                onChange={(e) => setCalcInput({...calcInput, modelName: e.target.value})}
                                                placeholder="e.g., NVIDIA H100"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>3. Power Consumption (W)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.powerWatts}
                                                min={validationRules.powerWatts.min}
                                                max={validationRules.powerWatts.max}
                                                step={validationRules.powerWatts.step}
                                                onChange={(e) => setCalcInput({...calcInput, powerWatts: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {validationRules.powerWatts.min}W - {validationRules.powerWatts.max}W
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>4. Throughput (tokens/sec)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.tokensPerSec}
                                                min={validationRules.tokensPerSec.min}
                                                max={validationRules.tokensPerSec.max}
                                                step={validationRules.tokensPerSec.step}
                                                onChange={(e) => setCalcInput({...calcInput, tokensPerSec: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {validationRules.tokensPerSec.min} - {formatNumber(validationRules.tokensPerSec.max)} TPS
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>5. CapEx per Unit ($)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.capex}
                                                min={validationRules.capex.min}
                                                max={validationRules.capex.max}
                                                step={validationRules.capex.step}
                                                onChange={(e) => setCalcInput({...calcInput, capex: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: ${validationRules.capex.min} - ${formatNumber(validationRules.capex.max)}
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>6. Lifetime (years)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.lifetime}
                                                min={validationRules.lifetime.min}
                                                max={validationRules.lifetime.max}
                                                step={validationRules.lifetime.step}
                                                onChange={(e) => setCalcInput({...calcInput, lifetime: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {validationRules.lifetime.min} - {validationRules.lifetime.max} years
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>7. Utilization (%)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.utilization}
                                                min={validationRules.utilization.min}
                                                max={validationRules.utilization.max}
                                                step={validationRules.utilization.step}
                                                onChange={(e) => setCalcInput({...calcInput, utilization: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {validationRules.utilization.min}% - {validationRules.utilization.max}%
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>8. Electricity Price ($/kWh)</label>
                                            <input 
                                                type="number"
                                                value={priceList.electricityCost}
                                                step="0.01"
                                                onChange={(e) => setPriceList({...priceList, electricityCost: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Typical: $0.04 - $0.15/kWh
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>9. PUE (Power Usage Effectiveness)</label>
                                            <input 
                                                type="number"
                                                value={calcInput.pue}
                                                min={validationRules.pue.min}
                                                max={validationRules.pue.max}
                                                step={validationRules.pue.step}
                                                onChange={(e) => setCalcInput({...calcInput, pue: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {validationRules.pue.min} - {validationRules.pue.max} (1.0 = perfect)
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>10. MW Capacity</label>
                                            <input 
                                                type="number"
                                                value={mwInput.totalMW}
                                                step="0.1"
                                                onChange={(e) => setMwInput({...mwInput, totalMW: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Used in MW Yield calculations
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>11. Workload Type</label>
                                            <select 
                                                value={calcInput.workloadType}
                                                onChange={(e) => setCalcInput({...calcInput, workloadType: e.target.value})}
                                            >
                                                <option value="LLM Inference">LLM Inference</option>
                                                <option value="Embedding Generation">Embedding Generation</option>
                                                <option value="Vision Models">Vision Models</option>
                                                <option value="Streaming Inference">Streaming Inference</option>
                                                <option value="Batch Inference">Batch Inference</option>
                                                <option value="Multi-Modal">Multi-Modal</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>12. Expected Monthly Token Volume</label>
                                            <input 
                                                type="number"
                                                value={calcInput.monthlyTokenVolume}
                                                min={validationRules.monthlyTokenVolume.min}
                                                max={validationRules.monthlyTokenVolume.max}
                                                step={validationRules.monthlyTokenVolume.step}
                                                onChange={(e) => setCalcInput({...calcInput, monthlyTokenVolume: parseFloat(e.target.value)})}
                                            />
                                            <small style={{color: 'var(--text-dim)', fontSize: '0.75rem'}}>
                                                Range: {formatNumber(validationRules.monthlyTokenVolume.min)} - {formatNumber(validationRules.monthlyTokenVolume.max)} tokens
                                            </small>
                                        </div>
                                    </div>

                                    <button className="btn" onClick={calculate}>Calculate Metrics</button>

                                    {calcResults && (
                                        <div>
                                            <h3 style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                color: 'var(--primary)',
                                                marginTop: '32px',
                                                marginBottom: '16px',
                                                fontSize: '1.2rem'
                                            }}>
                                                📊 Primary Calculated Fields (10)
                                            </h3>
                                            <div className="results-grid">
                                                <div className="result-box">
                                                    <div className="result-label">1. Actual Power (W × PUE)</div>
                                                    <div className="result-value">
                                                        {calcResults.actualPower.toFixed(1)}
                                                        <span className="result-unit">W</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">2. Joules per Token</div>
                                                    <div className="result-value">
                                                        {calcResults.joulesPerToken.toFixed(4)}
                                                        <span className="result-unit">J</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">3. Tokens per kWh</div>
                                                    <div className="result-value">
                                                        {formatNumber(calcResults.tokensPerKWh)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">4. Units per MW</div>
                                                    <div className="result-value">
                                                        {calcResults.unitsPerMW.toFixed(0)}
                                                        <span className="result-unit">units</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">5. MW Yield (TPS/MW)</div>
                                                    <div className="result-value">
                                                        {formatNumber(calcResults.mwYield)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">6. Monthly Energy Cost</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.monthlyEnergyCost)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">7. Cost per Token (Energy)</div>
                                                    <div className="result-value">
                                                        {formatScientific(calcResults.energyCostPerToken)}
                                                        <span className="result-unit">$</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">8. Client Price per Token</div>
                                                    <div className="result-value">
                                                        {formatScientific(calcResults.clientPricePerToken)}
                                                        <span className="result-unit">$</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">9. Monthly Quote</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.monthlyQuote)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">10. Annual Quote</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.annualQuote)}
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                color: 'var(--secondary)',
                                                marginTop: '32px',
                                                marginBottom: '16px',
                                                fontSize: '1.2rem'
                                            }}>
                                                💰 Financial Analysis
                                            </h3>
                                            <div className="results-grid">
                                                <div className="result-box">
                                                    <div className="result-label">Monthly Revenue</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.monthlyRevenue)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Monthly Profit (Energy)</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.monthlyProfit)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Monthly CapEx Depreciation</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.totalCapexDepreciation)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Net Monthly Profit</div>
                                                    <div className="result-value" style={{
                                                        color: calcResults.netMonthlyProfit > 0 ? 'var(--success)' : 'var(--warning)'
                                                    }}>
                                                        {formatCurrency(calcResults.netMonthlyProfit)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Annual Revenue</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.annualRevenue)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Annual Energy Cost</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.annualEnergyCost)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Annual Profit</div>
                                                    <div className="result-value" style={{
                                                        color: calcResults.annualProfit > 0 ? 'var(--success)' : 'var(--warning)'
                                                    }}>
                                                        {formatCurrency(calcResults.annualProfit)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">ROI Period</div>
                                                    <div className="result-value">
                                                        {calcResults.roiMonths.toFixed(1)}
                                                        <span className="result-unit">months</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                color: 'var(--accent)',
                                                marginTop: '32px',
                                                marginBottom: '16px',
                                                fontSize: '1.2rem'
                                            }}>
                                                ⚡ Performance Metrics
                                            </h3>
                                            <div className="results-grid">
                                                <div className="result-box">
                                                    <div className="result-label">Daily Token Output</div>
                                                    <div className="result-value">
                                                        {formatNumber(calcResults.dailyTokens)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Monthly Token Output</div>
                                                    <div className="result-value">
                                                        {formatNumber(calcResults.monthlyTokens)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Daily Energy Cost</div>
                                                    <div className="result-value">
                                                        {formatCurrency(calcResults.dailyEnergyCost)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Effective Utilization</div>
                                                    <div className="result-value">
                                                        {calcInput.utilization}
                                                        <span className="result-unit">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="highlight-box">
                                    <div className="highlight-title">⚡ Key Insight</div>
                                    <div className="info-text">
                                        Joules per token (J/token) is the primary metric defining inference cost. 
                                        Lower J/token means higher energy efficiency and lower operating costs. 
                                        ASICs typically achieve 10×–50× better energy efficiency than GPUs for LLM inference.
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'mw-yield' && (
                            <div>
                                <div className="card">
                                    <div className="card-header">
                                        <span className="card-icon"></span>
                                        MW Yield Calculator
                                    </div>
                                    
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Total Megawatts (MW)</label>
                                            <input 
                                                type="number"
                                                value={mwInput.totalMW}
                                                onChange={(e) => setMwInput({...mwInput, totalMW: parseFloat(e.target.value)})}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>GPU MW</label>
                                            <input 
                                                type="number"
                                                value={mwInput.gpuMW}
                                                onChange={(e) => setMwInput({...mwInput, gpuMW: parseFloat(e.target.value)})}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>FPGA MW</label>
                                            <input 
                                                type="number"
                                                value={mwInput.fpgaMW}
                                                onChange={(e) => setMwInput({...mwInput, fpgaMW: parseFloat(e.target.value)})}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>ASIC MW</label>
                                            <input 
                                                type="number"
                                                value={mwInput.asicMW}
                                                onChange={(e) => setMwInput({...mwInput, asicMW: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <button className="btn" onClick={calculateMWYield}>Calculate MW Yield</button>

                                    {mwResults && (
                                        <div>
                                            <div className="results-grid">
                                                <div className="result-box">
                                                    <div className="result-label">GPU Output</div>
                                                    <div className="result-value">
                                                        {formatNumber(mwResults.gpuTPS)}
                                                        <span className="result-unit">TPS</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">FPGA Output</div>
                                                    <div className="result-value">
                                                        {formatNumber(mwResults.fpgaTPS)}
                                                        <span className="result-unit">TPS</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">ASIC Output</div>
                                                    <div className="result-value">
                                                        {formatNumber(mwResults.asicTPS)}
                                                        <span className="result-unit">TPS</span>
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Total TPS</div>
                                                    <div className="result-value">
                                                        {formatNumber(mwResults.totalTPS)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Daily Revenue</div>
                                                    <div className="result-value">
                                                        {formatCurrency(mwResults.dailyRevenue)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Annual Revenue</div>
                                                    <div className="result-value">
                                                        {formatCurrency(mwResults.annualRevenue)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Annual Energy Cost</div>
                                                    <div className="result-value">
                                                        {formatCurrency(mwResults.energyCostAnnual)}
                                                    </div>
                                                </div>

                                                <div className="result-box">
                                                    <div className="result-label">Net Annual Profit</div>
                                                    <div className="result-value">
                                                        {formatCurrency(mwResults.netProfit)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="highlight-box">
                                    <div className="highlight-title">🔋 MW Yield Insight</div>
                                    <div className="info-text">
                                        MW yield measures total inference throughput per megawatt of power. 
                                        ASIC MW yield is typically 100× higher than GPU MW yield (150M vs 1.4M tokens/sec per MW). 
                                        This massive difference drives the economics of large-scale inference operations.
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'comparison' && (
                            <div>
                                <div className="card">
                                    <div className="card-header">
                                        <span className="card-icon"></span>
                                        Silicon Type Comparison
                                    </div>

                                    <table className="comparison-table">
                                        <thead>
                                            <tr>
                                                <th>Silicon Type</th>
                                                <th>Model</th>
                                                <th>Base Power</th>
                                                <th>Tokens/sec</th>
                                                <th>J/token (PUE 1.2)</th>
                                                <th>CapEx</th>
                                                <th>MW Yield</th>
                                                <th>Best Use Case</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="silicon-type">GPU</td>
                                                <td>NVIDIA H100</td>
                                                <td>700W</td>
                                                <td>1,000</td>
                                                <td>0.84</td>
                                                <td>$25,000</td>
                                                <td>1.4M TPS/MW</td>
                                                <td>General Purpose, Dynamic Models</td>
                                            </tr>
                                            <tr>
                                                <td className="silicon-type">FPGA</td>
                                                <td>Xilinx Versal</td>
                                                <td>100W</td>
                                                <td>3,000</td>
                                                <td>0.04</td>
                                                <td>$15,000</td>
                                                <td>5M TPS/MW</td>
                                                <td>Streaming, Vision, Low Latency</td>
                                            </tr>
                                            <tr>
                                                <td className="silicon-type">ASIC</td>
                                                <td>Groq LPU</td>
                                                <td>200W</td>
                                                <td>15,000</td>
                                                <td>0.016</td>
                                                <td>$8,000</td>
                                                <td>150M TPS/MW</td>
                                                <td>LLM Inference at Scale</td>
                                            </tr>
                                            <tr>
                                                <td className="silicon-type">Wafer-Scale</td>
                                                <td>Cerebras WSE-3</td>
                                                <td>15,000W</td>
                                                <td>100,000</td>
                                                <td>0.18</td>
                                                <td>$2,000,000</td>
                                                <td>6.7M TPS/MW</td>
                                                <td>Massive Batch Processing</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="highlight-box" style={{marginTop: '24px'}}>
                                        <div className="highlight-title">📊 Comparison Analysis</div>
                                        <div className="info-text">
                                            <strong>GPU (NVIDIA H100):</strong> Most flexible for dynamic workloads and multi-tenant scenarios. 
                                            Higher energy cost per token but excellent for diverse model types.<br/><br/>
                                            
                                            <strong>FPGA (Xilinx Versal):</strong> Extremely efficient for specialized pipelines. 
                                            Best for streaming inference, vision models, and deterministic latency requirements. 
                                            21× better efficiency than GPU.<br/><br/>
                                            
                                            <strong>ASIC (Groq):</strong> Purpose-built for LLM inference. Achieves 53× better energy 
                                            efficiency than GPU and 107× higher MW yield. Lowest cost per token for high-volume 
                                            LLM workloads.<br/><br/>
                                            
                                            <strong>Wafer-Scale (Cerebras):</strong> Highest absolute throughput for massive batch 
                                            processing. Best for training and large-scale batch inference when fully utilized. 
                                            High CapEx requires careful ROI analysis.
                                        </div>
                                    </div>

                                    <div className="highlight-box" style={{marginTop: '24px', background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 102, 255, 0.1) 100%)'}}>
                                        <div className="highlight-title">⚡ Key Efficiency Metrics</div>
                                        <div className="info-text">
                                            <strong>Energy Efficiency Ranking (Best to Worst J/token):</strong><br/>
                                            1. ASIC: 0.016 J/token (53× better than GPU)<br/>
                                            2. FPGA: 0.04 J/token (21× better than GPU)<br/>
                                            3. Wafer-Scale: 0.18 J/token (4.7× better than GPU)<br/>
                                            4. GPU: 0.84 J/token (baseline)<br/><br/>
                                            
                                            <strong>MW Yield Ranking (TPS per Megawatt):</strong><br/>
                                            1. ASIC: 150M TPS/MW (107× GPU)<br/>
                                            2. Wafer-Scale: 6.7M TPS/MW (4.8× GPU)<br/>
                                            3. FPGA: 5M TPS/MW (3.6× GPU)<br/>
                                            4. GPU: 1.4M TPS/MW (baseline)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div>
                                <div className="card">
                                    <div className="card-header">
                                        <span className="card-icon"></span>
                                        Editable Price List
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">Electricity Cost ($/kWh)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="0.01"
                                                value={priceList.electricityCost}
                                                onChange={(e) => setPriceList({...priceList, electricityCost: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">Revenue per 1K Tokens ($)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="0.00001"
                                                value={priceList.revenuePerToken}
                                                onChange={(e) => setPriceList({...priceList, revenuePerToken: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">GPU CapEx ($)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="1000"
                                                value={priceList.gpuCapex}
                                                onChange={(e) => setPriceList({...priceList, gpuCapex: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">FPGA CapEx ($)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="1000"
                                                value={priceList.fpgaCapex}
                                                onChange={(e) => setPriceList({...priceList, fpgaCapex: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">ASIC CapEx ($)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="1000"
                                                value={priceList.asicCapex}
                                                onChange={(e) => setPriceList({...priceList, asicCapex: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="price-list-item">
                                        <span className="price-label">Wafer-Scale CapEx ($)</span>
                                        <div className="price-input-group">
                                            <input 
                                                type="number"
                                                className="price-input"
                                                step="10000"
                                                value={priceList.waferCapex}
                                                onChange={(e) => setPriceList({...priceList, waferCapex: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="highlight-box" style={{marginTop: '24px'}}>
                                        <div className="highlight-title">💰 Price Configuration</div>
                                        <div className="info-text">
                                            These prices are used across all calculations. Adjust them to match your specific 
                                            market conditions, electricity rates, and hardware costs. Changes take effect 
                                            immediately in all calculator tabs.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };
