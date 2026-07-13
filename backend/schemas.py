from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class AlertIngestRequest(BaseModel):
    customer: str
    type: str
    amount: float

class AlertResponse(BaseModel):
    id: str
    customer: str
    type: str
    risk: str
    systemStatus: str
    reason: Optional[str] = None
    similarCases: int = 0
    workflowStatus: Optional[str] = None

class GovernanceAction(BaseModel):
    case_id: str
    action: str
    role: str
    notes: Optional[str] = None
