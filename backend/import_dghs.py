
import csv
from pathlib import Path

from sqlalchemy.orm import Session

from database import SessionLocal
from models import HealthcareFacility


CSV_FILE = Path(__file__).parent / "dghs_facilities_utf8.csv"


def clean(value):
    if value is None:
        return None

    value = value.strip()
    return value if value else None


def import_facilities():

    if not CSV_FILE.exists():
        print("CSV file not found!")
        return

    db: Session = SessionLocal()

    imported = 0
    skipped = 0

    try:
        print("Starting DGHS facility import...")

        with open(
            CSV_FILE,
            mode="r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            required_columns = {
                "Id",
                "Name",
                "Name (Bangla)",
                "Code",
                "Email",
                "Agency",
                "Type",
                "District",
                "Upazila",
                "Paurasava",
                "Union"
            }

            if not required_columns.issubset(
                set(reader.fieldnames or [])
            ):
                raise ValueError(
                    "CSV file is missing required columns."
                )

            for row in reader:

                dghs_id = clean(row["Id"])
                facility_code = clean(row["Code"])
                name = clean(row["Name"])
                facility_type = clean(row["Type"])

                if (
                    not dghs_id
                    or not name
                    or not facility_type
                ):
                    skipped += 1
                    continue

                area_name = (
                    clean(row["Union"])
                    or clean(row["Paurasava"])
                    or clean(row["Upazila"])
                    or "Unknown"
                )

                facility = HealthcareFacility(
                    dghs_id=int(dghs_id),
                    facility_code=facility_code,
                    name=name,
                    name_bangla=clean(row["Name (Bangla)"]),
                    facility_type=facility_type,
                    agency=clean(row["Agency"]),
                    district=clean(row["District"]) or "Dhaka",
                    upazila=clean(row["Upazila"]) or "Savar",
                    area_name=area_name,
                    address=None,
                    contact_number=None,
                    email=clean(row["Email"]),
                    latitude=None,
                    longitude=None,
                    source_name="DGHS Facility Registry",
                    source_url=None,
                    is_verified=False
                )

                db.add(facility)
                imported += 1

                if imported % 25 == 0:
                    print(
                        f"Imported {imported} facilities..."
                    )

        db.commit()

        print("\nImport completed successfully!")
        print(f"Imported: {imported}")
        print(f"Skipped: {skipped}")

    except Exception as error:
        db.rollback()

        print("\nImport failed!")
        print("Error:", error)

    finally:
        db.close()


if __name__ == "__main__":
    import_facilities()
