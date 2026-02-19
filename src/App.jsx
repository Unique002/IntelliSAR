import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle, Clock, ChevronRight, FileText, Search, Shield, 
  TrendingUp, Users, XCircle, Info, Edit3, Eye, Download, GitBranch, 
  AlertTriangle, Network, Zap, BarChart3, CheckSquare, Save, Send, 
  MessageSquare, Filter, AlertOctagon 
} from 'lucide-react';

// Import New Components
import AnomalyGraph from './components/AnomalyGraph';
import SimilarCasesWidget from './components/SimilarCasesWidget';

// Import Data
import { 
  mockAlerts, mockAnomalyData, mockSimilarCasesList, mockCases, mockCustomer, 
  mockTransactions, mockTypologies, graphNodes, graphEdges, 
  initialSarSections, evidenceMapping, hallucinationChecks 
} from './data/mockData';

export default function SARPlatform() {
  // 1. Fixed to start on dashboard
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedAlert, setSelectedAlert] = useState(mockAlerts[0]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [sarGenerated, setSarGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [sarSections, setSarSections] = useState(initialSarSections);
  const [isEditing, setIsEditing] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [currentRole, setCurrentRole] = useState('analyst');
  const [workflowStatus, setWorkflowStatus] = useState('summary_ready'); // Updated default status
  const [showToneCalibration, setShowToneCalibration] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isSarReady, setIsSarReady] = useState(false); // 2. Restored this missing state!

  const openQualificationGate = (caseData) => {
    setSelectedCase(caseData);
    setCurrentScreen('alerts');
  };

  const openInvestigationCase = () => {
    setCurrentScreen('investigation');
    setSelectedTransactions([]);
  };

  const openCase = (caseData) => {
    setSelectedCase(caseData);
    setCurrentScreen('investigation');
    setSelectedTransactions([]);
  };

  const generateInvestigationSummary = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setCurrentScreen('sar-draft');
      setWorkflowStatus('summary_ready');
    }, 2500);
  };

  const selectSentence = (index) => {
    setSelectedSentence(index);
  };

  const getSentences = (text) => {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  };

  const toggleTransaction = (txnId) => {
    setSelectedTransactions(prev => 
      prev.includes(txnId) ? prev.filter(id => id !== txnId) : [...prev, txnId]
    );
  };

  const updateSection = (section, value) => {
    setSarSections(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const exportSAR = () => {
    alert('Exporting SAR + Audit Report PDF...\n\nIncludes:\n- Full narrative\n- Transaction evidence trail\n- Typology detection results\n- Defensibility score breakdown\n- Analyst notes');
  };

  const submitForReview = () => {
    setWorkflowStatus('under_review');
    alert('Investigation Summary submitted for compliance review\n\nAssigned to: Senior Compliance Officer\nSLA: 48 hours');
  };

  const approveSAR = () => {
    setWorkflowStatus('approved');
    alert('SAR Approved and filed with FIU-IND\n\nFiling confirmation: FIU-2024-0147\nTimestamp: ' + new Date().toLocaleString());
  };

  const rejectSAR = () => {
    setWorkflowStatus('summary_ready');
    setCurrentRole('analyst');
    alert('Returned to analyst for revision\n\nReviewer feedback: Please strengthen evidence linkage in typology section');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Barclays Header */}
      <header className="bg-cyan-700 border-b-4 border-cyan-900">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <div className="text-cyan-700 font-black text-xl">B</div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
                BARCLAYS SENTINEL
              </h1>
              <div className="text-xs text-cyan-200 uppercase tracking-widest font-semibold">AML Compliance Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex gap-6">
              <button onClick={() => setCurrentScreen('alerts')} className={`text-sm font-semibold transition-colors ${currentScreen === 'alerts' ? 'text-cyan-200 border-b-2 border-cyan-200' : 'text-white hover:text-cyan-200'}`}>Alerts Queue</button>
              <button onClick={() => setCurrentScreen('dashboard')} className={`text-sm font-semibold transition-colors ${currentScreen === 'dashboard' ? 'text-cyan-200 border-b-2 border-cyan-200' : 'text-white hover:text-cyan-200'}`}>Dashboard</button>
              <button className="text-white hover:text-cyan-200 text-sm font-semibold transition-colors">Cases</button>
              <button className="text-white hover:text-cyan-200 text-sm font-semibold transition-colors">Reports</button>
              <button className="text-white hover:text-cyan-200 text-sm font-semibold transition-colors">Analytics</button>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-cyan-600">
              <div className="text-right">
                <div className="text-xs text-cyan-200">Logged in as</div>
                <div className="text-sm font-bold text-white">{currentRole === 'analyst' ? 'Analyst' : currentRole === 'reviewer' ? 'Reviewer' : 'Auditor'}</div>
              </div>
              <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentRole === 'analyst' ? 'AN' : currentRole === 'reviewer' ? 'RV' : 'AD'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher (Demo Only) */}
      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between">
          <div className="text-xs text-amber-700 font-semibold">DEMO MODE: Switch roles to see different workflow views</div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentRole('analyst')}
              className={`px-3 py-1 text-xs font-bold transition-all ${currentRole === 'analyst' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'}`}
            >
              Analyst View
            </button>
            <button 
              onClick={() => setCurrentRole('reviewer')}
              className={`px-3 py-1 text-xs font-bold transition-all ${currentRole === 'reviewer' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'}`}
            >
              Reviewer View
            </button>
            <button 
              onClick={() => setCurrentRole('auditor')}
              className={`px-3 py-1 text-xs font-bold transition-all ${currentRole === 'auditor' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'}`}
            >
              Auditor View
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Screen (Upgrade 3) */}
      {currentScreen === 'alerts' && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
              Alert Intake & Validation
            </h2>
            <p className="text-slate-600 text-lg">Triage raw system alerts before escalating to investigation cases.</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-slate-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Incoming Queue
                </h3>
                <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded">{mockAlerts.length} Pending</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mockAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 cursor-pointer transition-all ${selectedAlert?.id === alert.id ? 'bg-cyan-50 border-l-4 border-cyan-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500">{alert.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${alert.risk === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{alert.risk}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{alert.customer}</div>
                    <div className="text-xs text-slate-600 mt-1">{alert.type}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-6">
              {selectedAlert ? (
                <div className="bg-white border border-slate-200 shadow-sm p-8">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedAlert.customer}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 font-semibold">
                        <span>Trigger: {selectedAlert.type}</span>
                        <span>•</span>
                        <span>Date: {selectedAlert.date}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">AI Validation Basis</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                      <div className="text-red-800 font-bold mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Baseline Deviation Check
                      </div>
                      <div className="text-sm text-red-900">
                        Activity is <span className="font-black text-red-600">{selectedAlert.deviation} above baseline</span> (Customer norm: ₹48K/day).
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                      <div className="text-amber-800 font-bold mb-1 flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4" /> Typology Threshold
                      </div>
                      <div className="text-sm text-amber-900">
                        Funnel account behavior confidence: <span className="font-black text-amber-600">{(selectedAlert.typologyMatch * 100).toFixed(0)}%</span> (70% threshold met).
                      </div>
                    </div>
                    <div className="col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <div className="text-slate-700 font-bold mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Repeat History Check
                      </div>
                      <div className="text-sm text-slate-600">
                        Similar structuring alerts flagged for this entity in the last 90 days. High-risk jurisdiction (UAE) involved in secondary transfers.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button onClick={openInvestigationCase} className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white py-3 px-4 font-bold rounded flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle className="w-5 h-5" /> Open Investigation Case
                    </button>
                    <button onClick={() => alert('Alert dismissed as False Positive.')} className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded transition-colors">
                      Dismiss (False Positive)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 h-full flex items-center justify-center text-slate-500 font-semibold">Select an alert to view validation details</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Screen */}
      {currentScreen === 'dashboard' && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
              Alert Qualification Queue
            </h2>
            <p className="text-slate-600 text-lg">Screen raw alerts before opening investigations</p>
          </div>

          <div className="grid grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 border-l-4 border-cyan-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-slate-900">12</div>
              <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Incoming Alerts</div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+3 this week</span>
              </div>
            </div>
            <div className="bg-white p-6 border-l-4 border-amber-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-slate-900">8</div>
              <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Screening Pending</div>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-600 font-semibold">2 SLA critical</span>
              </div>
            </div>
            <div className="bg-white p-6 border-l-4 border-green-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-slate-900">47</div>
              <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Investigation Opened</div>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">On target</span>
              </div>
            </div>
            <div className="bg-white p-6 border-l-4 border-cyan-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-slate-900">92%</div>
              <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Avg Qualification Precision</div>
              <div className="mt-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-cyan-600 font-semibold">Above benchmark</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-8 py-4 bg-slate-50">
              <div className="grid grid-cols-7 text-xs font-black text-slate-700 uppercase tracking-widest">
                <div>ALERT ID</div>
                <div className="col-span-2">Customer</div>
                <div>Typology</div>
                <div>Risk Level</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>
            {mockCases.map((caseData, idx) => (
              <div
                key={caseData.id}
                className="border-b border-slate-100 px-8 py-5 hover:bg-cyan-50 transition-all cursor-pointer group"
              >
                <div className="grid grid-cols-7 items-center">
                  <div className="font-mono text-sm font-bold text-slate-900">{caseData.id}</div>
                  <div className="col-span-2">
                    <div className="text-sm font-semibold text-slate-900">{caseData.customer}</div>
                    {caseData.similarCases > 0 && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                        <GitBranch className="w-3 h-3" />
                        {caseData.similarCases} similar cases found
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">{caseData.type}</div>
                  <div>
                    <span className={`inline-block px-3 py-1 text-xs font-black rounded ${
                      caseData.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {caseData.risk}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${
                      caseData.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                      caseData.status === 'Drafted' ? 'bg-blue-100 text-blue-700' :
                      caseData.status === 'Under Review' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {caseData.status === 'Open' && <AlertCircle className="w-3 h-3" />}
                      {caseData.status === 'Drafted' && <FileText className="w-3 h-3" />}
                      {caseData.status === 'Under Review' && <Eye className="w-3 h-3" />}
                      {caseData.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                      {caseData.status}
                    </span>
                  </div>
                  <div>
                    {/* 3. Fixed to open Investigation Workspace directly from Dashboard */}
                    <button
                      onClick={() => openCase(caseData)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-700 text-white text-xs font-bold hover:bg-cyan-800 transition-colors group-hover:px-6"
                    >
                      Open Case
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Workspace */}
      {currentScreen === 'investigation' && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentScreen('dashboard')} className="text-cyan-700 hover:text-cyan-900 text-sm font-bold transition-colors">
                ← Back to Dashboard
              </button>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-lg font-black text-slate-900">{selectedCase?.id}</span>
              <span className={`inline-block px-3 py-1 text-xs font-black rounded ${
                selectedCase?.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedCase?.risk} Risk
              </span>
            </div>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                showGraph ? 'bg-purple-700 text-white' : 'bg-white text-purple-700 border border-purple-700 hover:bg-purple-50'
              }`}
            >
              <Network className="w-4 h-4" />
              {showGraph ? 'Hide' : 'Show'} Knowledge Graph
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Customer & Transactions */}
            <div className="col-span-2 space-y-6">
              {/* Customer Profile */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-6 py-4 bg-cyan-700 border-b border-cyan-800">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Customer Profile
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Account Name</div>
                    <div className="text-sm font-bold text-slate-900">{mockCustomer.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Account ID</div>
                    <div className="text-sm font-mono font-bold text-slate-900">{mockCustomer.accountId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Business Type</div>
                    <div className="text-sm font-semibold text-slate-900">{mockCustomer.businessType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Industry</div>
                    <div className="text-sm font-semibold text-slate-900">{mockCustomer.industry}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Relationship</div>
                    <div className="text-sm font-semibold text-slate-900">{mockCustomer.relationship}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Risk Rating</div>
                    <span className="inline-block px-3 py-1 text-xs font-black bg-red-100 text-red-700 rounded">
                      {mockCustomer.riskRating}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">Relationship Officer</div>
                    <div className="text-sm font-semibold text-slate-900">{mockCustomer.officer}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-semibold">KYC Date</div>
                    <div className="text-sm font-semibold text-slate-900">{mockCustomer.kycDate}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Timeline */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Transaction Timeline
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedTransactions.length} of {mockTransactions.filter(t => t.flagged).length} flagged transactions selected
                  </div>
                </div>

                {/* UPGRADE 1: Transaction Anomaly Graph */}
                <AnomalyGraph data={mockAnomalyData} />

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransactions(mockTransactions.filter(t => t.flagged).map(t => t.id));
                              } else {
                                setSelectedTransactions([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest">TXN ID</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-700 uppercase tracking-widest">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest">Source/Dest</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest">Type</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-slate-700 uppercase tracking-widest">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((txn, idx) => (
                        <tr 
                          key={txn.id} 
                          className={`border-b border-slate-100 transition-all ${
                            txn.flagged ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'
                          } ${selectedTransactions.includes(txn.id) ? 'ring-2 ring-inset ring-cyan-500' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedTransactions.includes(txn.id)}
                              onChange={() => toggleTransaction(txn.id)}
                              className="w-4 h-4"
                              disabled={!txn.flagged}
                            />
                          </td>
                          <td className="px-4 py-4 font-mono text-sm font-bold text-slate-900">{txn.id}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold">{txn.date}</td>
                          <td className="px-4 py-4 text-right text-sm font-black text-slate-900">
                            ₹{(txn.amount / 100000).toFixed(2)}L
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold">{txn.source}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-black rounded ${
                              txn.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {txn.type === 'Credit' ? '↓' : '↑'} {txn.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {txn.flagged && (
                              <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Knowledge Graph */}
              {showGraph && (
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 bg-purple-700 border-b border-purple-800">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Knowledge Graph View
                    </h3>
                  </div>
                  <div className="p-6">
                    <svg width="100%" height="500" className="bg-slate-50">
                      {/* Edges */}
                      {graphEdges.map((edge, idx) => {
                        const fromNode = graphNodes.find(n => n.id === edge.from);
                        const toNode = graphNodes.find(n => n.id === edge.to);
                        return (
                          <line
                            key={idx}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray={edge.from === 'customer' ? '5,5' : '0'}
                          />
                        );
                      })}
                      
                      {/* Nodes */}
                      {graphNodes.map((node) => (
                        <g 
                          key={node.id}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={hoveredNode === node.id ? 55 : 50}
                            fill={
                              node.type === 'customer' ? '#0e7490' :
                              node.type === 'source' ? '#059669' :
                              '#dc2626'
                            }
                            stroke={hoveredNode === node.id ? '#fbbf24' : 'white'}
                            strokeWidth={hoveredNode === node.id ? 4 : 3}
                            className="transition-all"
                          />
                          <text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {node.label.split('\n').map((line, i) => (
                              <tspan key={i} x={node.x} dy={i === 0 ? '-0.3em' : '1.1em'}>
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="mt-4 flex items-center gap-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                        <span className="text-slate-600 font-semibold">Source Accounts (47 total)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-700 rounded-full"></div>
                        <span className="text-slate-600 font-semibold">Customer Account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                        <span className="text-slate-600 font-semibold">Destination (High-Risk)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Typology & Actions */}
            <div className="space-y-6">
              {/* Typology Detection */}
              <div className="bg-slate-900 border border-slate-800 shadow-lg">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Evidence Pack Signal
                  </h3>
                  <div className="text-xs text-slate-400 px-6 pt-3">Indicators extracted from locked evidence bundle</div>
                </div>
                <div className="p-6 space-y-5">
                  {mockTypologies.map((typology, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-5 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-black text-white mb-1">{typology.type}</div>
                          <div className="text-xs text-slate-400">{typology.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-amber-400">
                            {(typology.confidence * 100).toFixed(0)}%
                          </div>
                          <div className={`text-xs font-bold ${
                            typology.riskLevel === 'Critical' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {typology.riskLevel}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            typology.riskLevel === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ 
                            width: `${typology.confidence * 100}%`,
                            animationDelay: `${idx * 200}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPGRADE 2: Similar Cases Detected */}
              <SimilarCasesWidget cases={mockSimilarCasesList} />

              <div className="bg-white border border-slate-200 shadow-sm mt-6 mb-6">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-black text-blue-900">Regulatory Guidance (RAG)</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-sm text-slate-700"><strong>RBI Reference:</strong> KYC Master Direction 2016 - Suspicious transaction monitoring required for sub-threshold aggregation.</div>
                  <div className="text-sm text-slate-700"><strong>FATF Note:</strong> Structuring typology indicated by deliberate evasion of reporting thresholds.</div>
                </div>
              </div>

              {/* Generate SAR Button */}
              <button
                onClick={generateInvestigationSummary}
                disabled={generating}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white py-5 px-6 font-black text-base transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-3 group"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Draft...
                  </>
                ) : (
                  
                  <>
                    <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Generate Investigation Summary
                  </>
                )}
              </button>

              <div className="bg-cyan-50 border border-cyan-200 p-4">
                <div className="text-xs font-black text-cyan-900 uppercase tracking-widest mb-2">Quick Actions</div>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Transaction History
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    View Beneficiaries
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Generate Analytics Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAR Draft Screen */}
      {currentScreen === 'sar-draft' && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentScreen('investigation')} className="text-cyan-700 hover:text-cyan-900 text-sm font-bold transition-colors">
                ← Back to Investigation
              </button>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-lg font-black text-slate-900">{selectedCase?.id}</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-black rounded ${
                workflowStatus === 'summary_ready' ? 'bg-amber-100 text-amber-700' :
                workflowStatus === 'under_review' ? 'bg-purple-100 text-purple-700' :
                'bg-green-100 text-green-700'
              }`}>
                {workflowStatus === 'summary_ready' && <Edit3 className="w-3 h-3" />}
                {workflowStatus === 'under_review' && <Eye className="w-3 h-3" />}
                {workflowStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                {workflowStatus === 'summary_ready' ? 'Summary Ready' : workflowStatus === 'under_review' ? 'Under Review' : 'Approved'}
              </span>
              {/* 4. SAR Ready toggle badge added here */}
              {isSarReady && <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded">SAR READY</span>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowToneCalibration(!showToneCalibration)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                  showToneCalibration ? 'bg-orange-700 text-white' : 'bg-white text-orange-700 border border-orange-700 hover:bg-orange-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Tone Calibration
              </button>
              <button
                onClick={exportSAR}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* SAR Narrative */}
            <div className="col-span-2 space-y-6">
              {/* Validation Banner */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-black text-green-900">Evidence Consistency Validation Passed</div>
                    <div className="text-xs text-green-700 mt-1">
                      All narrative sentences are evidence-backed
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-black text-amber-900">1 Tone Calibration</div>
                    <div className="text-xs text-amber-700 mt-1">
                      Regulatory-safe wording proportional to proof
                    </div>
                  </div>
                </div>
              </div>

              {/* Tone Calibration Panel */}
              {showToneCalibration && (
                <div className="bg-orange-50 border border-orange-200 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-700 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-black text-orange-900 mb-2">Regulatory Narrative Calibration</h3>
                      <p className="text-sm text-orange-700">
                        AI detected assertion strength that may exceed evidence support. Review suggested calibrations below.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-orange-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-black text-orange-900 uppercase tracking-widest">Assertion Strength Meter</div>
                      <div className="text-xs text-orange-700 font-semibold">Sentence 4 (Conclusion)</div>
                    </div>
                    
                    <div className="relative h-8 bg-gradient-to-r from-blue-200 via-amber-200 to-red-200 rounded-full mb-3">
                      <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-1 h-full bg-slate-900"></div>
                      <div className="absolute left-[65%] top-1/2 -translate-y-1/2 w-1 h-full bg-green-600"></div>
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold mb-4">
                      <span className="text-blue-700">Informational</span>
                      <span className="text-amber-700">Suspicious</span>
                      <span className="text-red-700">Conclusive</span>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 p-3 mb-3">
                      <div className="text-xs font-bold text-orange-900 mb-1">Issue Detected:</div>
                      <div className="text-sm text-orange-800">
                        "systematic structuring" implies intent without direct customer statement evidence
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-3">
                      <div className="text-xs font-bold text-green-900 mb-1">Recommended Calibration:</div>
                      <div className="text-sm text-green-800">
                        "observed pattern of structured deposits" - maintains factual accuracy, reduces legal exposure
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">
                        Apply Calibration
                      </button>
                      <button className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors">
                        Keep Original
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SAR Narrative */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-6 py-4 bg-cyan-700 border-b border-cyan-800 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Investigation Summary Report (Internal)
                  </h3>
                  {currentRole === 'analyst' && workflowStatus === 'summary_ready' && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white text-cyan-700 text-xs font-bold hover:bg-cyan-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      {isEditing ? 'Save Changes' : 'Edit Narrative'}
                    </button>
                  )}
                </div>

                <div className="p-8 space-y-8">
                  {Object.entries(sarSections).map(([section, content], sectionIdx) => (
                    <div key={section} className="border-b border-slate-200 pb-6 last:border-0">
                      <h4 className="text-xs font-black text-cyan-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-700 text-white rounded-full flex items-center justify-center text-xs">
                          {sectionIdx + 1}
                        </div>
                        {section === 'background' ? 'Customer Background' :
                         section === 'activity' ? 'Observed Activity' :
                         section === 'typology' ? 'Typology Mapping' :
                         section === 'regulatory' ? 'Regulatory Relevance' :
                         'Conclusion'}
                      </h4>
                      {isEditing && currentRole === 'analyst' && workflowStatus === 'summary_ready' ? (
                        <textarea
                          value={content}
                          onChange={(e) => updateSection(section, e.target.value)}
                          className="w-full p-4 border border-slate-300 rounded text-sm leading-relaxed font-medium text-slate-800 min-h-[120px]"
                        />
                      ) : (
                        <div className="space-y-3">
                          {getSentences(content).map((sentence, idx) => {
                            const sentenceIdx = sectionIdx;
                            const isSelected = selectedSentence === sentenceIdx;
                            const hasIssue = hallucinationChecks[sentenceIdx]?.status === 'warning';
                            return (
                              <button
                                key={idx}
                                onClick={() => selectSentence(sentenceIdx)}
                                disabled={currentRole === 'auditor'}
                                className={`block w-full text-left text-sm leading-relaxed transition-all px-4 py-2 rounded ${
                                  isSelected 
                                    ? 'bg-cyan-100 ring-2 ring-cyan-500 text-slate-900 font-semibold' 
                                    : hasIssue
                                    ? 'bg-amber-50 text-slate-800 hover:bg-amber-100'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {sentence.trim()}
                                {hasIssue && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                                    <AlertTriangle className="w-3 h-3" />
                                    Tone
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes Section */}
              {currentRole === 'analyst' && workflowStatus === 'summary_ready' && (
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Analyst Notes
                    </h3>
                  </div>
                  <div className="p-6">
                    <textarea
                      value={analystNotes}
                      onChange={(e) => setAnalystNotes(e.target.value)}
                      placeholder="Add notes for reviewer (optional): Additional context, investigation challenges, recommendations..."
                      className="w-full p-4 border border-slate-300 rounded text-sm leading-relaxed text-slate-800 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Defensibility Score */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-6 py-4 bg-green-700 border-b border-green-800">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance Defensibility Index
                  </h3>
                </div>
                <div className="p-8">
                  <div className="flex items-end gap-4 mb-6">
                    <div className="text-7xl font-black text-green-600">92</div>
                    <div className="text-2xl text-slate-600 font-bold mb-2">/ 100</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700 font-bold">Evidence Coverage</span>
                        <span className="font-black text-slate-900">95%</span>
                      </div>
                      <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div className="bg-green-600 h-full transition-all duration-700" style={{ width: '95%' }} />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {mockTransactions.filter(t => t.flagged).length} transactions mapped to narrative sentences
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700 font-bold">Typology Alignment</span>
                        <span className="font-black text-slate-900">High</span>
                      </div>
                      <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div className="bg-green-600 h-full transition-all duration-700" style={{ width: '88%' }} />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        3/3 detected typologies referenced in narrative
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700 font-bold">Graph Correlation Strength</span>
                        <span className="font-black text-slate-900">Medium</span>
                      </div>
                      <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-700" style={{ width: '72%' }} />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Network analysis supports funnel pattern assertion
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700 font-bold">Structural Completeness</span>
                        <span className="font-black text-slate-900">Full</span>
                      </div>
                      <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div className="bg-green-600 h-full transition-all duration-700" style={{ width: '100%' }} />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        All required SAR sections present and complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Fixed Workflow Actions (Summary Ready State) */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Workflow Actions
                  </h3>
                </div>
                <div className="p-6">
                  {currentRole === 'analyst' && workflowStatus === 'summary_ready' && (
                    <>
                      <div className="text-center text-xs text-slate-500 mb-4 font-bold uppercase tracking-widest">
                        Analyst Edit → Reviewer Approval → Auditor Trace
                      </div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => setIsSarReady(true)} className="w-full bg-white border-2 border-cyan-700 text-cyan-700 hover:bg-cyan-50 py-3 px-6 text-sm font-black transition-colors">
                          Generate Final SAR Draft
                        </button>
                        <button onClick={submitForReview} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-4 px-6 text-sm font-black transition-colors flex items-center justify-center gap-2">
                          <Send className="w-5 h-5" /> Send to Reviewer
                        </button>
                      </div>
                    </>
                  )}
                  
                  {currentRole === 'reviewer' && workflowStatus === 'under_review' && (
                    <div>
                      <div className="bg-purple-50 border border-purple-200 p-4 mb-4">
                        <div className="text-sm font-bold text-purple-900 mb-2">Reviewer Notes</div>
                        <textarea
                          placeholder="Add feedback for analyst or approve for filing..."
                          className="w-full p-3 border border-purple-300 rounded text-sm"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={approveSAR}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 text-sm font-black transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve & File SAR
                        </button>
                        <button
                          onClick={rejectSAR}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 text-sm font-black transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Return to Analyst
                        </button>
                      </div>
                    </div>
                  )}

                  {workflowStatus === 'approved' && (
                    <div className="bg-green-50 border border-green-200 p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <div className="text-lg font-black text-green-900 mb-2">SAR Approved & Filed</div>
                      <div className="text-sm text-green-700">
                        Filed with FIU-IND on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {currentRole === 'auditor' && (
                    <div className="bg-slate-50 border border-slate-200 p-6 text-center">
                      <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <div className="text-lg font-black text-slate-900 mb-2">Read-Only Audit View</div>
                      <div className="text-sm text-slate-700">
                        Full evidence trail available for compliance audit
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Evidence Panel */}
            <div>
              <div className="bg-slate-900 border border-slate-800 shadow-lg sticky top-6">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    Evidence Attribution
                  </h3>
                </div>
                <div className="p-6">
                  {selectedSentence !== null ? (
                    <div className="space-y-5">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Supporting Transactions</div>
                        {evidenceMapping[selectedSentence].transactions.length > 0 ? (
                          <div className="space-y-2">
                            {evidenceMapping[selectedSentence].transactions.map(txnId => {
                              const txn = mockTransactions.find(t => t.id === txnId);
                              return (
                                <div key={txnId} className="bg-slate-800 p-3 rounded">
                                  <div className="text-xs font-mono font-bold text-cyan-400 mb-1">{txnId}</div>
                                  {txn && (
                                    <>
                                      <div className="text-xs text-slate-400">{txn.date}</div>
                                      <div className="text-sm font-black text-white mt-1">
                                        ₹{(txn.amount / 100000).toFixed(2)}L
                                      </div>
                                      <div className="text-xs text-slate-400 mt-1">{txn.source}</div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600 bg-slate-800 p-3 rounded">Profile verification only - no transaction evidence required</div>
                        )}
                      </div>

                      {evidenceMapping[selectedSentence].details && (
                        <div className="border-t border-slate-800 pt-5">
                          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Pattern Details</div>
                          <div className="bg-slate-800 p-4 rounded space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Threshold</span>
                              <span className="font-bold text-white">{evidenceMapping[selectedSentence].details.threshold}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Deviation Range</span>
                              <span className="font-bold text-white">{evidenceMapping[selectedSentence].details.deviation}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-2">
                              Sample amounts: {evidenceMapping[selectedSentence].details.amounts.join(', ')}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-800 pt-5">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Detection Rule</div>
                        <div className="text-sm font-semibold text-white bg-slate-800 p-3 rounded">
                          {evidenceMapping[selectedSentence].rule}
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-5">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Regulatory Source</div>
                        <div className="text-sm font-semibold text-white bg-slate-800 p-3 rounded">
                          {evidenceMapping[selectedSentence].regulatory}
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-5">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Confidence Score</div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-3xl font-black text-cyan-400">
                            {(evidenceMapping[selectedSentence].confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="bg-slate-800 h-4 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full transition-all duration-500"
                            style={{ width: `${evidenceMapping[selectedSentence].confidence * 100}%` }}
                          />
                        </div>
                      </div>

                      {evidenceMapping[selectedSentence].toneIssue ? (
                        <div className="bg-amber-900 bg-opacity-30 border border-amber-700 p-4 rounded">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-amber-400 mb-1">Tone Calibration Recommended</div>
                              <div className="text-xs text-amber-300">
                                {evidenceMapping[selectedSentence].toneIssue.issue}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-900 bg-opacity-20 border border-green-700 p-4 rounded">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-green-400 font-semibold">
                              Sentence fully supported by transaction evidence and regulatory framework
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <div className="text-sm text-slate-500 font-semibold">
                        Click any sentence in the narrative to view supporting evidence and attribution
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}