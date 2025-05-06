from pydantic import BaseModel

class User(BaseModel):
    #user signs up - we send this payload
    userID: str
    password: str
    username: str
    email: str
    role: str

class CreateReviewComment(BaseModel):
    #user creates a review comment
    #reviewID is basically <timestamp>#<UserID>#<productID>
    reviewID: str
    productID: str
    userID: str
    comment: str
    timestamp: str

class Product(BaseModel):
    #admin creates a product
    productID: str
    name: str
    description: str
    categories: list[str]
    price: float
    stock: int 



class Order(BaseModel):
    #user orders an artwork
    orderID: str
    userID: str
    orderDate: str
    totalAmount: float
    status: str