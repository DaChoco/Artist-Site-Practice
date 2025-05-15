from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    #user signs up - we send this payload
    password: str
    username: Optional[str]
    email: Optional[str]

class CreateReviewComment(BaseModel):
    #user creates a review comment
    userID: str
    comment: str
 

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
    description: str
    amount: float
    currency: str
    quantity: int
    cart: list
class Cart(BaseModel):
    itemID: str
    url: str
    title: str
    price: int
    createdAt: int
