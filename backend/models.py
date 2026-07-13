from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, index=True)
    customer = Column(String, nullable=False)
    type = Column(String, nullable=False)
    risk = Column(String, nullable=False)            # High, Medium, Low
    systemStatus = Column(String, nullable=False)    # Qualified, Dismissed
    reason = Column(String, nullable=True)          # Populated if auto-dismissed
    similarCases = Column(Integer, default=0)

class CaseRecord(Base):
    __tablename__ = "cases"
    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"))
    workflow_status = Column(String, default="summary_ready") # summary_ready, under_review, approved
    
    # Static Data Input Capsules
    kyc_snapshot = Column(JSON, nullable=False)
    transactions = Column(JSON, nullable=False)
    rag_guidelines = Column(JSON, nullable=False)
    
    # Rich UI Payload Maps (Preserved for Frontend Rendering)
    anomaly_data = Column(JSON, nullable=True)
    similar_cases = Column(JSON, nullable=True)
    typologies = Column(JSON, nullable=True)
    graph_data = Column(JSON, nullable=True)
    evidence_mapping = Column(JSON, nullable=True)
    hallucination_checks = Column(JSON, nullable=True)
    
    # AI Engine Generation Blocks
    internal_summary = Column(String, nullable=True)
    sar_sections = Column(JSON, nullable=True)
    analyst_notes = Column(String, nullable=True)
    approval_date = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String, nullable=False)
    action = Column(String, nullable=False)          # submit_for_review, approve, reject
    role = Column(String, nullable=False)            # analyst, reviewer, auditor
    timestamp = Column(DateTime, default=func.now())

class BankUser(Base):
    __tablename__ = "bank_users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    risk_rating = Column(String, default="Medium")
    kyc_date = Column(String, nullable=False)

class Counterparty(Base):
    __tablename__ = "counterparties"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    risk_level = Column(String, default="Low")

class HistoricalTransaction(Base):
    __tablename__ = "historical_transactions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("bank_users.id"), nullable=False)
    counterparty_id = Column(String, ForeignKey("counterparties.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # Credit, Debit
    date = Column(DateTime, default=func.now())
    is_suspicious = Column(Boolean, default=False)
