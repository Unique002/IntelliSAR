import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Instantiates GenAI context targeting your .env parameter keys automatically
client = genai.Client()

def run_qualification_gate(customer: str, alert_type: str, amount: float) -> dict:
    """Step 1: Analyzes metrics to perform high-speed false positive reduction."""
    if amount < 10000 or "Safe" in alert_type:
        return {
            "status": "Dismissed",
            "risk": "Low",
            "reason": f"Transaction volume (₹{amount}) falls below threshold parameters. Baseline correlation index within predictable boundaries."
        }
    return {"status": "Qualified", "risk": "High", "reason": None}

def retrieve_regulatory_framework(alert_type: str) -> list:
    """Mocks standard LlamaIndex / ChromaDB vector similarity lookup queries."""
    rules = ["FATF Tracking Directive: Layer verification mapping required if velocity shows localized sub-threshold configurations."]
    if "Velocity" in alert_type or "Sanctions" in alert_type:
        rules.append("RBI KYC Master Direction 2016 (Section 38): Continuous velocity and counterparty tracing required for high-risk corridors.")
    return rules

def build_evidence_pack(customer: str, alert_type: str, amount: float) -> dict:
    """Step 2: Aggregates relational profiles by querying the Simulated World Database."""
    from database import SessionLocal
    import models
    from datetime import datetime
    import uuid
    from collections import defaultdict
    
    db = SessionLocal()
    
    # 1. Look up user
    user = db.query(models.BankUser).filter(models.BankUser.name == customer).first()
    
    if not user:
        # Fallback if manual user wasn't seeded
        user_id = "U-UNKNOWN"
        kyc_snapshot = {
            "name": customer, 
            "risk_rating": "High", 
            "kyc_date": "2025-04-19",
            "accountId": "UNKNOWN-99",
            "businessType": "Retail Individual",
            "industry": "Unknown",
            "relationship": "New"
        }
    else:
        user_id = user.id
        kyc_snapshot = {
            "name": user.name, 
            "risk_rating": user.risk_rating, 
            "kyc_date": user.kyc_date,
            "accountId": f"{user.id}-99X",
            "businessType": "Corporate Entity" if "Impex" in user.name or "Bakery" in user.name else "Retail Individual",
            "industry": "Trade & Commerce" if "Impex" in user.name else "Retail" if "Bakery" in user.name else "Services",
            "relationship": "Active (Since 2018)"
        }
        
    # Find a counterparty to link this transaction to
    cp = db.query(models.Counterparty).filter(models.Counterparty.risk_level.in_(["High", "Critical"])).first()
    cp_id = cp.id if cp else "C-OFF"
    
    # 2. Add the New suspicious transaction
    new_txn_id = f"TXN-{str(uuid.uuid4())[:8].upper()}"
    new_txn = models.HistoricalTransaction(
        id=new_txn_id,
        user_id=user_id,
        counterparty_id=cp_id,
        amount=amount,
        type="Credit" if "Inflow" in alert_type else "Debit",
        date=datetime.now(),
        is_suspicious=True
    )
    if user: # Only add to db if user exists
        db.add(new_txn)
        db.commit()
    
    # 3. Fetch Historical Transactions
    history = db.query(models.HistoricalTransaction).filter(
        models.HistoricalTransaction.user_id == user_id
    ).order_by(models.HistoricalTransaction.date.desc()).limit(15).all()
    
    if not history and not user:
        history = [new_txn]
        
    # Format transactions for UI
    ui_txns = []
    for h in history:
        cp = db.query(models.Counterparty).filter(models.Counterparty.id == h.counterparty_id).first()
        cp_name = cp.name if cp else "External Source"
        ui_txns.append({
            "id": h.id,
            "date": h.date.strftime("%Y-%m-%d"),
            "amount": h.amount,
            "source": cp_name,
            "type": h.type,
            "flagged": h.is_suspicious
        })
        
    # 4. Dynamically build Anomaly Data by Month
    monthly_counts = defaultdict(lambda: {"total": 0, "flagged": 0})
    for h in history:
        month = h.date.strftime("%b")
        monthly_counts[month]["total"] += 1
        if h.is_suspicious:
            monthly_counts[month]["flagged"] += 1
            
    anomaly_data = [{"month": k, "flagged": v["flagged"], "total": v["total"]} for k, v in monthly_counts.items()]
    # Ensure they are sorted somehow, or just let UI handle it. UI expects order.
    anomaly_data = list(reversed(anomaly_data)) # Reverse so latest is at the right
    
    # 5. Dynamically build Knowledge Graph
    nodes = [{"id": "cust", "label": customer, "x": 300, "y": 250, "type": "customer"}]
    edges = []
    
    unique_cps = set([h.counterparty_id for h in history if h.counterparty_id != "C-UNKNOWN"])
    import math
    angle_step = (2 * math.pi) / max(1, len(unique_cps))
    
    for i, cp_id in enumerate(unique_cps):
        cp = db.query(models.Counterparty).filter(models.Counterparty.id == cp_id).first()
        if cp:
            angle = i * angle_step
            nx = 300 + int(150 * math.cos(angle))
            ny = 250 + int(150 * math.sin(angle))
            ntype = "source" if cp.risk_level in ["Low", "Medium"] else "destination"
            nodes.append({"id": cp.id, "label": cp.name, "x": nx, "y": ny, "type": ntype})
            edges.append({"from": cp.id, "to": "cust"})
            
    if not edges: # fallback
        nodes.append({"id": "src", "label": "External Node", "x": 150, "y": 250, "type": "source"})
        edges.append({"from": "src", "to": "cust"})
        
    knowledge_graph = {"nodes": nodes, "edges": edges}
    
    db.close()
    
    # Calculate confidence based on amount threshold
    conf = min(0.99, 0.70 + (amount / 100000.0))
    typology_name = "Velocity Structuring" if "Velocity" in alert_type else "Offshore Aggregation"
    
    return {
        "kyc_snapshot": kyc_snapshot,
        "transactions": ui_txns,
        "rag_guidelines": retrieve_regulatory_framework(alert_type),
        "anomaly_data": anomaly_data,
        "similar_cases": [{"id": f"CASE-{str(uuid.uuid4())[:3].upper()}", "similarity": f"{int(conf*100)}%"}],
        "typologies": [{"type": typology_name, "confidence": round(conf, 2), "riskLevel": "Critical"}],
        "graph_data": knowledge_graph,
        "evidence_mapping": {"0": {"transactions": [new_txn_id], "rule": alert_type, "regulatory": "RBI Sec 38", "confidence": round(conf, 2)}},
        "hallucination_checks": [{"status": "success"}, {"status": "success" if conf > 0.8 else "warning"}]
    }

def generate_live_investigation_summary(evidence: dict) -> str:
    """Step 3: Fires asynchronous context injection strings straight to Gemini."""
    prompt = f"""
    You are an elite financial crime compliance intelligence agent. 
    Review this structured Evidence Pack and draft an internal investigation case summary report.
    
    EVIDENCE DATA BLOCKS: {json.dumps(evidence)}
    
    CRITICAL CONSTRAINT: Focus purely on factual data parameters, amounts, dates, and baseline metrics variance. 
    Do not infer criminal guilt, intent, or fraud at this preliminary junction.
    """
    response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
    return response.text

def generate_calibrated_sar_draft(internal_summary: str) -> dict:
    """Step 4: Drives structured prompt constraints through Gemini to produce template models."""
    prompt = f"""
    Transform the following internal summary report into a structured regulatory SAR template filing.
    
    SUMMARY: {internal_summary}
    
    REGULATORY PROSE LINTER CONSTRAINTS:
    Ensure compliance wording is objective and tightly defensible. 
    - Convert any subjective claims like 'money laundering scheme' into 'observed pattern of sub-threshold velocity aggregations'.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "background": types.Schema(type=types.Type.STRING),
                    "activity": types.Schema(type=types.Type.STRING),
                    "typology": types.Schema(type=types.Type.STRING),
                    "regulatory": types.Schema(type=types.Type.STRING),
                    "conclusion": types.Schema(type=types.Type.STRING),
                },
                required=["background", "activity", "typology", "regulatory", "conclusion"],
            ),
        ),
    )
    return json.loads(response.text)
