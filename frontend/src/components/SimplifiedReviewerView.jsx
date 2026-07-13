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
                      <div className="text-xs text-slate-500 font-bold uppercase mb-2">Customer</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedCase?.customer}</div>
                      <div className="text-xs text-slate-600">{mockCustomer.businessType} - {mockCustomer.industry}</div>
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
