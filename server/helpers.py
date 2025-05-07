import bcrypt
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import timedelta, datetime, timezone
import time
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import os
import uuid
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET_KEY")

ALGORITHM = "HS256"

def checkpw(password: str, hashedpw: str):
    try:
        result = bcrypt.checkpw(password.encode('utf-8'), hashedpw.encode('utf-8'))
    except (ValueError, TypeError) as e:
        print(e)
        result = False
    return result

def hashpw(password: str):
    password_bytes = password.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict, expiry_time: timedelta | None = None):

    to_encode = data.copy()
    exp = datetime.now(tz=timezone.utc) + (expiry_time or timedelta(minutes=120))
    to_encode.update({"exp": int(exp.timestamp())})
    
    try:
        token = jwt.encode(to_encode, JWT_SECRET, ALGORITHM)
        return token
    except JWTError as e:
        print(e)
        return None
    
def create_refresh_token(data: dict):

    to_encode = data.copy()
    exp = datetime.now(tz=timezone.utc) + timedelta(days=5)

    to_encode.update({"exp": int(exp.timestamp())})
    to_encode.update({"jti": str(uuid.uuid4())})
    to_encode.update({"type": "refresh"})
    try:
        token = jwt.encode(to_encode, JWT_SECRET, ALGORITHM)
        return token
    except JWTError as e:
        print(e)
        return None

    
def validate_token(token: dict):
    try:
        payload = jwt.decode(token, JWT_SECRET, ALGORITHM)
        return payload
    except (JWTError, TypeError):
        return None
    

oauth2scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2scheme)):
    if not token or token.count(".") != 2:
        return {"reply": "Apologies, youre not signed in"}

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        if not payload:
            return {"reply": False}
    except ExpiredSignatureError as e:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    except JWTError as e:
        return {"reply": "Apologies, youre not signed in", "msg": e}
    
    
    return {"userID": payload.get("sub"), "userName": payload.get("username"), "role": payload.get("role")}