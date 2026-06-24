import os
import uuid
import boto3
from botocore.client import Config

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")

try:
    s3 = boto3.client(
        service_name="s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )
except Exception as e:
    print(f"⚠️  Cloudflare R2 client init failed: {e}")
    s3 = None

def upload_file(file, folder="business"):
    if s3 is None:
        raise RuntimeError("Cloudflare R2 storage is not configured. Check R2 environment variables.")

    extension = file.filename.split(".")[-1]

    filename = f"{folder}/{uuid.uuid4()}.{extension}"

    s3.upload_fileobj(
        file.file,
        R2_BUCKET_NAME,
        filename,
        ExtraArgs={
            "ContentType": file.content_type
        }
    )

    return f"{R2_PUBLIC_URL}/{filename}"