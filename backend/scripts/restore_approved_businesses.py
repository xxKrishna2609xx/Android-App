"""
Migration script: Re-inserts all APPROVED applications into the businesses collection.
Run this whenever the businesses collection gets wiped but applications are still intact.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DATABASE_NAME", "nearlly_db")]

async def migrate():
    # Find all APPROVED applications
    approved = await db.applications.find({"status": "APPROVED"}).to_list(1000)
    print(f"Found {len(approved)} APPROVED applications")

    inserted = 0
    skipped = 0

    for app in approved:
        biz_name = app.get("businessName", "")
        # Check if business already exists (by name + email to avoid duplicates)
        existing = await db.businesses.find_one({
            "businessName": biz_name,
            "email": app.get("email", "")
        })
        if existing:
            print(f"  SKIP (already exists): {biz_name}")
            skipped += 1
            continue

        # Re-insert as approved business
        await db.businesses.insert_one({
            "businessName": biz_name,
            "ownerName": app.get("ownerName", ""),
            "email": app.get("email", ""),
            "phone": app.get("phone", ""),
            "categoryId": app.get("categoryId", ""),
            "subcategoryId": app.get("subcategoryId", ""),
            "categoryName": app.get("categoryName", ""),
            "subcategoryName": app.get("subcategoryName", ""),
            "address": app.get("address", ""),
            "city": app.get("city", ""),
            "state": app.get("state", ""),
            "website": app.get("website", ""),
            "description": app.get("description", ""),
            "logoUrl": app.get("logoUrl", ""),
            "socialMediaLinks": app.get("socialMediaLinks", {}),
            "galleryImages": app.get("galleryImages", []),
            "services": app.get("services", []),
            "verified": False,
            "featured": False,
            "status": "APPROVED",
            "rating": 0,
            "reviewCount": 0,
            "createdAt": app.get("createdAt", datetime.utcnow().isoformat())
        })
        print(f"  INSERTED: {biz_name}")
        inserted += 1

    print(f"\nDone: {inserted} inserted, {skipped} skipped")
    client.close()

asyncio.run(migrate())
