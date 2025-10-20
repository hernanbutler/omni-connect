import pandas as pd
import os
from pathlib import Path

# Usar rutas relativas desde la raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data"
USERS_FILE = DATA_PATH / "usuarios.csv"
CAMPAIGNS_FILE = DATA_PATH / "campanas_email.csv"
SOCIAL_POSTS_FILE = DATA_PATH / "posts_redes_sociales.csv"

def load_data():
    """Carga los dataframes desde los archivos CSV."""
    try:
        users_df = pd.read_csv(USERS_FILE, encoding='utf-8')
        campaigns_df = pd.read_csv(CAMPAIGNS_FILE, encoding='utf-8')
        social_df = pd.read_csv(SOCIAL_POSTS_FILE, encoding='utf-8')
        return users_df, campaigns_df, social_df
    except FileNotFoundError as e:
        print(f"Error: No se encontró el archivo {e.filename}")
        return None, None, None
    except Exception as e:
        print(f"Error al cargar datos: {str(e)}")
        return None, None, None