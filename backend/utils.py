import pandas as pd
import requests
from io import StringIO


def load_csv_from_url(url: str) -> pd.DataFrame:
    response = requests.get(url)
    response.raise_for_status()
    csv_text = response.text
    return pd.read_csv(StringIO(csv_text))
