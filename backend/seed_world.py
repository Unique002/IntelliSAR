import database
import models
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
import random
import uuid

def seed_world(db: Session):
    print("Seeding Simulated World (Fixed Users and Counterparties)...")
    
    # We must commit the drops before create_all
    db.commit()
    models.Base.metadata.create_all(bind=database.engine)
    
    # Check if seeded
    if db.query(models.BankUser).first():
        print("World already seeded. Recreating...")
        db.execute(text("DELETE FROM audit_logs;"))
        db.execute(text("DELETE FROM cases;"))
        db.execute(text("DELETE FROM alerts;"))
        db.execute(text("DELETE FROM historical_transactions;"))
        db.execute(text("DELETE FROM counterparties;"))
        db.execute(text("DELETE FROM bank_users;"))
        db.commit()
    
    # 1. Fixed Bank Users
    users = [
        models.BankUser(id="U-GLO", name="Global Impex", risk_rating="High", kyc_date="2024-01-15"),
        models.BankUser(id="U-LOC", name="Local Bakery", risk_rating="Low", kyc_date="2020-05-10"),
        models.BankUser(id="U-ALI", name="Alice Smith", risk_rating="Medium", kyc_date="2023-11-20")
    ]
    for u in users:
        db.add(u)
        
    # 2. Counterparties
    counterparties = [
        models.Counterparty(id="C-TGT", name="Target Stores", risk_level="Low"),
        models.Counterparty(id="C-OFF", name="Offshore Shell LLC", risk_level="Critical"),
        models.Counterparty(id="C-CRY", name="CryptoExchange XYZ", risk_level="High"),
        models.Counterparty(id="C-SUP", name="Wholesale Supplies Co", risk_level="Medium")
    ]
    for c in counterparties:
        db.add(c)
        
    db.commit()
    
    # 3. Generate normal baseline historical transactions (past 6 months)
    print("Generating baseline historical transactions...")
    now = datetime.now()
    
    def generate_txns(user_id, cp_id, count, amount_range, txn_type):
        for _ in range(count):
            days_ago = random.randint(1, 180)
            txn_date = now - timedelta(days=days_ago)
            amt = round(random.uniform(amount_range[0], amount_range[1]), 2)
            t = models.HistoricalTransaction(
                id=f"TXN-{str(uuid.uuid4())[:8].upper()}",
                user_id=user_id,
                counterparty_id=cp_id,
                amount=amt,
                type=txn_type,
                date=txn_date,
                is_suspicious=False
            )
            db.add(t)
            
    # Local Bakery (Normal business ops)
    generate_txns("U-LOC", "C-SUP", 20, (100.0, 800.0), "Debit")
    generate_txns("U-LOC", "C-TGT", 5, (50.0, 150.0), "Debit")
    
    # Alice Smith (Normal salary + retail)
    generate_txns("U-ALI", "C-TGT", 15, (40.0, 200.0), "Debit")
    
    # Global Impex (Mixed high volume, some offshore)
    generate_txns("U-GLO", "C-SUP", 10, (5000.0, 15000.0), "Debit")
    generate_txns("U-GLO", "C-OFF", 2, (1000.0, 4000.0), "Credit")
    
    db.commit()
    print("Simulated World Seeded Successfully.")

if __name__ == "__main__":
    db = database.SessionLocal()
    seed_world(db)
    db.close()
