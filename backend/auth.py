import os
import traceback
from bson import ObjectId
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from dotenv import load_dotenv

load_dotenv()


# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "nearlly_db")

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

security = HTTPBearer()

# get user via tokens-----
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    try:

        token = credentials.credentials

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload["user_id"]

        user = await db.users.find_one(
            {
                "_id": ObjectId(user_id)
            }
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except Exception as e:
        traceback.print_exc()
        raise

# Admin Middleware---------*-------------------
async def get_admin_user(
    current_user=Depends(
        get_current_user
    )
):

    if (
        current_user.get("role")
        != "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def create_access_token(user):

    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "user"),
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_refresh_token(user):

    payload = {
        "user_id": str(user["_id"]),
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        REFRESH_SECRET_KEY,
        algorithm=ALGORITHM
    )


async def refresh_access_token(body, db):

    try:

        payload = jwt.decode(
            body.refresh_token,
            REFRESH_SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload["user_id"]

        user = await db.users.find_one(
            {
                "_id": ObjectId(user_id)
            }
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        if (
            user.get("refreshToken")
            != body.refresh_token
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        new_access_token = (
            create_access_token(user)
        )

        return {
            "access_token":
                new_access_token
        }

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Refresh token expired"
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )
