from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo.asynchronous import collection
from pymongo import AsyncMongoClient
from pymongo.errors import WriteError, NetworkTimeout, DuplicateKeyError, ServerSelectionTimeoutError
from pymongo.server_api import ServerApi
#--------------------------------------------------
from bson import ObjectId
import os
from dotenv import load_dotenv
#-------------------------------------------------------
from fastapi import FastAPI, Request, Depends, Query, UploadFile, File, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
#-----------------------------------------------------------
from math import ceil
#-------------------------------------------------------
import requests
import time
from datetime import timedelta, datetime, timezone
#-------------------------------------------
import pydanticModels

load_dotenv()
DOMAIN = os.getenv("CLOUDFRONT_DOMAIN")
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

ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173", "http://192.0.0.0:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins= ORIGINS,
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
async def add_product(
    name: str = Form(...),
    description: str = Form(default=""),
    categories: list[str] = Form(...), 
    price: float = Form(...),
    stock: int = Form(default=0),
    file: UploadFile = File(...),
    db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))
    ):
    if db is None:
        return {"message": "Database connection error"}
    
    if not name or not file.file:
        return {"message": "Fill in the missing fields"}

    url = uploadImage(file.file, DOMAIN, file.filename)

    if not url:
        raise HTTPException(status_code=400, detail="Image Upload Failed")

    new_doc = {
        "title": name,
        "desc": description,
        "categories": categories,  
        "price": price,
        "url": url,
        "stock": stock}

    try:
        await db.insert_one(document=new_doc)
        return {"message": "Product added successfully", "product": new_doc}
    except (DuplicateKeyError, WriteError, NetworkTimeout) as e:
        print("The error: ", e)
        return JSONResponse(content={"message": "Internal Server Error"}, status_code=status.HTTP_502_BAD_GATEWAY)

@app.post("/api/Products/ADMIN/Delete/{prodID}")
async def remove_product(prodID: str, objurl: str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if not prodID:
        return JSONResponse(content={"message": "Invalid request"}, status_code=504)
    
    aws_reply = deleteImage(objurl, DOMAIN)
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
from helpers import oauth2scheme, create_access_token, create_refresh_token, get_current_user, hashpw, checkpw, validate_refresh_token

@app.post("/api/credentials/user")
async def get_user(user: dict = Depends(get_current_user), db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):
    if not user or not user.get("userID"):
        return {"reply": False, "instruction": "The user will sign in normally"}
    
    the_user_in_db = await db.find_one({"_id": ObjectId(user["userID"])})
    result = validate_refresh_token(the_user_in_db["refresh_token"]["token"], str(the_user_in_db["_id"]), the_user_in_db["refresh_token"]["expires"])
    #will accept or deny based on this later
    print(result)

    
    return {"reply": True, "userID": user.get("userID"), "username": user.get("username"), "role": user.get("role")}
    
@app.post("/api/Users/login")
async def login_user(data: pydanticModels.User, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):

    if not data:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    result = await db.find_one({"email": data.email})

    if not result:
        result = await db.find_one({"username": data.username})
        if not result:
            raise HTTPException(status_code=404, detail="End user does not exist, they must register")

    #login is only via email or username

    hashed_pw = result["password"]

    if not checkpw(data.password, hashed_pw):
        raise HTTPException(status_code=403, detail="User exists on the system, yet this is an Invalid Username and Password combination")

    #WE STORE THE OBJ ID AS STR. The frontend will not need to convert
    to_encode_token = {
        "sub": str(result["_id"]),
        "username": result["username"],
        "timeCreated": int(time.time())
    }

    access_token = create_access_token(to_encode_token, timedelta(minutes=10))
    refresh_token = create_refresh_token()

    await db.update_one(filter={"_id": result["_id"]}, update={"$set": {"refresh_token": refresh_token}})

    try:
        result.pop("password", None)
        result.pop("email", None)
        result.pop("refresh_token", None)
    except KeyError as e:
        print("The data", result)
        print(e)

    result["_id"] = str(result["_id"])

    #userdata is the main field to work with the db in the frontend
    return JSONResponse(content={"message": "Logged in successfully", 
                                 "token_type": "Bearer", 
                                 "access_token": access_token,
                                 "refresh_token": refresh_token,
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
    
    result = await db.insert_one(new_doc)
    uploadedData = await db.find_one({"_id": result.inserted_id})
    
    to_encode_token = {
        "sub": str(uploadedData["_id"]),
        "username": uploadedData["username"],
        "timeCreated": int(time.time())
    }

    access_token = create_access_token(to_encode_token, timedelta(seconds=3600))

    try:
        uploadedData.pop("password", None)
        uploadedData.pop("email", None)
    except KeyError as e:
        print("The data", uploadedData)
        print(e)

    uploadedData["_id"] = str(uploadedData["_id"])

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
    try:
        cursor = db.find().skip(skip_val).sort("createdAt", -1).limit(9)
        items = await cursor.to_list(length=9)
        fixed_items = [fix_mongo_object_ids(item) for item in items]

        total_docs = await db.count_documents({})
    except ServerSelectionTimeoutError as e:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Request failed")
    total_pages = ceil(total_docs/9)

    return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)

@app.get("/api/Products/filter/stock")
async def get_filtered_products_stock(instock: bool | str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    #We are making this function to extract the products which are fulfilling either. In stock, out of stock or filters by price

    total_pages = 0
    if instock == "Neither":
        skip_val = (0) * 9
        cursor = db.find().skip(skip_val).sort("createdAt", -1).limit(9)
        items = await cursor.to_list(length=9)
        fixed_items = [fix_mongo_object_ids(item) for item in items]

        if not fixed_items:
            fixed_items = []

        total_docs = await db.count_documents({})
        total_pages = ceil(total_docs/9)
        return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)
    #Filter based on if in stock
    if instock == "True":
        cursor = db.find({"stock": {"$gt": 0}}).sort("createdAt", -1)
        items = await cursor.to_list(9)
        fixed_items = [fix_mongo_object_ids(item) for item in items]

        total_docs = await db.count_documents({"stock": {"$gt": 0}})
        total_pages = ceil(total_docs/9)
        return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)
        
    elif instock == "False":
        cursor = db.find({"stock": 0}).sort("createdAt", -1)
        items = await cursor.to_list(9)
        fixed_items = [fix_mongo_object_ids(item) for item in items]

        total_docs = await db.count_documents({"stock": 0})
        total_pages = ceil(total_docs/9)
        return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)
        
import re

@app.get("/api/Products/Search")
async def Search_Products(query: str = Query(Default=""), categories: str = Query(Default=""), db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if not query:
        return JSONResponse(content={"message": "Invalid request"}, status_code=504)
    
    regex_arr = re.compile(f'^{re.escape(categories)}', re.IGNORECASE)
    regex_query = re.compile(f'^{re.escape(query)}', re.IGNORECASE)
    
    condition = {"$or": [{"title":{"$regex": regex_query}}, {"categories":{"$elemMatch" :{"$regex": regex_arr}}}]
                           }
    cursor = db.find(condition).sort("createdAt", -1).limit(9)
    
    items = await cursor.to_list(9)

    fixed_items = [fix_mongo_object_ids(item) for item in items]
    total_docs = await db.count_documents(condition)
    total_pages = ceil(total_docs/9)
    return JSONResponse(content={"message": "Products returned successfully", "reply": fixed_items, "pages": total_pages}, status_code=200)

@app.get("/api/Products/autocomplete")
async def AutoComplete(query: str = Query(Default=""), db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    regex= re.compile(f'^{re.escape(query)}', re.IGNORECASE)
    condition = {"$or": [ {"title": {"$regex": regex}}, {"categories":{"$elemMatch" :{"$regex": regex}}}]}
    cursor = db.find(condition).sort("createdAt", -1).limit(5)
    
    items = await cursor.to_list(5)
    fixed_items = [fix_mongo_object_ids(item) for item in items]

    #extract only the title
    title_arr = []
    item_id_arr = []
    for index in fixed_items:
        title_arr.append(index["title"])
        item_id_arr.append(index["_id"])

    return JSONResponse(content={"message": "Products returned successfully", "reply": title_arr, "itemID": item_id_arr}, status_code=200)

@app.get("/api/Products/{product_id}")
async def get_product(product_id: str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    if db is None:
        return {"message": "Database connection error"}
    result = await db.find_one({"_id": ObjectId(product_id)})

    if result:
        result["_id"] = str(result["_id"])
        return result
    
    return JSONResponse(content={"message": "Product not returned. Please try again later"}, status_code=404)

@app.post("/api/Products/{product_id}/comments/create")
async def create_comment(product_id: str,  
                         data: pydanticModels.CreateReviewComment, 
                         reviews: AsyncIOMotorCollection = Depends(get_mongo_db("tblreviews")), 
                         users: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers")),
                         products: AsyncIOMotorCollection = Depends(get_mongo_db("tblproducts"))):
    #reviewID is basically <timestamp>#<UserID>#<productID>
    old_object = await products.find_one({"_id": ObjectId(product_id)})

    if not old_object:
        raise HTTPException(status_code=404, detail="Item does not exist")
    
    current_user = await users.find_one({"_id": ObjectId(data.userID)})

    if not current_user:
        raise HTTPException(status_code=404, detail="User does not exist")

    reviewID = f"{int(time.time())}#{data.userID}#{product_id}"

    new_doc = {
        "reviewID": reviewID,
        "username": current_user["username"],
        "comment": data.comment,
        "upvotes": 0,
        "downvotes": 0,
        "userID": data.userID,
        "productID": product_id,
        "createdAt": str(datetime.now(tz=timezone.utc))
    }

    reply = await reviews.insert_one(new_doc)

    comments_cursor = reviews.find({"productID": product_id}).sort("reviewID", -1).limit(10)
    list_comments = await comments_cursor.to_list(10)

    if not reply.inserted_id:
        raise HTTPException(status_code=500, detail="Something went wrong")
    
    return JSONResponse(content={"message": "Comment created", "comments": list_comments})

@app.get("/api/Products/{product_id}/comments/view")
async def show_comment(product_id: str, page: int = Query(default=1), reviews: AsyncIOMotorCollection = Depends(get_mongo_db("tblreviews"))):
    offset = (page-1)*9
    cursor = reviews.find({"_id": ObjectId(product_id)}).skip(offset).sort("reviewID").limit(9)

    comments = await cursor.to_list(9)
    fixed_comments = [fix_mongo_object_ids(comment) for comment in comments]
    if not fixed_comments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not found")

    return fixed_comments

@app.get("/api/cart/{userID}")
async def get_cart(userID: str, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):
    result = await db.find_one({"_id": ObjectId(userID)})

   
    try:
        if result:
            cart = result["cart"]
            return JSONResponse(status_code=status.HTTP_200_OK, content=cart)
        else:
            return JSONResponse(status_code=500, content="Content fail")
    except (NetworkTimeout, ServerSelectionTimeoutError) as e:
        print("Faced exception:", e)
        return JSONResponse(status_code=status.HTTP_502_BAD_GATEWAY, content={"Error": "INTERNAL SERVER ERROR"})

@app.post("/api/cart/{userID}/add")
async def add_cart(userID: str, cart: pydanticModels.Cart, quantity: int = Query(default=1), db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):
    locator = {"_id": ObjectId(userID)}
    
    try:
        result: dict = await db.find_one(locator)
        print(result)
        current_cart = result.get("cart")
        print(current_cart)

        if current_cart == None:
            current_cart = []

        user_input = {"_id": cart.itemID, 
                      "url": cart.url, 
                      "title": cart.title, 
                      "price": cart.price, 
                      "createdAt": cart.createdAt,
                      "stock": quantity
                      }
        print(user_input)
        current_cart.append(user_input)
        print(current_cart)

        new_values = { "$set": { "cart": current_cart } }

        output = await db.update_one(locator, new_values)
        print(output)
        
        

        return current_cart


    except (ServerSelectionTimeoutError, NetworkTimeout) as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Internal Server error")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="bad gateway")
    
from payments import pay_with_stripe
@app.post("/api/payments/Stripe/{userID}")
async def Stripe_Payment(userID: str, data: pydanticModels.Order, db: AsyncIOMotorCollection = Depends(get_mongo_db("tblusers"))):

    iteminfodict = {"quantity": data.quantity, "description": data.description}
    session_url = pay_with_stripe(data.currency, data.amount, iteminfodict)
    if not session_url:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Something has gone wrong with your payment, please try again later")
    
    #--- if the payment goes through we send to mongo
    locator = {"_id": ObjectId(userID)}

    try:
        result: dict = await db.find_one(locator)
        orders: list = result.get("orders")
        if not orders:
            orders = []
        #[{items: [{}], }]

        orders.append({"status": "In Progress", "date": time.time(), "items": data.cart, "price": data.amount})
        new_values = { "$set": { "orders": orders }}
        output = await db.update_one(locator, new_values)
        print(output)

    except NetworkTimeout:
        raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT)
    

    return {"url": session_url}

    


