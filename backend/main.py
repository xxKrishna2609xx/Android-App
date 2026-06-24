from bson import ObjectId
import uvicorn
from fastapi import FastAPI, HTTPException, Depends,UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from datetime import datetime
from fastapi.security import HTTPBearer
from auth import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_admin_user,
    refresh_access_token
)
from indexes import create_indexes

from utils.cloudflare_r2 import upload_file


load_dotenv()

app = FastAPI(title="Business Listing API")

# Setup CORS
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "nearlly_db")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = "HS256"
security = HTTPBearer()

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


@app.on_event("startup")
async def startup_db_client():
    
    await create_indexes(db) # indexing--------

    print("Connected to MongoDB database!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Helper for MongoDB serializing (converting ObjectId to string if any, though our mockData has string ids)
def serializeList(items) -> list:
    return [serializeDict(item) for item in items]

def serializeDict(item):
    item["_id"] = str(item["_id"])
    # Always expose a guaranteed 'id' field so frontend cat.id / sub.id always works
    if "id" not in item or not item["id"]:
        item["id"] = item["_id"]
    return item


class LeadCreate(BaseModel):
    businessId: str
    businessName: str
    customerName: str
    phone: str
    email: str = ""
    serviceRequired: str = ""
    message: str = ""

class ReviewCreate(BaseModel):
    businessId: str
    rating: float
    comment: str

class UserRegister(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UpdateProfile(BaseModel):
    name: str
    phone: str

class BookmarkCreate(BaseModel):
    userId: str
    businessId: str

class RejectApplicationRequest(BaseModel):
    reason: str

class BusinessApplication(BaseModel):
    ownerName: str
    email: str
    phone: str

    businessName: str

    categoryId: str
    subcategoryId: str

    categoryName: str
    subcategoryName: str

    address: str
    city: str
    state: str

    website: str = ""
    description: str = ""

    logoUrl: str = ""

    socialMediaLinks: dict = {}

    galleryImages: list = []

    services: list = []

class CategoryCreate(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    color: str

class SubcategoryCreate(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    categoryId: str

class CategoryUpdate(BaseModel):
    name: str
    color: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str



@app.get("/api/categories")
async def get_categories():
    categories = await db.categories.find().to_list(1000)
    return serializeList(categories)

@app.get("/api/subcategories")
async def get_subcategories():
    subcategories = await db.subcategories.find().to_list(1000)
    return serializeList(subcategories)

@app.get("/api/businesses")
async def get_businesses():
    # Only return APPROVED businesses publicly; seed data may not have status field so include those too
    businesses = await db.businesses.find(
        {"$or": [{"status": "APPROVED"}, {"status": {"$exists": False}}]}
    ).to_list(1000)
    return serializeList(businesses)

@app.get("/api/businesses/featured")
async def get_featured_businesses():
    businesses = await db.businesses.find({"featured": True}).to_list(1000)
    return serializeList(businesses)

@app.get("/api/businesses/{id}")
async def get_business(id: str):
    try:
        business = await db.businesses.find_one(
            {"_id": ObjectId(id)}
        )
    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid business id"
        )

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    return serializeDict(business)

@app.put("/api/business/{business_id}")
async def update_business(
    business_id: str,
    data: dict,
    current_user=Depends(get_current_user)
):
    try:
        business = await db.businesses.find_one(
            {"_id": ObjectId(business_id)}
        )
    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid business id"
        )

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    if business["email"] != current_user["email"]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    data["updatedAt"] = datetime.utcnow().isoformat()

    await db.businesses.update_one(
        {"_id": ObjectId(business_id)},
        {
            "$set": data
        }
    )

    return {
        "message": "Business updated successfully"
    }

@app.get("/api/my-businesses")
async def get_my_businesses(current_user=Depends(get_current_user)):

    businesses = await db.businesses.find(
        {
            "email": current_user["email"]
        }
    ).sort("createdAt", -1).to_list(None)

    return [serializeDict(b) for b in businesses]

@app.get("/api/search")
async def search_businesses(
    query: str = "",
    city: str = "",
    pincode: str = "",
    categoryId: str = "",
    subcategoryId: str = "",
    brand: str = "",
    page: int = 1,
    limit: int = 6
):
    # filter_query = {}
  
    filter_query = {"status": "APPROVED"}

    if query:

        filter_query["$or"] = [
            {
                "businessName": {
                    "$regex": query,
                    "$options": "i"
                }
            },
            {
                "description": {
                    "$regex": query,
                    "$options": "i"
                }
            },
            {
                "categoryName": {
                    "$regex": query,
                    "$options": "i"
                }
            },
            {
                "subcategoryName": {
                    "$regex": query,
                    "$options": "i"
                }
            },
            {
                "city": {
                    "$regex": query,
                    "$options": "i"
                }
            },
            {
                "state": {
                    "$regex": query,
                    "$options": "i"
                }
            }
        ]

    if city:

        filter_query["city"] = {
            "$regex": city,
            "$options": "i"
        }

    if categoryId:

        filter_query["categoryId"] = categoryId


    if subcategoryId:
        filter_query["subcategoryId"] = subcategoryId

    if brand:

        filter_query["brands"] = brand
    skip = (page - 1) * limit
    
    total = await db.businesses.count_documents(filter_query)

    businesses = await db.businesses.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    return {
        "data": serializeList(businesses),
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": (total + limit - 1) // limit
    }


@app.post("/api/leads")
async def create_lead(
    lead: LeadCreate,
    current_user=Depends(
        get_current_user
    )
):

    lead_data = {
        **lead.dict(),
        "customerName":
            current_user["name"],
        "email":
            current_user["email"],
        "createdAt":
            datetime.utcnow().isoformat()
    }

    result = await db.leads.insert_one(
        lead_data
    )

    return {
        "success": True,
        "leadId":
            str(result.inserted_id)
    }

@app.get("/api/leads")
async def get_leads():
    leads = await db.leads.find().to_list(1000)
    return serializeList(leads)

@app.get("/api/leads/user/{email}")
async def get_user_leads(email: str):

    leads = await db.leads.find(
        {"email": email}
    ).to_list(1000)

    return serializeList(leads)

@app.delete("/api/leads/{id}")
async def delete_lead(id: str):

    await db.leads.delete_one(
        {"_id": ObjectId(id)}
    )

    return {
        "success": True
    }
# Rating calculate---*-----*-------
def calculate_rating(reviews):

    review_count = len(reviews)

    if review_count == 0:
        return 0, 0

    rating_avg = round(
        sum(
            r["rating"]
            for r in reviews
        ) / review_count,
        1
    )

    return (
        rating_avg,
        review_count
    )

async def update_business_rating(business_id: str):

    reviews = await db.reviews.find({
        "businessId": business_id
    }).to_list(1000)

    rating_avg, review_count = (
        calculate_rating(reviews)
    )

    query_filter = {}
    try:
        query_filter = {"_id": ObjectId(business_id)}
    except Exception:
        query_filter = {"_id": business_id}

    await db.businesses.update_one(
        query_filter,
        {
            "$set": {
                "rating": rating_avg,
                "reviewCount": review_count
            }
        }
    )


@app.post("/api/reviews")
async def create_review(
    review: ReviewCreate,
    current_user=Depends(
        get_current_user
    )
):
    existing_review = await db.reviews.find_one({
        "businessId": review.businessId,
        "userId": str(current_user["_id"])
    })
    if existing_review:
        await db.reviews.update_one(
            {"_id": existing_review["_id"]},
            {
                "$set": {
                    "rating": review.rating,
                    "comment": review.comment,
                    "updatedAt": datetime.utcnow().isoformat()
                }
            }
        )

        await update_business_rating(review.businessId)

        return {
            "success": True,
            "message": "Review updated successfully"
        }
    result = await db.reviews.insert_one({

        **review.dict(),

        "userId":
            str(current_user["_id"]),

        "createdAt":
            datetime.utcnow().isoformat()
    })

    await update_business_rating(review.businessId)

    return {
        "success": True,
        "reviewId": str(result.inserted_id),
        "message": "Review submitted successfully"
    }



@app.get("/api/reviews/{business_id}")
async def get_reviews(business_id: str):

    reviews = await db.reviews.find({
        "businessId": business_id
    }).to_list(1000)

    user_ids = [
        ObjectId(r["userId"])
        for r in reviews
        if r.get("userId")
    ]

    users = await db.users.find(
        {"_id": {"$in": user_ids}},
        {"name": 1}
    ).to_list(None)

    user_map = {
        str(user["_id"]): user["name"]
        for user in users
    }

    for review in reviews:
        review["customerName"] = user_map.get(
            review["userId"],
            "Unknown User"
        )

    return serializeList(reviews)

@app.post("/api/auth/register")
async def register(user: UserRegister):

    existing = await db.users.find_one(
        {"email": user.email}
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    result = await db.users.insert_one({
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": hashed_password,
        "role": "user",
        "createdAt": datetime.utcnow().isoformat()
    })

    return {
        "success": True,
        "userId": str(result.inserted_id)
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):

    db_user = await db.users.find_one(
        {"email": user.email}
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not pwd_context.verify(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        db_user
    )

    refresh_token = create_refresh_token(
        db_user
    )
    await db.users.update_one(
        {"_id": db_user["_id"]},
        {
            "$set": {
                "refreshToken":
                    refresh_token
            }
        }
    )

    return {
        "access_token":access_token,
        "refresh_token":refresh_token,
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"],
            "phone": db_user.get("phone", ""),
            "role": db_user.get("role", "user"),
            "createdAt": db_user.get("createdAt")
        }
    }

@app.put("/api/users/{user_id}")
async def update_profile(
    user_id: str,
    profile: UpdateProfile
):

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "name": profile.name,
                "phone": profile.phone
            }
        }
    )

    updated_user = await db.users.find_one(
        {"_id": ObjectId(user_id)}
    )

    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "phone": updated_user.get("phone", "")
    }


@app.post("/api/bookmarks")
async def add_bookmark(
    bookmark: BookmarkCreate,
    current_user=Depends(
        get_current_user
    )
):

    existing = await db.bookmarks.find_one({
        "userId":
            str(current_user["_id"]),
        "businessId":
            bookmark.businessId
    })

    if existing:
        return {"success": True}

    await db.bookmarks.insert_one({
        "userId":
            str(current_user["_id"]),
        "businessId":
            bookmark.businessId
    })

    return {"success": True}


@app.get("/api/bookmarks/{user_id}")
async def get_bookmarks(user_id: str):

    bookmarks = await db.bookmarks.find({
        "userId": user_id
    }).to_list(1000)

    return serializeList(bookmarks)

@app.delete("/api/bookmarks/{user_id}/{business_id}")
async def remove_bookmark(
    user_id: str,
    business_id: str
):

    await db.bookmarks.delete_one({
        "userId": user_id,
        "businessId": business_id
    })

    return {"success": True}


@app.post("/api/business/apply")
async def apply_business(
    application: BusinessApplication,
    current_user=Depends(get_current_user)
):

    result = await db.applications.insert_one({
        **application.dict(),

        "userId":
            str(current_user["_id"]),

        "ownerName":
            current_user["name"],

        "ownerEmail":
            current_user["email"],

        "status":
            "PENDING",

        "createdAt":
            datetime.utcnow().isoformat()
    })

    return {
        "success": True,
        "applicationId":
            str(result.inserted_id)
    }


@app.get("/api/admin/applications")
async def get_applications(
    admin=Depends(
        get_admin_user
    )
):
    applications = await db.applications.find().to_list(1000)

    return serializeList(applications)


@app.get("/api/applications/user/{email}")
async def get_user_applications(email: str):

    applications = await db.applications.find({
        "email": email,
        "status": {
            "$in": ["PENDING", "REJECTED"]
        }
    }).to_list(1000)

    return serializeList(applications)

@app.put("/api/admin/applications/{id}/approve")
async def approve_application(
    id: str,
    admin=Depends(
        get_admin_user
    )
):

    application = await db.applications.find_one(
        {"_id": ObjectId(id)}
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    await db.businesses.insert_one({

        "id": f"biz-{str(ObjectId())[:8]}",

        "businessName":
            application["businessName"],

        "ownerName":
            application["ownerName"],

        "email":
            application["email"],

        "phone":
            application["phone"],

        "categoryId":
            application["categoryId"],

        "subcategoryId":
            application["subcategoryId"],

        "categoryName":
            application["categoryName"],

        "subcategoryName":
            application["subcategoryName"],

        "address":
            application["address"],

        "city":
            application["city"],

        "state":
            application["state"],

        "website":
            application.get("website", ""),

        "description":
            application.get("description", ""),

        "logoUrl":
            application.get("logoUrl", ""),

        "socialMediaLinks":
            application.get(
                "socialMediaLinks",
                {}
            ),

        "galleryImages":
            application.get(
                "galleryImages",
                []
            ),

        "services":
            application.get(
                "services",
                []
            ),

        "verified": False, 
        "featured": False,

        "status": "APPROVED",

        "rating": 0,
        "reviewCount": 0,

        "createdAt":
            datetime.utcnow().isoformat()
    })

    await db.applications.delete_one(
        {"_id": ObjectId(id)}
    )

    return {
        "success": True
    }


@app.put("/api/admin/applications/{id}/reject")
async def reject_application(
    id: str,
    payload: RejectApplicationRequest,
    admin=Depends(
        get_admin_user
    )
):

    await db.applications.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "REJECTED",
                "rejectReason": payload.reason
            }
        }
    )
    return {
        "success": True
    }

@app.delete("/api/admin/applications/{id}")
async def delete_application(
    id: str,
    admin=Depends(get_admin_user)
):

    result = await db.applications.delete_one(
        {"_id": ObjectId(id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return {
        "success": True
    }

@app.post("/api/categories")
async def create_category(category: CategoryCreate):
    data = category.dict(exclude_none=True)
    result = await db.categories.insert_one(data)
    return {
        "success": True,
        "id": str(result.inserted_id)
    }

@app.delete("/api/categories/{id}")
async def delete_category(id: str):
    category = None
    try:
        category = await db.categories.find_one({"_id": ObjectId(id)})
    except Exception:
        pass
    if not category:
        category = await db.categories.find_one({"id": id})

    if category:
        cat_custom_id = category.get("id")
        cat_oid = str(category.get("_id"))
        
        # Delete the category
        await db.categories.delete_one({"_id": category["_id"]})
        
        # Cascade delete subcategories linked to this category (using either id format)
        query = []
        if cat_custom_id:
            query.append({"categoryId": cat_custom_id})
        if cat_oid:
            query.append({"categoryId": cat_oid})
            
        if query:
            await db.subcategories.delete_many({"$or": query})

    return {"success": True}

@app.post("/api/subcategories")
async def create_subcategory(
    subcategory: SubcategoryCreate
):
    data = subcategory.dict(exclude_none=True)
    result = await db.subcategories.insert_one(data)
    return {
        "success": True,
        "id": str(result.inserted_id)
    }

@app.delete("/api/subcategories/{id}")
async def delete_subcategory(id: str):
    result = await db.subcategories.delete_one({"id": id})
    if result.deleted_count == 0:
        try:
            await db.subcategories.delete_one({"_id": ObjectId(id)})
        except Exception:
            pass

    return {"success": True}

@app.put("/api/categories/{id}")
async def update_category(id: str, category: CategoryUpdate):
    update_data = {"$set": {"name": category.name, "color": category.color}}
    result = await db.categories.update_one({"id": id}, update_data)
    if result.matched_count == 0:
        try:
            await db.categories.update_one({"_id": ObjectId(id)}, update_data)
        except Exception:
            pass

    return {"success": True}


@app.delete("/api/admin/businesses/{id}")
async def delete_business(id: str,admin=Depends(get_admin_user)):
    await db.businesses.delete_one(
        {"_id": ObjectId(id)}
    )

    return {"success": True}

@app.put("/api/admin/businesses/{id}/verify")
async def toggle_verify(id: str,admin=Depends(get_admin_user)):

    business = await db.businesses.find_one(
        {"_id": ObjectId(id)}
    )

    await db.businesses.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "verified": not business.get(
                    "verified",
                    False
                )
            }
        }
    )

    return {"success": True}

@app.put("/api/admin/businesses/{id}/feature")
async def toggle_feature(id: str,admin=Depends(get_admin_user)):

    business = await db.businesses.find_one(
        {"_id": ObjectId(id)}
    )

    await db.businesses.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "featured": not business.get(
                    "featured",
                    False
                )
            }
        }
    )

    return {"success": True}

@app.get("/api/my-business-leads/{email}")
async def get_my_business_leads(
    email: str
):
    businesses = await db.businesses.find(
        {
            "email": email
        }
    ).to_list(1000)

    business_ids = []
    business_names = []
    for b in businesses:
        if "id" in b and b["id"]:
            business_ids.append(b["id"])
        business_ids.append(str(b["_id"]))
        if "businessName" in b and b["businessName"]:
            business_names.append(b["businessName"])

    leads = await db.leads.find(
        {
            "$or": [
                {"businessId": {"$in": business_ids}},
                {"businessName": {"$in": business_names}}
            ]
        }
    ).to_list(1000)

    return serializeList(leads)

@app.post("/api/auth/refresh")
async def refresh_token(
    body: RefreshTokenRequest
):
    return await refresh_access_token(
        body,
        db
    )


@app.get("/api/me")
async def get_me(
    current_user=Depends(
        get_current_user
    )
):

    return {
        "id":
            str(current_user["_id"]),
        "email":
            current_user["email"],
        "role":
            current_user.get(
                "role",
                "user"
            )
    }



@app.get("/api/banners")
async def list_banners():
    cursor = db.banners.find({})
    docs = await cursor.to_list(length=100)
    return [serializeDict(d) for d in docs]


@app.get("/api/quick-services")
async def list_quick_services():
    cursor = db.quick_services.find({})
    docs = await cursor.to_list(length=100)
    return [serializeDict(d) for d in docs]


@app.get("/api/public-stats")
async def get_public_stats():
    listings_count = await db.businesses.count_documents({"status": "APPROVED"})
    verified_count = await db.businesses.count_documents({"status": "APPROVED", "verified": True})
    categories_count = await db.categories.count_documents({})
    
    # Calculate average rating
    pipeline = [
        {"$match": {"status": "APPROVED", "rating": {"$exists": True}}},
        {"$group": {"_id": None, "avgRating": {"$avg": "$rating"}}}
    ]
    cursor = db.businesses.aggregate(pipeline)
    avg_rating_doc = await cursor.to_list(length=1)
    
    if avg_rating_doc and avg_rating_doc[0].get("avgRating") is not None:
        avg_rating = round(avg_rating_doc[0]["avgRating"], 1)
    else:
        avg_rating = 4.8  # Fallback standard rating
        
    return {
        "listingsCount": listings_count,
        "verifiedCount": f"{verified_count} +",
        "categoriesCount": f"{categories_count} +",
        "avgRating": f"{avg_rating}★",
        "monthlyUsers": "10K+",  # Static estimate
    }


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    # start = time.time()
    if not file.content_type.startswith("image/"):
        return {
            "success": False,
            "message": "Only image files are allowed."
        }

    url = upload_file(file)
    # print(f"Upload Time: {time.time() - start:.3f} sec")

    return {
        "success": True,
        "url": url
    }


if __name__ == "__main__":
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
