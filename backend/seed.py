import database
import models
from sqlalchemy.orm import Session
from sqlalchemy import text

def seed_database_if_empty(db: Session):
    print("Dropping and recreating database tables...")
    try:
        db.execute(text("DROP TABLE IF EXISTS evidences CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS transactions CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS alerts CASCADE;"))
        db.commit()
    except Exception as e:
        print(f"Warning on raw drop: {e}")
        db.rollback()
        
    models.Base.metadata.drop_all(bind=database.engine)
    models.Base.metadata.create_all(bind=database.engine)

    import services
    
    # We will simulate an incoming alert so it generates the rich CaseRecord
    raw_alerts = [
        {"customer": "Global Impex", "type": "Sanctions Velocity", "amount": 2500000},
        {"customer": "Local Bakery", "type": "Safe Velocity", "amount": 500}
    ]
    
    for raw in raw_alerts:
        gate_result = services.run_qualification_gate(raw["customer"], raw["type"], raw["amount"])
        
        alert_id = f"ALT-{raw['customer'][:3].upper()}1"
        new_alert = models.Alert(
            id=alert_id,
            customer=raw["customer"],
            type=raw["type"],
            risk=gate_result["risk"],
            systemStatus=gate_result["status"],
            reason=gate_result["reason"],
            similarCases=1 if gate_result["status"] == "Qualified" else 0
        )
        db.add(new_alert)
        
        if gate_result["status"] == "Qualified":
            case_id = f"CASE-{alert_id}"
            evidence_data = services.build_evidence_pack(raw["customer"], raw["type"], raw["amount"])
            
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
                hallucination_checks=evidence_data["hallucination_checks"]
            )
            db.add(new_case)
            
    db.commit()
    print("Database schema successfully generated and seeded!")

if __name__ == "__main__":
    db = database.SessionLocal()
    seed_database_if_empty(db)
    db.close()
