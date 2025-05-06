from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo.errors import WriteError, NetworkTimeout, DuplicateKeyError
from pymongo.server_api import ServerApi

from bson import ObjectId

import os
from dotenv import load_dotenv


from fastapi import FastAPI, Request, Depends, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from math import ceil

import requests
import time

import pydanticModels

load_dotenv()
ALBUM_ID = os.getenv("ALBUM")
BUCKET_NAME = os.getenv("BUCKETNAME")

#---- Mongo Set up
uri = os.getenv("mongo_connection")
client = AsyncIOMotorClient(uri, server_api=ServerApi('1'))
db = client["Jacko-Site"]

def get_mongo_db(table_name: str):
    async def _getTable() -> AsyncIOMotorCollection:
        return db[table_name]
    
    return _getTable
    
#--- End of Mongo

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fix_mongo_object_ids(reply):
    reply["_id"] = str(reply["_id"])
    return reply


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):

    return JSONResponse(
        status_code=500,
        content={"message": f"Internal Server Error: {exc}", "error_path": request.url.path},
    )



@app.get("/api")
async def root_route():
    return {"message": "Welcome to the artist site API! Hope you enjoy your stays."}

#------------------ADMIN ROUTES
#Was initially going to use Google Photos or Drive, but both were frustrating, fell back on S3, which is much simpler
from googleauth import get_google_token, upload_bytes_google, add_album_google
from awsupload import uploadImage, deleteImage

@app.post("/api/Products/ADMIN/Add")
#Is used for the artist to upload their prints to the site
async def add_product(data: pydanticModels.Product, file: UploadFile = File(...), db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if db is None:
        return {"message": "Database connection error"}
    
    if not data.name or not file.file:
        return {"message": "Fill in the missing fields"}

    url = uploadImage(file.file, BUCKET_NAME, file.filename)

    if not url:
        raise HTTPException(status_code=400, detail="Image Upload Failed")
    
    new_doc = {
        "title": data.name,
        "desc": data.description,
        "categories": data.categories,
        "price": data.price,
        "url": url,
        "stock": data.stock
        }
    
    try:
        await db.insert_one(document=new_doc)
        return {"message": "Product added successfully"}
    except DuplicateKeyError as e:
        print("The error: ", e)
        return JSONResponse(content={"message": "Internal Server Error"})
    except WriteError as e:
        print("The error: ", e)
        return JSONResponse(content={"message": "Internal Server Error"})

@app.post("/api/Products/ADMIN/Delete/{prodID}")
async def remove_product(prodID: str, objurl: str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if not prodID:
        return JSONResponse(content={"message": "Invalid request"}, status_code=504)
    
    aws_reply = deleteImage(objurl, BUCKET_NAME)
    if not aws_reply:
        raise HTTPException(status_code=500, detail="Something has gone wrong, please try again later.")
    
    result = await db.delete_one({"_id": ObjectId(prodID)})

    if not result or result.deleted_count < 1:
        return JSONResponse(content={"message": "Something has gone wrong, try again later"}, status_code=500)
    
    return JSONResponse(content={"message": "Successfully deleted.", "items_gone": result.deleted_count})

@app.get("/api/Users/ADMIN/all")
async def view_users(page: int = 1, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):
    skip_value = (page-1)*10
    cursor = db.find().skip(skip_value).limit(10)
    users = await cursor.to_list(10)
    fixed_users = [fix_mongo_object_ids(user) for user in users]

    if fixed_users:
        return JSONResponse(content={"message": "Users retrieved successfully", "output": fixed_users}, status_code=200)
    
    return JSONResponse(content={"message": "Apologies, users failed to be fetched, try again later"}, status_code=400)

#----------------ADMIN ROUTES

#General use
from helpers import oauth2scheme, create_access_token, get_current_user, hashpw, checkpw

@app.post("/api/credentials/user")
async def get_user(user: dict = Depends(get_current_user)):
    if not user:
        return {"reply": False, "instruction": "The user will sign in normally"}
    if not user.get("userID"):
        return {"reply": False, "instruction": "The user will sign in normally"}
    
    return {"reply": True, "userID": user.get("userID"), "username": user.get("username"), "role": user.get("role")}
    
@app.post("/api/users/login")
async def login_user(data: pydanticModels.User, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):

    if not data:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    result = await db.find_one({"email": data.email})

    if not result:
        result = await db.find_one({"username": data.username})
        if not result:
            raise HTTPException(status_code=404, detail="End user does not exist, they must register")

    #login is only via email or username, so either must work

    hashed_pw = result["password"]

    if not checkpw(data.password, hashed_pw):
        raise HTTPException(status_code=403, detail="User exists on the system, yet this is an Invalid Username and Password combination")

    #WE STORE THE OBJ ID AS STR. The frontend will not need to convert
    to_encode_token = {
        "sub": str(result["_id"]),
        "username": result["username"],
        "timeCreated": int(time.time())
    }

    access_token = create_access_token(to_encode_token)

    try:
        result.pop("password", None)
        result.pop("email", None)
    except KeyError as e:
        print("The data", result)
        print(e)

    #userdata is the main field to work with the db in the frontend
    return JSONResponse(content={"message": "Logged in successfully", 
                                 "token_type": "Bearer", 
                                 "access_token": access_token,
                                 "userdata": result
                                 },
                        status_code=200
                        )

@app.post("/api/Users/register")
async def register_user(data: pydanticModels.User, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):

    if not data:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    result = await db.find_one({"email": data.email})

    if result:
        raise HTTPException(status_code=409, detail="Account already exists. Please sign in.")
    
    new_doc = {"username": data.username, 
               "password": hashpw(data.password),
               "role": "user",
               "email": data.email,
               "datecreated": int(time.time()),
               "shopifySignIn": False,
               "shopifyData": None
               }
    
    uploadedData = await db.insert_one(new_doc)
    
    to_encode_token = {
        "sub": str(uploadedData["_id"]),
        "username": uploadedData["username"],
        "timeCreated": int(time.time())
    }

    access_token = create_access_token(to_encode_token)

    try:
        uploadedData.pop("password", None)
        uploadedData.pop("email", None)
    except KeyError as e:
        print("The data", uploadedData)
        print(e)

    return JSONResponse(content={"message": "Logged in successfully", 
                                 "token_type": "Bearer", 
                                 "access_token": access_token,
                                 "userdata": uploadedData
                                 },
                        status_code=200
                        )


@app.get("/api/Products/all")
async def get_all_products(page: int = 1, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    #paginated return of values
    if db is None:
        return {"message": "Database connection error"}
    skip_val = (page-1) * 9
    cursor = db.find().skip(skip_val).limit(9)
    items = await cursor.to_list(length=9)
    fixed_items = [fix_mongo_object_ids(item) for item in items]

    total_docs = await db.count_documents({})
    total_pages = ceil(total_docs/9)

    return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)

@app.get("/api/Products/{product_id}")
async def get_product(product_id: str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if db is None:
        return {"message": "Database connection error"}
    result = await db.find_one({"_id": ObjectId(product_id)})

    if result:
        result["_id"] = str(result["_id"])
        return result
    
    return JSONResponse(content={"message": "Product not returned. Please try again later"}, status_code=404)
