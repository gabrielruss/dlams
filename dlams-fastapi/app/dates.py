from datetime import date


def date_to_month_day_year(value: date) -> str:
    return f"{value:%m-%d-%Y}"
