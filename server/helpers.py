import bcrypt
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import timedelta
import time
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import os
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET_KEY")

ALGORITHM = "HS256"

def checkpw(password: str, hashedpw: str):
    return bcrypt.checkpw(password.encode('utf-8'), hashedpw.encode('utf-8'))

def hashpw(password: str):
    password_bytes = password.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict, expiry_time: float | None):
    #expiry time must be in seconds
    to_encode = data.copy()
    exp = time.time() + (expiry_time or timedelta(minutes=60))
    to_encode.update({"exp": int(exp)})
    return jwt.encode(payload=to_encode, key=JWT_SECRET, algorithm=ALGORITHM)

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