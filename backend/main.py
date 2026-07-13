from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
import datetime

import models
import schemas
import services
from database import engine, get_db

# Auto-instantiate relational table structures into PostgreSQL on start
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Barclays Sentinel Core Infrastructure Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ingest", response_model=schemas.AlertResponse)
def ingest_raw_webhook_alert(alert: schemas.AlertIngestRequest, db: Session = Depends(get_db)):
    """Receives automated webhooks, runs Qual gate processing, writes DB states."""
    gate_result = services.run_qualification_gate(alert.customer, alert.type, alert.amount)
    
    alert_id = f"ALT-{str(uuid.uuid4())[:6].upper()}"
    new_alert = models.Alert(
        id=alert_id,
        customer=alert.customer,
        type=alert.type,
        risk=gate_result["risk"],
        systemStatus=gate_result["status"],
        reason=gate_result["reason"],
        similarCases=1 if gate_result["status"] == "Qualified" else 0
    )
    db.add(new_alert)
    
    if gate_result["status"] == "Qualified":
        case_id = f"CASE-{alert_id.split('-')[1]}"
        evidence_data = services.build_evidence_pack(alert.customer, alert.type, alert.amount)
        
        # Trigger Gemini AI generation sequentially
        internal_summary = services.generate_live_investigation_summary(evidence_data)
        sar_sections = services.generate_calibrated_sar_draft(internal_summary)
        
        new_case = models.CaseRecord(
            id=case_id,
            alert_id=alert_id,
            workflow_status="summary_ready",
            kyc_snapshot=evidence_data["kyc_snapshot"],
            transactions=evidence_data["transactions"],
            rag_guidelines=evidence_data["rag_guidelines"],
            anomaly_data=evidence_data["anomaly_data"],
            similar_cases=evidence_data["similar_cases"],
            typologies=evidence_data["typologies"],
            graph_data=evidence_data["graph_data"],
            evidence_mapping=evidence_data["evidence_mapping"],
            hallucination_checks=evidence_data["hallucination_checks"],
            internal_summary=internal_summary,
            sar_sections=sar_sections
        )
        db.add(new_case)
        
    db.commit()
    db.refresh(new_alert)
    return new_alert

@app.get("/api/dashboard", response_model=list[schemas.AlertResponse])
def get_dashboard_queue(db: Session = Depends(get_db)):
    """Queries and displays live intake stream array records."""
    alerts = db.query(models.Alert).all()
    results = []
    for alert in alerts:
        alert_dict = alert.__dict__.copy()
        if alert.systemStatus == "Qualified":
            case = db.query(models.CaseRecord).filter(models.CaseRecord.alert_id == alert.id).first()
            if case:
                alert_dict["workflowStatus"] = case.workflow_status
        results.append(alert_dict)
    return results

@app.get("/api/evidence/{case_id}")
def get_full_evidence_pack(case_id: str, db: Session = Depends(get_db)):
    """Retrieves full relational row objects with nested chart data maps."""
    case = db.query(models.CaseRecord).filter(
        (models.CaseRecord.id == case_id) | (models.CaseRecord.alert_id == case_id)
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Requested audit capsule not localized.")
    return case

@app.post("/api/pipeline/generate/{case_id}")
def run_autonomous_generation(case_id: str, db: Session = Depends(get_db)):
    """Triggers live Gemini inference loops over data rows and saves output structures."""
    case = db.query(models.CaseRecord).filter(models.CaseRecord.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Target case index not resolved.")
    
    evidence_payload = {
        "kyc_snapshot": case.kyc_snapshot,
        "locked_transactions": case.transactions,
        "rag_guidelines": case.rag_guidelines
    }
    
    # Fire live calls using the updated service definitions
    case.internal_summary = services.generate_live_investigation_summary(evidence_payload)
    case.sar_sections = services.generate_calibrated_sar_draft(case.internal_summary)
    
    db.commit()
    return {"status": "success", "sar_sections": case.sar_sections}

@app.post("/api/governance/signoff")
def commit_human_governance_action(req: schemas.GovernanceAction, db: Session = Depends(get_db)):
    """Handles multi-role state shifts and creates logging rows in the database."""
    case = db.query(models.CaseRecord).filter(
        (models.CaseRecord.id == req.case_id) | (models.CaseRecord.alert_id == req.case_id)
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Target case instance missing.")
        
    if req.action == "approve":
        case.workflow_status = "approved"
        case.approval_date = datetime.datetime.now()
    elif req.action == "submit_for_review":
        case.workflow_status = "under_review"
    elif req.action == "reject":
        case.workflow_status = "summary_ready"
        
    if req.notes:
        case.analyst_notes = req.notes
        
    log = models.AuditLog(case_id=req.case_id, action=req.action, role=req.role)
    db.add(log)
    db.commit()
    
    return {"status": "success", "new_state": case.workflow_status}
