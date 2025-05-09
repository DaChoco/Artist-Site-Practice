import boto3 as aws

import botocore.exceptions
from datetime import datetime
from botocore.client import Config
from mypy_boto3_s3 import S3Client
from urllib.parse import urlparse
import uuid
#Fall back in the event I cannot get google photos working

session = aws.Session()

s3: S3Client = session.client("s3",
                    config=Config(signature_version='s3v4'),
                    region_name="af-south-1",
                    endpoint_url="https://s3.af-south-1.amazonaws.com")

def uploadImage(image_file, domain: str, file_name):
    item_name = f"{datetime.now()}-{uuid.uuid4()}-{file_name}"
    try:
        print("Uploading...")
        s3.upload_fileobj(image_file, domain, f"Random-Art-Fluff-1-001/Random-Art-Fluff/{item_name}")
        print("Upload complete!")

       
        return f"https://{domain}/Random-Art-Fluff-1-001/Random-Art-Fluff/{item_name}"
    
    except Exception as e:
        print(str(e))
        return None

def deleteImage(url:str, bucket:str) -> bool:
    parsed_url = urlparse(url)
    object_key = parsed_url.path.lstrip("/")

    try:
        print("Deleting...")
        s3.delete_object(Bucket=bucket, Key=object_key)
        print(f"Deletion complete! Object: {object_key}")
        return True
    except botocore.exceptions as e:
        print("Deletion failed")
        return False