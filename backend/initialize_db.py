from backend.services.view_state_service import SessionLocal, engine
from backend.models.view_state_models import Base, ViewState

# Create the database tables
Base.metadata.create_all(bind=engine)

def initialize_database():
    db = SessionLocal()
    try:
        # Check if the initial state already exists
        home_state = db.query(ViewState).filter(ViewState.key == 'home').first()
        if not home_state:
            # Insert initial state for home view
            initial_state = ViewState(key='home', value='initial')
            db.add(initial_state)
            db.commit()
            print("Initial state for 'home' view created.")
        else:
            print("Initial state for 'home' view already exists.")
    finally:
        db.close()

    print("Database 'view_states.db' initialized successfully.")

if __name__ == '__main__':
    initialize_database()