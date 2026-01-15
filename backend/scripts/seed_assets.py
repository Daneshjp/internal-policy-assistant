"""Seed script to create sample assets."""
import sys
from pathlib import Path
from datetime import datetime, timedelta
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.asset import Asset, AssetType, AssetCriticality, AssetStatus

def create_assets():
    db = SessionLocal()
    try:
        # Check if assets already exist
        existing = db.query(Asset).first()
        if existing:
            print("Assets already exist!")
            return

        assets_data = [
            {
                "name": "Crude Oil Storage Tank T-101",
                "asset_code": "TK-101",
                "asset_type": AssetType.tank,
                "criticality": AssetCriticality.critical,
                "status": AssetStatus.active,
                "location": "Abu Dhabi Refinery - Tank Farm A",
                "description": "Primary crude oil storage tank with 50,000 barrel capacity",
                "manufacturer": "ABC Engineering",
                "model": "CST-50K",
                "serial_number": "TK-2019-101",
                "installation_date": datetime(2019, 3, 15),
            },
            {
                "name": "Distillation Column C-201",
                "asset_code": "COL-201",
                "asset_type": AssetType.pressure_vessel,
                "criticality": AssetCriticality.critical,
                "status": AssetStatus.active,
                "location": "Abu Dhabi Refinery - Processing Unit 2",
                "description": "Main atmospheric distillation column",
                "manufacturer": "Process Equipment Ltd",
                "model": "ADC-200",
                "serial_number": "COL-2018-201",
                "installation_date": datetime(2018, 6, 20),
            },
            {
                "name": "Heat Exchanger HX-301",
                "asset_code": "HX-301",
                "asset_type": AssetType.heat_exchanger,
                "criticality": AssetCriticality.high,
                "status": AssetStatus.active,
                "location": "Ruwais Refinery Complex - Unit 3",
                "description": "Shell and tube heat exchanger for crude preheating",
                "manufacturer": "Thermal Systems Inc",
                "model": "STX-150",
                "serial_number": "HX-2020-301",
                "installation_date": datetime(2020, 1, 10),
            },
            {
                "name": "Transfer Pump P-401",
                "asset_code": "PMP-401",
                "asset_type": AssetType.pump,
                "criticality": AssetCriticality.medium,
                "status": AssetStatus.active,
                "location": "Habshan Gas Processing - Pump Station 4",
                "description": "Centrifugal pump for gas condensate transfer",
                "manufacturer": "FlowTech",
                "model": "CP-500",
                "serial_number": "PMP-2021-401",
                "installation_date": datetime(2021, 4, 5),
            },
            {
                "name": "Main Pipeline Section A",
                "asset_code": "PIPE-A-001",
                "asset_type": AssetType.pipeline,
                "criticality": AssetCriticality.high,
                "status": AssetStatus.active,
                "location": "Jebel Dhanna Terminal - Main Line",
                "description": "24-inch crude oil export pipeline, 5km section",
                "manufacturer": "Pipeline Solutions",
                "model": "CS-24-SCH40",
                "serial_number": "PIPE-2017-A001",
                "installation_date": datetime(2017, 9, 12),
            },
            {
                "name": "Compressor Unit K-501",
                "asset_code": "COMP-501",
                "asset_type": AssetType.compressor,
                "criticality": AssetCriticality.critical,
                "status": AssetStatus.active,
                "location": "Das Island Facilities - Compression Station",
                "description": "Gas compression unit for export operations",
                "manufacturer": "CompressCo",
                "model": "GC-1000",
                "serial_number": "COMP-2019-501",
                "installation_date": datetime(2019, 11, 8),
            },
            {
                "name": "Safety Valve Bank SV-601",
                "asset_code": "SV-601",
                "asset_type": AssetType.valve,
                "criticality": AssetCriticality.critical,
                "status": AssetStatus.active,
                "location": "Fujairah Refinery - Safety Systems",
                "description": "Emergency pressure relief valve system",
                "manufacturer": "SafeValve Corp",
                "model": "PRV-200",
                "serial_number": "SV-2022-601",
                "installation_date": datetime(2022, 2, 14),
            },
            {
                "name": "Offshore Platform Structure",
                "asset_code": "PLAT-701",
                "asset_type": AssetType.other,
                "criticality": AssetCriticality.critical,
                "status": AssetStatus.active,
                "location": "Al Yasat Offshore Platform",
                "description": "Main production platform structure",
                "manufacturer": "Offshore Engineering Ltd",
                "model": "FIXED-PLAT-A",
                "serial_number": "PLAT-2015-701",
                "installation_date": datetime(2015, 7, 20),
            },
        ]

        print("Creating sample assets...")
        for asset_data in assets_data:
            asset = Asset(**asset_data)
            db.add(asset)
            print(f"  ✅ Created: {asset_data['asset_code']} - {asset_data['name']}")

        db.commit()
        print(f"\n✅ Success! Created {len(assets_data)} sample assets.")
        print("\nRefresh the frontend to see the assets!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_assets()
