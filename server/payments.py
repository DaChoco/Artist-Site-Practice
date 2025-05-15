import stripe
import paypal
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_KEY = os.getenv("STRIPE_SECRET")
ENDPOINTSECRET = os.getenv("STRIPE_PUBLISH")

MINOR_UNITS = {
    "usd": 100,
    "jpy": 1,
    "zar": 100,
    "gbp": 100,
    "eur": 100
}

STRIPE_URL = 'https://api.stripe.com'

stripe.api_key = STRIPE_KEY


def convert_for_stripe(amount: int, currency: str) -> int:
    currency = currency.lower()
    minor_unit = MINOR_UNITS.get(currency, 100)
    return int(round(amount * minor_unit))

def pay_with_stripe(currency: str, units: float, itemMetaData: dict):

    unit_output = convert_for_stripe(units, currency)
    try:
        Session = stripe.checkout.Session.create(
        payment_method_types=["card", "paypal", "amazon_pay"],
        line_items=[{
            "price_data": {"currency": currency.lower(), "product_data": {
                "name": "Order from Artist-Site", 
                "description": itemMetaData["description"]}, 
                "unit_amount": unit_output,
                },
            "quantity": itemMetaData["quantity"]

            }],
            mode="payment",
            success_url="http://localhost:5173/checkout?result=success",
            cancel_url="http://localhost:5173/checkout?result=cancel"
        )
        return Session.url
    except Exception as e:
        print(e)
        return ""