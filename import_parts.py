#!/usr/bin/env python3
"""Import parts from Excel files into the CRM database."""

import pandas as pd
import requests
import sys
from pathlib import Path
import time

# Configuration
API_URL = "https://gm-tc.tech/api/v1"
EXCEL_FILES = [
    "Atomic_Parts_List-FP24.R.xlsx",
    "Atomic_Parts_List-FP24.xlsx",
    "Atomic_Parts_List-FP242.xlsx",
]

def get_auth_token():
    """Get authentication token."""
    print("Logging in to API...")
    login_data = {
        "username": "admin@gm-tc.tech",
        "password": "GMTC-CRM-reJect78"
    }
    response = requests.post(
        f"{API_URL}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    response.raise_for_status()
    token = response.json()["access_token"]
    print("✓ Logged in successfully")
    return token


def create_part(token, part_data):
    """Create a part in the database."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{API_URL}/parts/",
        json=part_data,
        headers=headers
    )

    if response.status_code == 201:
        return True, response.json()
    elif response.status_code == 400 and "already exists" in response.text:
        return False, "duplicate"
    else:
        return False, f"Error {response.status_code}: {response.text}"


def import_from_excel(filepath, token):
    """Import parts from an Excel file."""
    print(f"\nProcessing: {Path(filepath).name}")
    print("-" * 80)

    # Read the Excel file
    df = pd.read_excel(filepath)

    # Track statistics
    stats = {"created": 0, "duplicates": 0, "errors": 0}

    for idx, row in df.iterrows():
        # Generate SKU from Item Number and file name
        item_number = str(row['Item Number']).strip()
        file_name = str(row['File Name (no extension)']).strip()
        author = str(row.get('Author', 'Unknown')).strip()
        quantity = int(row['Quantity'])

        # Create SKU (use Item Number + first part of filename)
        sku = f"{item_number}-{file_name[:20].replace(' ', '-')}"

        # Prepare part data
        part_data = {
            "sku": sku,
            "name": file_name,
            "description": f"Author: {author}",
            "category": "3D Printer Parts",
            "current_stock": quantity,
            "minimum_stock": max(1, quantity // 10),  # 10% of current as minimum
            "specifications": {
                "item_number": item_number,
                "author": author,
                "source_file": Path(filepath).name
            }
        }

        # Try to create the part
        success, result = create_part(token, part_data)

        if success:
            stats["created"] += 1
            print(f"✓ Created: {sku} - {file_name[:50]}")
        elif result == "duplicate":
            stats["duplicates"] += 1
            # print(f"  Duplicate: {sku}")
        else:
            stats["errors"] += 1
            print(f"✗ Error: {sku} - {result}")

        # Small delay to avoid overwhelming the API
        time.sleep(0.1)

    print(f"\nResults for {Path(filepath).name}:")
    print(f"  Created: {stats['created']}")
    print(f"  Duplicates: {stats['duplicates']}")
    print(f"  Errors: {stats['errors']}")
    print(f"  Total processed: {len(df)}")

    return stats


def main():
    """Main function to import all Excel files."""
    project_dir = Path("/home/gueee78/Coding/gm-tc")

    # Get authentication token
    try:
        token = get_auth_token()
    except Exception as e:
        print(f"Failed to authenticate: {e}")
        sys.exit(1)

    # Process all Excel files
    total_stats = {"created": 0, "duplicates": 0, "errors": 0}

    for filename in EXCEL_FILES:
        filepath = project_dir / filename
        if filepath.exists():
            try:
                stats = import_from_excel(str(filepath), token)
                total_stats["created"] += stats["created"]
                total_stats["duplicates"] += stats["duplicates"]
                total_stats["errors"] += stats["errors"]
            except Exception as e:
                print(f"Error processing {filename}: {e}")
        else:
            print(f"File not found: {filepath}")

    # Print summary
    print("\n" + "=" * 80)
    print("IMPORT SUMMARY")
    print("=" * 80)
    print(f"Total parts created: {total_stats['created']}")
    print(f"Total duplicates skipped: {total_stats['duplicates']}")
    print(f"Total errors: {total_stats['errors']}")
    print("=" * 80)


if __name__ == "__main__":
    main()
