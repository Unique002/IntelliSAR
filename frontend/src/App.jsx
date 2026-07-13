import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, Clock, ChevronRight, FileText, Search, Shield,
  TrendingUp, Users, XCircle, Info, Edit3, Eye, Download, GitBranch,
  AlertTriangle, Network, Zap, BarChart3, CheckSquare, Save, Send,
  MessageSquare, Filter, AlertOctagon, Lock, XOctagon
} from 'lucide-react';


// Import New Components (Ensure these are in your components folder)
import AnomalyGraph from './components/AnomalyGraph';
import SimilarCasesWidget from './components/SimilarCasesWidget';


// Import Data is now driven entirely by the EvidencePack fetched from PostgreSQL


export default function SARPlatform() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [sarSections, setSarSections] = useState({
    background: '', activity: '', typology: '', regulatory: '', conclusion: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState('summary_ready');
  const [showToneCalibration, setShowToneCalibration] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [approvalDate, setApprovalDate] = useState(null); // Added for Approval Banner

  const [allDashboardItems, setAllDashboardItems] = useState([]);
  const [evidencePack, setEvidencePack] = useState(null);

  // Derive mock data dynamically from PostgreSQL evidence pack if available
  const mockCustomer = evidencePack?.kyc_snapshot || {};
  const mockTransactions = evidencePack?.transactions || [];
  const mockAnomalyData = evidencePack?.anomaly_data || [];
  const mockSimilarCasesList = evidencePack?.similar_cases || [];
  const mockTypologies = evidencePack?.typologies || [];
  
  // Provide fallback coordinates for older database records that lack x/y
  const rawGraphNodes = evidencePack?.graph_data?.nodes || [];
  const graphNodes = rawGraphNodes.map((n, i) => {
    if (n.x !== undefined && n.y !== undefined) return n;
    if (n.id === 'cust') return { ...n, x: 300, y: 250, type: 'customer' };
    const angle = i * ((2 * Math.PI) / Math.max(1, rawGraphNodes.length - 1));
    return { ...n, x: 300 + 150 * Math.cos(angle), y: 250 + 150 * Math.sin(angle), type: 'source' };
  });
  
  const graphEdges = evidencePack?.graph_data?.edges || [];
  const evidenceMapping = evidencePack?.evidence_mapping || {};
  const hallucinationChecks = evidencePack?.hallucination_checks || [];

  const [activeModal, setActiveModal] = useState(null);

  const fetchDashboard = () => {
    fetch('https://intellisar.up.railway.app/api/dashboard')
      .then(res => res.json())
      .then(data => {
        const mappedData = data.map(item => ({
           ...item,
           systemStatus: item.systemStatus,
           reason: item.reason,
           risk: item.risk === 'High' || item.risk === 'Medium' ? 'High' : 'Low',
           workflowStatus: item.workflowStatus
        }));
        setAllDashboardItems(mappedData);
      })
      .catch(err => console.error("Error fetching dashboard:", err));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboard();
    }
  }, [isLoggedIn]);


  // --- AUTOMATED WORKFLOW HANDLERS ---
 
  // Open the Evidence Box (Works for both Rejected and Qualified)
  const openEvidenceBox = (caseData) => {
    setSelectedCase(caseData);
    
    // Route everyone to the investigation screen so they can see all evidence
    setCurrentScreen('investigation');
    
    setSelectedTransactions([]);
    setShowGraph(false);
    
    if (caseData.systemStatus === 'Qualified') {
       fetch(`https://intellisar.up.railway.app/api/evidence/${caseData.id}`)
         .then(res => res.json())
         .then(data => {
            setEvidencePack(data);
            setWorkflowStatus(data.workflow_status || 'summary_ready');
            if (data.sar_sections) {
              setSarSections(data.sar_sections);
            }
         })
         .catch(err => console.error("Error fetching evidence:", err));
    }
  };


  // Proceed to Final SAR (Only for Qualified)
  const openFinalSarReview = () => {
    setCurrentScreen('sar-draft');
    setSelectedSentence(null);
  };


  // Utilities
  const selectSentence = (index) => setSelectedSentence(index);
  const getSentences = (text) => text.match(/[^.!?]+[.!?]+/g) || [];
 
  const toggleTransaction = (txnId) => {
    setSelectedTransactions(prev =>
      prev.includes(txnId) ? prev.filter(id => id !== txnId) : [...prev, txnId]
    );
  };


  const updateSection = (section, value) => {
    setSarSections(prev => ({...prev, [section]: value}));
  };


  const exportSAR = () => alert('Exporting SAR + Audit Report PDF...\n\nIncludes:\n- Full narrative\n- Transaction evidence trail\n- Typology detection results\n- Defensibility score breakdown\n- Analyst notes');
 
  const submitForReview = () => {
    fetch('https://intellisar.up.railway.app/api/governance/signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: selectedCase.id, action: 'submit_for_review', role: currentRole, notes: analystNotes })
    })
    .then(res => res.json())
    .then(data => {
      setWorkflowStatus(data.new_state);
      alert('Edited SAR submitted for compliance review\\n\\nAssigned to: Senior Compliance Officer');
      setCurrentScreen('dashboard');
    })
    .catch(err => console.error("Error submitting for review:", err));
  };


  const approveSAR = () => {
    fetch('https://intellisar.up.railway.app/api/governance/signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: selectedCase.id, action: 'approve', role: currentRole, notes: analystNotes })
    })
    .then(res => res.json())
    .then(data => {
      setWorkflowStatus(data.new_state);
      setApprovalDate(new Date().toLocaleDateString());
      alert('SAR Approved and filed with FIU-IND\\n\\nFiling confirmation: FIU-2024-0147');
      setCurrentScreen('dashboard');
    })
    .catch(err => console.error("Error approving SAR:", err));
  };


  const rejectSAR = () => {
    fetch('https://intellisar.up.railway.app/api/governance/signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: selectedCase.id, action: 'reject', role: currentRole, notes: analystNotes })
    })
    .then(res => res.json())
    .then(data => {
      setWorkflowStatus(data.new_state);
      alert('Returned to analyst for revision\\n\\nReviewer feedback attached.');
      setCurrentScreen('dashboard');
    })
    .catch(err => console.error("Error rejecting SAR:", err));
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded shadow-lg p-8 text-center border-t-4 border-cyan-700">
           <div className="w-16 h-16 bg-cyan-700 text-white rounded flex items-center justify-center font-black text-3xl mx-auto mb-4">B</div>
           <h1 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>INTELLISAR LOGIN</h1>
           <p className="text-sm text-slate-500 mb-8">Select your role to access the workspace.</p>
           
           <div className="space-y-3">
             <button onClick={() => { setCurrentRole('analyst'); setIsLoggedIn(true); }} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 px-4 rounded transition-colors text-sm tracking-wide">Login as Analyst</button>
             <button onClick={() => { setCurrentRole('reviewer'); setIsLoggedIn(true); }} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded transition-colors text-sm tracking-wide">Login as Reviewer</button>
             <button onClick={() => { setCurrentRole('auditor'); setIsLoggedIn(true); }} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded transition-colors text-sm tracking-wide">Login as Auditor</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-cyan-700 border-b-4 border-cyan-900">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
                INTELLISAR
              </h1>
              <div className="text-[10px] md:text-xs text-cyan-200 uppercase tracking-widest font-semibold">Autonomous AML Compliance Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex gap-6">
              <button onClick={() => setCurrentScreen('dashboard')} className={`text-sm font-semibold transition-colors ${currentScreen === 'dashboard' ? 'text-cyan-200 border-b-2 border-cyan-200' : 'text-white hover:text-cyan-200'}`}>
                {currentRole === 'analyst' ? 'Analyst Dashboard' : currentRole === 'reviewer' ? 'Reviewer Dashboard' : 'Auditor Dashboard'}
              </button>
            </div>
            <div className="flex items-center gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-cyan-600">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-cyan-200">Logged in as</div>
                <div className="text-sm font-bold text-white">{currentRole === 'analyst' ? 'Analyst' : currentRole === 'reviewer' ? 'Reviewer' : 'Auditor'}</div>
              </div>
              <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {currentRole === 'analyst' ? 'AN' : currentRole === 'reviewer' ? 'RV' : 'AD'}
              </div>
              <button onClick={() => { setIsLoggedIn(false); setCurrentRole(null); }} className="ml-4 text-xs font-bold text-cyan-200 hover:text-white transition-colors border border-cyan-600 px-3 py-1.5 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* ROLE SWITCHER REMOVED FOR REAL LOGIN */}


      {/* ------------------------------------------------------------------------- */}
      {/* SCREEN 1: UNIFIED DASHBOARD (Alerts & Cases)                              */}
      {/* ------------------------------------------------------------------------- */}
      {currentScreen === 'dashboard' && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {currentRole === 'analyst' ? 'Alert Intake & Qualification Dashboard' : 
               currentRole === 'reviewer' ? 'Compliance Review Queue' : 
               'Monthly SAR Audit Log'}
            </h2>
            <p className="text-slate-600 text-lg">
              {currentRole === 'analyst' ? 'System has automatically processed incoming alerts. Review escalations and auto-dismissals below.' : 
               currentRole === 'reviewer' ? 'Review SAR drafts submitted by analysts. Approve for filing or reject with feedback.' : 
               'Read-only access to approved Suspicious Activity Reports for the current month.'}
            </p>
          </div>


          {/* KPIs */}
          <div className={`grid gap-5 mb-8 ${currentRole === 'analyst' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {currentRole === 'analyst' && (
              <>
                <div className="bg-white p-6 border-l-4 border-slate-400 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Total Alerts Today</div>
                  <div className="mt-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-semibold">Raw system intake</span>
                  </div>
                </div>
                <div className="bg-white p-6 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.systemStatus === 'Dismissed').length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Dismissed as Noise</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-600 font-semibold">Failed qual. gate</span>
                  </div>
                </div>
                <div className="bg-white p-6 border-l-4 border-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.systemStatus === 'Qualified').length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Qualified Alerts</div>
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">Evidence pack built</span>
                  </div>
                </div>
                <div className="bg-white p-6 border-l-4 border-cyan-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.workflowStatus === 'summary_ready').length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Pending Draft</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs text-cyan-600 font-semibold">SAR Drafts ready</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'reviewer' && (
              <>
                <div className="bg-white p-6 border-l-4 border-cyan-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.workflowStatus === 'under_review').length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Pending Review</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs text-cyan-600 font-semibold">Needs attention</span>
                  </div>
                </div>
                <div className="bg-white p-6 border-l-4 border-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.workflowStatus === 'approved').length}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Total Approved</div>
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">SARs filed</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'auditor' && (
              <div className="bg-white p-6 border-l-4 border-purple-600 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="text-3xl font-black text-slate-900">{allDashboardItems.filter(item => item.workflowStatus === 'approved').length}</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest mt-2 font-semibold">Total Approved Cases</div>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-semibold">Available for audit</span>
                </div>
              </div>
            )}
          </div>


          {/* Unified Table */}
          <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
            <div className="border-b border-slate-200 px-8 py-4 bg-slate-50 min-w-[900px]">
              <div className="grid grid-cols-7 text-xs font-black text-slate-700 uppercase tracking-widest">
                <div>ALERT / CASE ID</div>
                <div className="col-span-2">Customer</div>
                <div>Trigger Type</div>
                <div>Qualification Score</div>
                <div>System Status</div>
                <div>Actions</div>
              </div>
            </div>
            <div className="min-w-[900px]">
              {allDashboardItems.filter(item => {
                if (currentRole === 'analyst') return true;
                if (currentRole === 'reviewer') return item.workflowStatus === 'under_review' || item.workflowStatus === 'approved';
                if (currentRole === 'auditor') return item.workflowStatus === 'approved';
                return false;
              }).map((item, idx) => (
                <div key={item.id} className="border-b border-slate-100 px-8 py-5 hover:bg-cyan-50 transition-all cursor-pointer group">
                  <div className="grid grid-cols-7 items-center">
                    <div className="font-mono text-sm font-bold text-slate-900">{item.id}</div>
                    <div className="col-span-2 pr-4">
                      <div className="text-sm font-semibold text-slate-900 truncate">{item.customer}</div>
                      {item.similarCases > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                          <GitBranch className="w-3 h-3" />
                          {item.similarCases} similar cases
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 pr-4">{item.type}</div>
                    <div>
                      {item.systemStatus === 'Qualified' ? (
                        <span className="inline-block px-3 py-1 text-xs font-black rounded bg-green-100 text-green-700">
                          {item.risk === 'High' ? '92/100' : '88/100'} Score
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-black rounded bg-amber-100 text-amber-700">
                          32/100 Score
                        </span>
                      )}
                    </div>
                    <div>
                      {item.workflowStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      ) : item.workflowStatus === 'under_review' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      ) : item.systemStatus === 'Qualified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
                          <FileText className="w-3 h-3" /> SAR Drafted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-slate-100 text-slate-600">
                          <XOctagon className="w-3 h-3" /> Auto-Dismissed
                        </span>
                      )}
                    </div>
                    <div>
                      {item.systemStatus === 'Qualified' ? (
                        <div className="flex gap-2">
                          <button onClick={() => openEvidenceBox(item)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-700 text-white text-xs font-bold hover:bg-cyan-800 transition-colors group-hover:px-6 rounded">
                            Review SAR <ChevronRight className="w-4 h-4" />
                          </button>
                          {currentRole === 'reviewer' && item.workflowStatus === 'approved' && (
                             <button onClick={(e) => { 
                               e.stopPropagation(); 
                               fetch('https://intellisar.up.railway.app/api/governance/signoff', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ case_id: item.id, action: 'reject', role: 'reviewer', notes: 'Approval Revoked' })
                               }).then(() => fetchDashboard());
                             }} className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors rounded">
                               Revoke
                             </button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => openEvidenceBox(item)} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors rounded">
                          <Search className="w-4 h-4" /> View Rejection Log
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------------------- */}
      {/* SCREEN 2: EVIDENCE BOX & INVESTIGATION SUMMARY (Step 2 & 3)               */}
      {/* ------------------------------------------------------------------------- */}
      {currentScreen === 'investigation' && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => setCurrentScreen('dashboard')} className="text-cyan-700 hover:text-cyan-900 text-sm font-bold transition-colors">
                ← Back to Dashboard
              </button>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="font-mono text-lg font-black text-slate-900">
                {selectedCase?.systemStatus === 'Dismissed' ? `Rejection Audit: ${selectedCase.id}` : `Evidence Box: ${selectedCase?.id}`}
              </span>
              <span className="bg-slate-200 text-slate-700 px-2 py-1 text-xs font-black rounded uppercase tracking-widest">
                Read-Only Audit View
              </span>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {selectedCase?.systemStatus !== 'Dismissed' && (
                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded ${
                    showGraph ? 'bg-purple-700 text-white' : 'bg-white text-purple-700 border border-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  {showGraph ? 'Hide Graph' : 'Show Graph'}
                </button>
              )}
              {selectedCase?.systemStatus !== 'Dismissed' && (
                <button onClick={openFinalSarReview} className="flex-1 md:flex-none bg-cyan-700 hover:bg-cyan-800 text-white py-2 px-6 font-black rounded inline-flex items-center justify-center gap-2 shadow-sm transition-all">
                  Proceed to Trust Validation & SAR Draft →
                </button>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Customer, Evidence, Graph */}
            <div className="col-span-1 xl:col-span-2 space-y-6">
             
              {/* Dynamic Header based on Status */}
              {selectedCase?.systemStatus === 'Dismissed' ? (
                <div className="bg-amber-50 border border-amber-300 shadow-sm p-6 rounded-lg mb-6">
                   <h3 className="text-xl font-black text-amber-900 flex items-center gap-2 mb-2">
                     <XOctagon className="w-6 h-6 text-amber-600" />
                     Step 1: Qualification Gate Failure Analysis
                   </h3>
                   <div className="text-sm font-bold text-amber-800 bg-amber-200/50 p-4 rounded border border-amber-200">
                     System Reason: {selectedCase.reason}
                   </div>
                   <p className="text-sm text-amber-700 mt-3">Below is the snapshot of the evidence bundle at the time of rejection. No SAR was generated.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm p-6 md:p-8 mb-6 relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" /> Step 3: Internal Investigation Summary
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 font-semibold uppercase tracking-widest">Evidence-First Pre-SAR Narrative</p>
                 
                  <div className="bg-slate-50 border border-slate-200 p-4 md:p-6 rounded text-sm text-slate-800 leading-relaxed font-medium">
                    <p className="mb-4">{sarSections.background}</p>
                    <p className="mb-4">{sarSections.activity}</p>
                    <p>{sarSections.conclusion}</p>
                  </div>
                </div>
              )}


              {/* Customer Profile */}
              <div className="bg-white border border-slate-200 shadow-sm rounded">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 rounded-t">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" /> Assembled Customer Profile
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Account Name</div><div className="text-sm font-bold text-slate-900">{selectedCase?.customer}</div></div>
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Account ID</div><div className="text-sm font-mono font-bold text-slate-900">{mockCustomer.accountId}</div></div>
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Business Type</div><div className="text-sm font-semibold text-slate-900">{mockCustomer.businessType}</div></div>
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Industry</div><div className="text-sm font-semibold text-slate-900">{mockCustomer.industry}</div></div>
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Relationship</div><div className="text-sm font-semibold text-slate-900">{mockCustomer.relationship}</div></div>
                  <div><div className="text-xs text-slate-500 uppercase font-semibold">Risk Rating</div><span className="inline-block px-2 py-0.5 text-xs font-black bg-slate-100 text-slate-700 rounded mt-1">{mockCustomer.riskRating || selectedCase?.risk || 'High Risk'}</span></div>
                </div>
              </div>


              {/* Transaction Timeline */}
              <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" /> Locked Transaction Evidence
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedTransactions.length} of {mockTransactions.filter(t => t.flagged).length} flagged selected
                  </div>
                </div>
                <div className="p-4 bg-slate-50">
                   <AnomalyGraph data={mockAnomalyData} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-widest w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTransactions(mockTransactions.filter(t => t.flagged).map(t => t.id));
                              else setSelectedTransactions([]);
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
                      {mockTransactions.map((txn) => (
                        <tr key={txn.id} className={`border-b border-slate-100 transition-all ${txn.flagged ? 'bg-amber-50' : ''}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(txn.id)}
                              onChange={() => toggleTransaction(txn.id)}
                              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                              disabled={!txn.flagged}
                            />
                          </td>
                          <td className="px-4 py-4 font-mono text-sm font-bold text-slate-900">{txn.id}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold">{txn.date}</td>
                          <td className="px-4 py-4 text-right text-sm font-black text-slate-900">₹{(txn.amount / 100000).toFixed(2)}L</td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold truncate max-w-[150px]">{txn.source}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-black rounded ${txn.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {txn.type === 'Credit' ? '↓' : '↑'} {txn.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {txn.flagged && <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
             
              {/* Trust Layer 2: Knowledge Graph */}
              {showGraph && selectedCase?.systemStatus !== 'Dismissed' && (
                <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                  <div className="px-6 py-4 bg-purple-700 border-b border-purple-800">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Trust Layer 2: Compliance Knowledge Graph
                    </h3>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <svg width="100%" height="500" className="bg-slate-50 border border-slate-200 rounded min-w-[600px]">
                      {graphEdges.map((edge, idx) => {
                        const fromNode = graphNodes.find(n => n.id === edge.from);
                        const toNode = graphNodes.find(n => n.id === edge.to);
                        return (
                          <line
                            key={idx} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                            stroke="#94a3b8" strokeWidth="2" strokeDasharray={edge.from === 'customer' ? '5,5' : '0'}
                          />
                        );
                      })}
                      {graphNodes.map((node) => (
                        <g
                          key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}
                          className="cursor-pointer"
                        >
                          <circle cx={node.x} cy={node.y} r={hoveredNode === node.id ? 55 : 50}
                            fill={node.type === 'customer' ? '#0e7490' : node.type === 'source' ? '#059669' : '#dc2626'}
                            stroke={hoveredNode === node.id ? '#fbbf24' : 'white'} strokeWidth={hoveredNode === node.id ? 4 : 3}
                            className="transition-all"
                          />
                          <text x={node.x} y={node.y} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="pointer-events-none">
                            {node.label.split('\n').map((line, i) => (
                              <tspan key={i} x={node.x} dy={i === 0 ? '-0.3em' : '1.1em'}>{line}</tspan>
                            ))}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="mt-4 flex flex-wrap items-center gap-4 md:gap-6 text-xs">
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded-full"></div><span className="text-slate-600 font-semibold">Source Accounts</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cyan-700 rounded-full"></div><span className="text-slate-600 font-semibold">Customer Account</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-full"></div><span className="text-slate-600 font-semibold">Destination (High-Risk)</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Right Column - Checklists, Typologies, Quick Actions */}
            <div className="space-y-6">
              {/* Evidence Bundle Checklist */}
              <div className="bg-slate-900 border border-slate-800 shadow-lg rounded overflow-hidden">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-400" /> Step 2: Evidence Bundle
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> <span className="text-sm font-semibold">KYC Profile Loaded</span></div>
                  <div className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> <span className="text-sm font-semibold">Transactions Locked ({mockTransactions.length})</span></div>
                  <div className="flex items-center gap-3 text-white">
                    {selectedCase?.systemStatus === 'Dismissed' ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    <span className="text-sm font-semibold">Typology Confidence Met</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    {selectedCase?.systemStatus === 'Dismissed' ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    <span className="text-sm font-semibold">Regulatory Snippets Retrieved</span>
                  </div>
                </div>
              </div>


              {/* Typology Detection */}
              <div className="bg-slate-900 border border-slate-800 shadow-lg rounded overflow-hidden">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> AI Typology Signals
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  {mockTypologies.map((typology, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-5 last:border-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white mb-1 truncate">{typology.type}</div>
                          <div className="text-xs text-slate-400 line-clamp-2">{typology.description}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-black text-amber-400">
                            {selectedCase?.systemStatus === 'Dismissed' ? '32%' : `${(typology.confidence * 100).toFixed(0)}%`}
                          </div>
                          <div className={`text-xs font-bold ${typology.riskLevel === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                            {selectedCase?.systemStatus === 'Dismissed' ? 'Low' : typology.riskLevel}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                        <div className={`h-full transition-all duration-500 ${typology.riskLevel === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: selectedCase?.systemStatus === 'Dismissed' ? '32%' : `${typology.confidence * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* UPGRADE 2: Similar Cases Detected */}
              {selectedCase?.systemStatus !== 'Dismissed' && (
                <SimilarCasesWidget cases={mockSimilarCasesList} setActiveModal={setActiveModal} />
              )}


              {/* Regulatory Guidance RAG */}
              {selectedCase?.systemStatus !== 'Dismissed' && (
                <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-700" />
                    <h3 className="text-sm font-black text-blue-900">Regulatory Guidance (RAG)</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-sm text-slate-700 leading-relaxed"><strong>RBI Reference:</strong> KYC Master Direction 2016 - Suspicious transaction monitoring required for sub-threshold aggregation.</div>
                    <div className="text-sm text-slate-700 leading-relaxed"><strong>FATF Note:</strong> Structuring typology indicated by deliberate evasion of reporting thresholds.</div>
                  </div>
                </div>
              )}


              {/* Quick Actions Restored */}
              <div className="bg-cyan-50 border border-cyan-200 p-4 rounded">
                <div className="text-xs font-black text-cyan-900 uppercase tracking-widest mb-3">Quick Analyst Actions</div>
                <div className="space-y-2">
                  <button onClick={() => setActiveModal('search')} className="w-full text-left px-4 py-3 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-3 rounded border border-cyan-100">
                    <Search className="w-4 h-4" /> Search Transaction History
                  </button>
                  <button onClick={() => setActiveModal('beneficiaries')} className="w-full text-left px-4 py-3 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-3 rounded border border-cyan-100">
                    <Users className="w-4 h-4" /> View Beneficiaries
                  </button>
                  <button onClick={() => setActiveModal('analytics')} className="w-full text-left px-4 py-3 bg-white hover:bg-cyan-100 text-sm text-cyan-900 font-semibold transition-colors flex items-center gap-3 rounded border border-cyan-100">
                    <BarChart3 className="w-4 h-4" /> Generate Analytics Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------------------- */}
      {/* SCREEN 3: FORMAL SAR DRAFT & TRUST LAYERS (Step 4 & 5)                    */}
      {/* ------------------------------------------------------------------------- */}
      {currentScreen === 'sar-draft' && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <button onClick={() => setCurrentScreen('dashboard')} className="text-cyan-700 hover:text-cyan-900 text-sm font-bold transition-colors">
                ← Back to Dashboard
              </button>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="font-mono text-lg font-black text-slate-900">SAR Draft: {selectedCase?.id}</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-black rounded ${
                workflowStatus === 'summary_ready' ? 'bg-amber-100 text-amber-700' :
                workflowStatus === 'under_review' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {workflowStatus === 'summary_ready' && <Edit3 className="w-3 h-3" />}
                {workflowStatus === 'under_review' && <Eye className="w-3 h-3" />}
                {workflowStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                {workflowStatus === 'summary_ready' ? 'Draft Review' : workflowStatus === 'under_review' ? 'Under Review' : 'Approved'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button onClick={() => setCurrentScreen('investigation')} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors rounded">
                <Search className="w-4 h-4" /> Raw Evidence
              </button>
              {currentRole !== 'auditor' && (
                <button onClick={() => setShowToneCalibration(!showToneCalibration)} className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded ${showToneCalibration ? 'bg-orange-700 text-white' : 'bg-white text-orange-700 border border-orange-700 hover:bg-orange-50'}`}>
                  <AlertTriangle className="w-4 h-4" /> Tone Calibration
                </button>
              )}
            </div>
          </div>


          {/* UNCONDITIONAL APPROVAL BANNER */}
          {workflowStatus === 'approved' && (
            <div className="bg-green-50 border-2 border-green-400 py-8 px-6 text-center rounded-lg shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" strokeWidth={2.5} />
              <h2 className="text-2xl font-black text-green-900 mb-2">SAR Approved & Filed</h2>
              <p className="text-green-800 text-sm font-medium">Filed with FIU-IND on {approvalDate || new Date().toLocaleDateString()}</p>
            </div>
          )}


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - SAR Narrative */}
            <div className="col-span-1 xl:col-span-2 space-y-6">
             
              {/* Trust Layer 1 Banner */}
              <div className="bg-green-50 border-l-4 border-green-600 p-4 flex items-start gap-3 shadow-sm rounded">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-black text-green-900">Trust Layer 1: Evidence Consistency Validation Passed</div>
                  <div className="text-xs text-green-700 mt-1">
                    System verifies no statement exists without mapped evidence. Factual accuracy confirmed.
                  </div>
                </div>
              </div>


              {/* Trust Layer 5: Tone Calibration Panel */}
              {showToneCalibration && currentRole !== 'auditor' && (
                <div className="bg-orange-50 border border-orange-200 p-6 shadow-sm rounded">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-black text-orange-900 mb-1">Trust Layer 5: Regulatory Narrative Calibration Engine</h3>
                      <p className="text-sm text-orange-700">Prevents narrative overreach. Adjusting wording to match evidence strength.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-orange-200 p-4 rounded">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="text-xs font-black text-orange-900 uppercase tracking-widest">Assertion Strength Meter</div>
                      <div className="text-xs text-orange-700 font-semibold">Sentence 4 (Conclusion)</div>
                    </div>
                   
                    <div className="relative h-6 md:h-8 bg-gradient-to-r from-blue-200 via-amber-200 to-red-200 rounded-full mb-3">
                      <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-1 h-full bg-slate-900"></div>
                      <div className="absolute left-[65%] top-1/2 -translate-y-1/2 w-1 h-full bg-green-600"></div>
                    </div>
                   
                    <div className="flex justify-between text-[10px] md:text-xs font-bold mb-4">
                      <span className="text-blue-700">Informational</span>
                      <span className="text-amber-700">Suspicious</span>
                      <span className="text-red-700">Conclusive</span>
                    </div>


                    <div className="bg-orange-50 p-3 mb-3 border border-orange-200 rounded">
                      <div className="text-xs font-bold text-orange-900 mb-1">Issue Detected:</div>
                      <div className="text-sm text-orange-800">"systematic structuring" implies intent without direct customer admission.</div>
                    </div>
                    <div className="bg-green-50 p-3 border border-green-200 rounded">
                      <div className="text-xs font-bold text-green-900 mb-1">Recommended Change:</div>
                      <div className="text-sm text-green-800">"observed pattern of structured deposits" (Maintains factual accuracy, reduces legal exposure).</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button className="flex-1 min-w-[150px] px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors rounded">Apply Calibration</button>
                      <button className="flex-1 min-w-[150px] px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors rounded">Keep Original</button>
                    </div>
                  </div>
                </div>
              )}


              {/* Editable SAR Draft */}
              <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                <div className="px-4 md:px-6 py-4 bg-cyan-700 border-b border-cyan-800 flex flex-wrap gap-3 items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    Step 4: Formal SAR Draft Generator
                  </h3>
                  {currentRole === 'analyst' && workflowStatus === 'summary_ready' && (
                    <button onClick={() => setIsEditing(!isEditing)} className="inline-flex items-center gap-2 px-3 py-1 bg-white text-cyan-700 text-xs font-bold hover:bg-cyan-50 transition-colors rounded">
                      <Edit3 className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Analyst Edit Mode'}
                    </button>
                  )}
                </div>


                <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                  {Object.entries(sarSections).map(([section, content], sectionIdx) => (
                    <div key={section} className="border-b border-slate-200 pb-6 last:border-0">
                      <h4 className="text-xs font-black text-cyan-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-700 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {sectionIdx + 1}
                        </div>
                        {section === 'background' ? 'Customer Background' :
                         section === 'activity' ? 'Observed Activity' :
                         section === 'typology' ? 'Typology Mapping' :
                         section === 'regulatory' ? 'Regulatory Relevance' : 'Conclusion'}
                      </h4>
                      {isEditing && currentRole === 'analyst' && workflowStatus === 'summary_ready' ? (
                        <textarea
                          value={content}
                          onChange={(e) => updateSection(section, e.target.value)}
                          className="w-full p-4 border border-slate-300 rounded text-sm leading-relaxed font-medium text-slate-800 min-h-[120px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        />
                      ) : (
                        <div className="space-y-2 md:space-y-3">
                          {getSentences(content).map((sentence, idx) => {
                            const isSelected = selectedSentence === sectionIdx;
                            const hasIssue = hallucinationChecks[sectionIdx]?.status === 'warning';
                            return (
                              <button
                                key={idx}
                                onClick={() => selectSentence(sectionIdx)}
                                className={`block w-full text-left text-sm leading-relaxed transition-all px-3 md:px-4 py-2 rounded border-l-4 ${
                                  isSelected
                                    ? 'bg-cyan-50 border-cyan-500 text-slate-900 font-semibold shadow-inner'
                                    : hasIssue
                                    ? 'bg-amber-50 border-amber-500 text-slate-800 hover:bg-amber-100'
                                    : 'border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                {sentence.trim()}
                                {hasIssue && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    <AlertTriangle className="w-3 h-3" /> Tone
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


              {/* Analyst Override Notes */}
              {currentRole === 'analyst' && workflowStatus === 'summary_ready' && (
                <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                  <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Analyst Override Notes
                    </h3>
                  </div>
                  <div className="p-6">
                    <textarea
                      value={analystNotes}
                      onChange={(e) => setAnalystNotes(e.target.value)}
                      placeholder="Add manual context for reviewer before submitting..."
                      className="w-full p-4 border border-slate-300 rounded text-sm leading-relaxed text-slate-800 min-h-[100px] focus:ring-2 focus:ring-slate-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Right Column - Trust Layers Sidebar */}
            <div className="space-y-6">
             
              {/* Trust Layer 3: Defensibility Score */}
              <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                <div className="px-6 py-4 bg-green-700 border-b border-green-800">
                  <h3 className="text-md font-black text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    Trust Layer 3: Defensibility Index
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-6xl font-black text-green-600 tracking-tighter">92</div>
                    <div className="text-xl text-slate-500 font-bold mb-1">/ 100</div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-bold">Evidence Coverage</span><span className="font-black text-slate-900">95%</span></div>
                      <div className="bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-green-600 h-full" style={{ width: '95%' }} /></div>
                      <div className="text-[10px] text-slate-500 mt-1">{mockTransactions.filter(t => t.flagged).length} transactions mapped to narrative</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-bold">Typology Alignment</span><span className="font-black text-slate-900">High</span></div>
                      <div className="bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-green-600 h-full" style={{ width: '88%' }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-bold">Graph Correlation</span><span className="font-black text-slate-900">Medium</span></div>
                      <div className="bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: '72%' }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-bold">Structural Completeness</span><span className="font-black text-slate-900">Full</span></div>
                      <div className="bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-green-600 h-full" style={{ width: '100%' }} /></div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Trust Layer 4: Evidence Attribution Panel */}
              <div className="bg-slate-900 border border-slate-800 shadow-lg sticky top-6 rounded overflow-hidden">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="text-md font-black text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    Trust Layer 4: Evidence Attribution
                  </h3>
                </div>
                <div className="p-6">
                  {selectedSentence !== null ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Supporting Transactions</div>
                        {evidenceMapping[selectedSentence] && evidenceMapping[selectedSentence].transactions.length > 0 ? (
                          <div className="space-y-2">
                            {evidenceMapping[selectedSentence].transactions.map(txnId => {
                              const txn = mockTransactions.find(t => t.id === txnId);
                              return (
                                <div key={txnId} className="bg-slate-800 p-3 rounded border border-slate-700">
                                  <div className="text-xs font-mono font-bold text-cyan-400 mb-1">{txnId}</div>
                                  {txn && (
                                    <>
                                      <div className="text-xs text-slate-400">{txn.date}</div>
                                      <div className="text-sm font-black text-white mt-1">₹{(txn.amount / 100000).toFixed(2)}L</div>
                                      <div className="text-xs text-slate-400 mt-1 truncate" title={txn.source}>{txn.source}</div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 bg-slate-800 p-4 rounded border border-slate-700 text-center italic">
                            Profile verification only - no transaction evidence required
                          </div>
                        )}
                      </div>


                      {evidenceMapping[selectedSentence]?.details && (
                        <div className="border-t border-slate-800 pt-5">
                          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Pattern Details</div>
                          <div className="bg-slate-800 p-4 rounded space-y-2 border border-slate-700">
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Threshold</span><span className="font-bold text-white">{evidenceMapping[selectedSentence].details.threshold}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Deviation Range</span><span className="font-bold text-white">{evidenceMapping[selectedSentence].details.deviation}</span></div>
                            <div className="text-xs text-slate-500 mt-3 border-t border-slate-700 pt-2 leading-relaxed">Sample amounts: {evidenceMapping[selectedSentence].details.amounts.join(', ')}</div>
                          </div>
                        </div>
                      )}


                      <div className="border-t border-slate-800 pt-5">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Detection Rule</div>
                        <div className="text-sm font-semibold text-slate-200 bg-slate-800 p-3 rounded border border-slate-700 leading-relaxed">
                          {evidenceMapping[selectedSentence]?.rule || 'Standard Profile Verification'}
                        </div>
                      </div>


                      <div className="border-t border-slate-800 pt-5">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Regulatory Source (RAG)</div>
                        <div className="text-sm font-semibold text-slate-200 bg-slate-800 p-3 rounded border border-slate-700 leading-relaxed">
                          {evidenceMapping[selectedSentence]?.regulatory || 'Internal KYC Policy standard compliance.'}
                        </div>
                      </div>


                      {evidenceMapping[selectedSentence]?.confidence && (
                        <div className="border-t border-slate-800 pt-5">
                          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Confidence Score</div>
                          <div className="flex items-center gap-4 mb-2"><div className="text-3xl font-black text-cyan-400">{(evidenceMapping[selectedSentence].confidence * 100).toFixed(0)}%</div></div>
                          <div className="bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${evidenceMapping[selectedSentence].confidence * 100}%` }} /></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-sm text-slate-400 font-semibold leading-relaxed">
                        Click any sentence in the narrative to view its underlying proof and audit trace.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Step 5: Governance Footer Bar */}
          <div className="mt-8 bg-slate-900 p-6 shadow-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 rounded-lg">
            <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
               <div className="text-white font-black uppercase tracking-widest text-sm mr-2 w-full sm:w-auto mb-2 sm:mb-0">Step 5: Governance</div>
               <div className={`px-3 py-2 rounded text-xs font-bold ${currentRole === 'analyst' ? 'bg-cyan-700 text-white' : 'text-slate-400 border border-slate-700'}`}>1. Analyst Edit</div>
               <div className={`px-3 py-2 rounded text-xs font-bold ${currentRole === 'reviewer' ? 'bg-purple-700 text-white' : 'text-slate-400 border border-slate-700'}`}>2. Reviewer Approve</div>
               <div className={`px-3 py-2 rounded text-xs font-bold ${currentRole === 'auditor' ? 'bg-slate-700 text-white' : 'text-slate-400 border border-slate-700'}`}>3. Auditor Logs</div>
            </div>
           
            <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-start xl:justify-end">
               {/* Analyst Action */}
               {currentRole === 'analyst' && (
                 <button onClick={submitForReview} className="bg-white text-slate-900 px-6 py-3 font-black text-sm flex items-center justify-center w-full sm:w-auto gap-2 hover:bg-slate-200 transition-colors rounded">
                   <Send className="w-4 h-4"/> Submit Edited SAR for Review
                 </button>
               )}
               
               {/* Reviewer Actions */}
               {currentRole === 'reviewer' && workflowStatus !== 'approved' && (
                 <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                   <button onClick={rejectSAR} className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-3 font-black text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors rounded">
                     <XCircle className="w-4 h-4"/> Reject
                   </button>
                   <button onClick={approveSAR} className="flex-1 sm:flex-none bg-green-500 text-white px-6 py-3 font-black text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors rounded">
                     <CheckCircle className="w-4 h-4"/> Approve & File
                   </button>
                 </div>
               )}
               
               {/* Reviewer / Auditor explicitly sees Approved Status in Footer */}
               {(currentRole === 'reviewer' || currentRole === 'auditor') && workflowStatus === 'approved' && (
                  <div className="bg-green-900/40 border border-green-700 text-green-300 px-5 py-3 font-black text-sm flex items-center justify-center w-full sm:w-auto gap-2 rounded">
                    <CheckCircle className="w-4 h-4"/> Successfully Approved
                  </div>
               )}


               {/* Auditor Action */}
               {currentRole === 'auditor' && (
                 <button onClick={exportSAR} className="bg-cyan-600 text-white px-6 py-3 font-black text-sm flex items-center justify-center w-full sm:w-auto gap-2 hover:bg-cyan-700 transition-colors rounded">
                   <Download className="w-4 h-4"/> Export Full Audit Trail
                 </button>
               )}
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------------------- */}
      {/* SCREEN 4: SIMPLIFIED REVIEWER / AUDITOR VIEW                              */}
      {/* ------------------------------------------------------------------------- */}
      {currentScreen === 'simplified-review' && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <button onClick={() => setCurrentScreen('dashboard')} className="text-cyan-700 hover:text-cyan-900 text-sm font-bold transition-colors">
                ← Back to Dashboard
              </button>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="font-mono text-lg font-black text-slate-900">SAR Review: {selectedCase?.id}</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-black rounded ${
                workflowStatus === 'summary_ready' ? 'bg-amber-100 text-amber-700' :
                workflowStatus === 'under_review' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {workflowStatus === 'summary_ready' && <Edit3 className="w-3 h-3" />}
                {workflowStatus === 'under_review' && <Eye className="w-3 h-3" />}
                {workflowStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                {workflowStatus === 'summary_ready' ? 'Draft Review' : workflowStatus === 'under_review' ? 'Under Review' : 'Approved'}
              </span>
            </div>
            {currentRole === 'auditor' && (
               <button onClick={exportSAR} className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 font-bold rounded inline-flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> Export Audit Package
               </button>
            )}
          </div>

          {workflowStatus === 'approved' && (
            <div className="bg-green-50 border-2 border-green-400 py-6 px-6 rounded-lg shadow-sm mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-black text-green-900">SAR Approved & Filed</h2>
                  <p className="text-green-800 text-sm font-medium">Filed with FIU-IND on {approvalDate || new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Final SAR Output */}
            <div className="col-span-1 xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    Final Suspicious Activity Report (SAR)
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {Object.entries(sarSections).map(([section, content], sectionIdx) => (
                    <div key={section} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                        {section === 'background' ? 'Customer Background' :
                         section === 'activity' ? 'Observed Activity' :
                         section === 'typology' ? 'Typology Mapping' :
                         section === 'regulatory' ? 'Regulatory Relevance' : 'Conclusion'}
                      </h4>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes if available */}
              {evidencePack?.analyst_notes && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded">
                   <h3 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                     <MessageSquare className="w-4 h-4" /> Analyst Context Notes
                   </h3>
                   <p className="text-sm text-blue-800">{evidencePack.analyst_notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Supporting Evidence */}
            <div className="space-y-6">
               <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
                 <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                   <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <Shield className="w-4 h-4" /> Supporting Evidence
                   </h3>
                 </div>
                 <div className="p-4 space-y-4">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Risk Rating</div>
                      <div className="text-sm font-semibold text-slate-900">{caseData.risk || 'High Risk'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-2">Customer</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedCase?.customer}</div>
                      <div className="text-xs text-slate-600">{mockCustomer?.businessType || 'N/A'} - {mockCustomer?.industry || 'N/A'}</div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <div className="text-xs text-slate-500 font-bold uppercase mb-2">Flagged Transactions</div>
                      <div className="space-y-2">
                        {mockTransactions.filter(t => t.flagged).map(txn => (
                           <div key={txn.id} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                             <div className="flex justify-between font-bold text-slate-700 mb-1">
                               <span className="font-mono">{txn.id}</span>
                               <span>₹{(txn.amount / 100000).toFixed(2)}L</span>
                             </div>
                             <div className="text-slate-500 truncate">{txn.source}</div>
                           </div>
                        ))}
                      </div>
                    </div>
                 </div>
               </div>

               {/* Immutable Audit Trail */}
               <div className="bg-slate-900 border border-slate-800 shadow-sm rounded overflow-hidden">
                 <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
                   <h3 className="text-sm font-black text-white flex items-center gap-2">
                     <Lock className="w-4 h-4" /> Immutable Audit Trail
                   </h3>
                 </div>
                 <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">AN</div>
                       <div>
                         <div className="text-sm font-bold text-white">Analyst Submission</div>
                         <div className="text-xs text-slate-400">SAR drafted and submitted for review.</div>
                       </div>
                    </div>
                    {workflowStatus === 'approved' && (
                      <div className="flex gap-3 relative before:absolute before:left-4 before:-top-4 before:h-4 before:w-0.5 before:bg-slate-700">
                         <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 z-10">RV</div>
                         <div>
                           <div className="text-sm font-bold text-white">Reviewer Approval</div>
                           <div className="text-xs text-green-400">Approved and Finalized.</div>
                         </div>
                      </div>
                    )}
                 </div>
               </div>

               {/* Reviewer Action Buttons */}
               {currentRole === 'reviewer' && workflowStatus === 'under_review' && (
                 <div className="space-y-3 pt-4">
                   <button onClick={approveSAR} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 font-black rounded flex items-center justify-center gap-2 transition-colors">
                     <CheckCircle className="w-5 h-5" /> Approve SAR & File
                   </button>
                   <button onClick={rejectSAR} className="w-full bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 px-4 font-black rounded flex items-center justify-center gap-2 transition-colors">
                     <XCircle className="w-5 h-5" /> Reject to Analyst
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="bg-cyan-700 px-6 py-4 flex justify-between items-center border-b border-cyan-800">
              <h3 className="text-lg font-black text-white">
                {activeModal === 'search' ? 'Transaction History Search' :
                 activeModal === 'beneficiaries' ? 'Beneficiary Network Analysis' :
                 activeModal === 'analytics' ? 'Advanced Analytics Report' :
                 'Similar Case Review'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-cyan-100 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 h-[400px] overflow-y-auto bg-slate-50">
              {activeModal === 'search' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search by amount, counterparty, or date..." className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-cyan-500" />
                    <button className="bg-cyan-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-cyan-800"><Search className="w-4 h-4"/> Search</button>
                  </div>
                  <div className="bg-white border border-slate-200 p-8 rounded text-center text-slate-500 text-sm">
                    Enter search criteria to query the full historical ledger for {selectedCase?.customer}.
                  </div>
                </div>
              )}
              {activeModal === 'beneficiaries' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded p-4">
                    <div className="font-bold text-slate-900 mb-2">Known Beneficiaries</div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex justify-between border-b pb-2"><span>Apex Trading LLC</span> <span className="font-mono bg-slate-100 px-2 rounded">ACC-9921</span></li>
                      <li className="flex justify-between border-b pb-2"><span>Global Impex</span> <span className="font-mono bg-slate-100 px-2 rounded">ACC-5510</span></li>
                      <li className="flex justify-between"><span>Nexus Logistics</span> <span className="font-mono bg-slate-100 px-2 rounded">ACC-8842</span></li>
                    </ul>
                  </div>
                </div>
              )}
              {activeModal === 'analytics' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BarChart3 className="w-12 h-12 text-cyan-200 mb-4" />
                  <h4 className="text-slate-800 font-bold mb-2">Analytics Engine Initializing...</h4>
                  <p className="text-slate-500 text-sm max-w-sm">Gathering historical flow data, risk scoring matrices, and counterparty graphs for a comprehensive PDF report.</p>
                </div>
              )}
              {activeModal === 'similar-case' && (
                <div className="space-y-4">
                  <div className="bg-white border border-purple-200 rounded overflow-hidden">
                    <div className="bg-purple-50 px-4 py-2 font-bold text-purple-900 border-b border-purple-100 text-sm">CASE SUMMARY ARCHIVE</div>
                    <div className="p-4 space-y-3 text-sm text-slate-700">
                      <div><strong>Entity:</strong> Related Shell Corp</div>
                      <div><strong>Resolution:</strong> SAR Filed, Accounts Closed (Dec 2024)</div>
                      <div><strong>Key Typology:</strong> Trade-based laundering using over-invoicing and structured wire transfers to high-risk jurisdictions.</div>
                      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
                        <div className="font-semibold text-slate-900 mb-1">Analyst Notes from Archive:</div>
                        "The pattern matches the new alert perfectly. Suggest immediate escalation and freezing of assets to prevent capital flight."
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
               <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-700 border border-slate-300 rounded font-bold text-sm hover:bg-slate-50">Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


