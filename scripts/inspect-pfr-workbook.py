import json
import sys
from pathlib import Path

import pandas as pd
import xlrd


def normalize(value):
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def inspect(path_text: str):
    path = Path(path_text)
    if path.read_bytes()[:128].lstrip().lower().startswith(b"<html"):
        tables = pd.read_html(path)
        return {
            "file": path.name,
            "format": "html-xls-export",
            "tables": [
                {
                    "rows": len(table.index),
                    "columns": [str(column) for column in table.columns],
                    "sample": table.head(25).where(table.notna(), None).values.tolist(),
                }
                for table in tables
            ],
        }
    book = xlrd.open_workbook(path)
    sheets = []
    for sheet in book.sheets():
        rows = []
        for row_index in range(min(sheet.nrows, 30)):
            values = [normalize(sheet.cell_value(row_index, column_index)) for column_index in range(sheet.ncols)]
            rows.append(values)
        sheets.append({
            "name": sheet.name,
            "rows": sheet.nrows,
            "columns": sheet.ncols,
            "sample": rows,
        })
    return {"file": path.name, "format": "biff-xls", "sheets": sheets}


if __name__ == "__main__":
    print(json.dumps([inspect(argument) for argument in sys.argv[1:]], ensure_ascii=False, indent=2))
