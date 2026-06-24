from pymongo import ASCENDING


async def create_indexes(db):
    try:
        print("Creating MongoDB indexes...")

        # Businesses
        await db.businesses.create_index([("businessName", ASCENDING)])

        await db.businesses.create_index([("status", ASCENDING)])

        await db.businesses.create_index([("city", ASCENDING)])

        await db.businesses.create_index([("categoryId", ASCENDING)])

        await db.businesses.create_index([("subcategoryId", ASCENDING)])

        await db.businesses.create_index([("status", ASCENDING),("city", ASCENDING),("categoryId", ASCENDING)])

        # Reviews
        await db.reviews.create_index([("businessId", ASCENDING)])

        await db.reviews.create_index([("userId", ASCENDING)])

        # Leads
        await db.leads.create_index([("userId", ASCENDING)])
        await db.leads.create_index([("businessId", ASCENDING)])

        await db.leads.create_index([("email", ASCENDING)])

        # Bookmarks
        await db.bookmarks.create_index([("userId", ASCENDING)])

        await db.bookmarks.create_index([("businessId", ASCENDING)])

        # Applications
        await db.applications.create_index([("userId", ASCENDING)])
        await db.applications.create_index([("email", ASCENDING)])

        await db.applications.create_index([("status", ASCENDING)])

        # Users
        await db.users.create_index([("email", ASCENDING)], unique=True)

        print("Indexes created successfully.")

    except Exception as e:
        print(f"❌ Index creation failed: {e}")