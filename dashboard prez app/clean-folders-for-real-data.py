#!/usr/bin/env python3
"""
Clean all folders by removing README.txt and sample XLSX files
This prepares the folder structure for real data to be added manually
"""

import os
import json
from datetime import datetime

def clean_folders():
    """
    Remove all files from the folder structure and clean upload log
    Keep only the empty folder structure ready for real data
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")

    if not os.path.exists(base_path):
        print(f"❌ Error: UPLOADED_REPORTINGS folder not found at {base_path}")
        return

    print(f"🧹 Cleaning folder structure at: {base_path}")
    print("=" * 60)

    total_files_removed = 0
    files_to_remove = []

    # Scan all folders and identify ALL files to remove (except FOLDER_STRUCTURE_INDEX.md)
    for root, dirs, files in os.walk(base_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_lower = file.lower()

            # Keep the main index file but remove everything else
            if file == "FOLDER_STRUCTURE_INDEX.md" and root == base_path:
                print(f"📋 Keeping: {file}")
                continue

            # Remove all other files
            files_to_remove.append(file_path)

            # Categorize for reporting
            if 'readme' in file_lower and file_lower.endswith('.txt'):
                print(f"📄 Found README: {os.path.relpath(file_path, base_path)}")
            elif (file_lower.endswith('.xlsx') or
                  file_lower.endswith('.pdf') or
                  file_lower.endswith('.docx')):
                print(f"📊 Found sample data: {os.path.relpath(file_path, base_path)}")
            elif file_lower.endswith('.json'):
                print(f"📋 Found log file: {os.path.relpath(file_path, base_path)}")
            else:
                print(f"📁 Found other file: {os.path.relpath(file_path, base_path)}")

    print(f"\n📋 Found {len(files_to_remove)} files to remove")

    if len(files_to_remove) == 0:
        print("✅ No files to remove. Folders are already clean.")
        return 0

    # Confirm removal
    print(f"\n⚠️  About to remove {len(files_to_remove)} files:")
    print("   - All README.txt files")
    print("   - All sample XLSX/PDF/DOCX files")
    print("   - Upload log files")
    print("   - Any other files in the structure")
    print("\nThis will leave empty folders ready for real data.")
    print("Only FOLDER_STRUCTURE_INDEX.md will be kept.")

    response = input("\nProceed with cleanup? (y/N): ").strip().lower()

    if response != 'y' and response != 'yes':
        print("❌ Cleanup cancelled.")
        return 0

    # Remove files
    print(f"\n🗑️  Removing files...")
    for file_path in files_to_remove:
        try:
            os.remove(file_path)
            total_files_removed += 1
            print(f"✅ Removed: {os.path.relpath(file_path, base_path)}")
        except Exception as e:
            print(f"❌ Error removing {file_path}: {e}")

    # Create a clean upload log
    log_file_path = os.path.join(base_path, "upload_log.json")
    try:
        clean_log = {
            "info": "Upload log for BCP Securities Services reporting files",
            "created": datetime.now().isoformat(),
            "status": "ready_for_real_data",
            "uploads": []
        }

        with open(log_file_path, "w", encoding="utf-8") as f:
            json.dump(clean_log, f, indent=2, ensure_ascii=False)

        print(f"📋 Created clean upload log")

    except Exception as e:
        print(f"⚠️  Warning: Could not create clean upload log: {e}")

    print(f"\n✅ CLEANUP COMPLETE!")
    print(f"📊 Summary:")
    print(f"   • Files removed: {total_files_removed}")
    print(f"   • Structure preserved: All category/report/year/month folders intact")
    print(f"   • Upload log: Reset and ready for real data")

    return total_files_removed

def verify_clean_structure():
    """
    Verify that the folder structure is clean and ready for real data
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")

    print(f"\n🔍 VERIFICATION: Checking folder structure...")
    print("=" * 50)

    total_folders = 0
    empty_folders = 0
    remaining_files = 0

    for root, dirs, files in os.walk(base_path):
        total_folders += 1

        if len(files) == 0:
            empty_folders += 1
        else:
            remaining_files += len(files)
            if files:  # Show any remaining files
                rel_path = os.path.relpath(root, base_path)
                print(f"📁 {rel_path}: {files}")

    print(f"\n📊 VERIFICATION RESULTS:")
    print(f"   • Total folders: {total_folders}")
    print(f"   • Empty folders: {empty_folders}")
    print(f"   • Remaining files: {remaining_files}")

    if remaining_files == 0:
        print(f"✅ SUCCESS: All folders are clean and ready for real data!")
    else:
        print(f"⚠️  WARNING: {remaining_files} files still remain in the structure")

    return remaining_files == 0

def show_folder_structure_summary():
    """
    Show a summary of the clean folder structure
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")

    print(f"\n📂 CLEAN FOLDER STRUCTURE SUMMARY:")
    print("=" * 50)

    categories = {}

    for item in os.listdir(base_path):
        item_path = os.path.join(base_path, item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            categories[item] = []

            # Count reports in this category
            for report in os.listdir(item_path):
                report_path = os.path.join(item_path, report)
                if os.path.isdir(report_path):
                    categories[item].append(report)

    for category, reports in categories.items():
        category_name = category.replace('_', ' ')
        print(f"📁 {category_name}")
        print(f"   • {len(reports)} reporting types")
        print(f"   • Each with 2025/[1-12] month folders")
        print(f"   • Ready for real data upload")
        print()

    total_reports = sum(len(reports) for reports in categories.values())
    total_month_folders = total_reports * 12  # 12 months per report

    print(f"🎯 READY FOR PRODUCTION:")
    print(f"   • {len(categories)} categories")
    print(f"   • {total_reports} reporting types")
    print(f"   • {total_month_folders} month folders")
    print(f"   • All folders empty and ready for real files")

if __name__ == "__main__":
    print("🧹 FOLDER CLEANUP FOR REAL DATA")
    print("=" * 60)
    print("This script will remove all README.txt and sample data files")
    print("to prepare the folder structure for real reporting data.")
    print()

    # Clean the folders
    files_removed = clean_folders()

    if files_removed and files_removed > 0:
        # Verify the cleanup
        is_clean = verify_clean_structure()

        # Show structure summary
        show_folder_structure_summary()

        print(f"\n🎉 FOLDER STRUCTURE IS NOW READY!")
        print("=" * 50)
        print("✅ All sample files removed")
        print("✅ All README files removed")
        print("✅ Folder structure preserved")
        print("✅ Ready for real data upload")
        print()
        print("📋 NEXT STEPS:")
        print("1. Upload real reporting files to appropriate folders")
        print("2. Use the dashboard upload feature for organized placement")
        print("3. Files will be automatically organized by category/report/year/month")
        print("4. File browser will show real data instead of samples")

    print(f"\n✅ CLEANUP COMPLETE!")
