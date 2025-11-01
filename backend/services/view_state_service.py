import sqlite3
import os

# Base directory for backend (project root)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DB_PATH = os.path.join(BASE_DIR, 'data', 'view_states.db')


def get_db_connection():
    # Ensure directory exists
    data_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_view_state(view_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT state FROM view_states WHERE view_name = ?", (view_name,))
        row = cursor.fetchone()
        if row:
            return row['state']
        return None
    finally:
        conn.close()


def set_view_state(view_name: str, state: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Ensure table exists
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS view_states (
            view_name TEXT PRIMARY KEY,
            state TEXT NOT NULL
        )
        ''')
        cursor.execute(
            "INSERT OR REPLACE INTO view_states (view_name, state) VALUES (?, ?)", (view_name, state)
        )
        conn.commit()
    finally:
        conn.close()


def update_view_state(view_name: str, state: str):
    # Keep backwards-compatible name
    set_view_state(view_name, state)