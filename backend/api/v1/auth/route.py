## backend/api/v1/auth/route.py

## url - http://127.0.0.1:34001

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import sqlite3
import secrets  
import os

router = APIRouter()

# Secret key to sign JWT tokens
SECRET_KEY = secrets.token_hex(32) 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

DATABASE_URL = "database/users.db"
conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)

with conn:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            hashed_password TEXT,
            is_active BOOLEAN
        )
    """)

# only for first login - don't blame me if you get hacked (told you to chage this)
DEFAULT_EMAIL = "admin@example.com"
DEFAULT_PASSWORD = "admin123"

with conn:
    conn.execute("""
        INSERT OR IGNORE INTO users (email, hashed_password, is_active)
        VALUES (?, ?, ?)
    """, (DEFAULT_EMAIL, pwd_context.hash(DEFAULT_PASSWORD), True))

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class User(BaseModel):
    email: EmailStr
    is_active: bool = True

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(email: str):
    with sqlite3.connect(DATABASE_URL, check_same_thread=False) as conn:
        result = conn.execute("SELECT * FROM users WHERE email = ?", [email]).fetchone()
        if result:
            return UserInDB(email=result[0], hashed_password=result[1], is_active=result[2])
    return None

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=User)
async def signup(email: EmailStr, password: str):
    if get_user(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = pwd_context.hash(password)
    with sqlite3.connect(DATABASE_URL, check_same_thread=False) as conn:
        conn.execute(
            "INSERT INTO users (email, hashed_password, is_active) VALUES (?, ?, ?)",
            (email, hashed_password, True)
        )
    return User(email=email, is_active=True)

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/users/me/password")
async def change_password(current_password: str, new_password: str, current_user: User = Depends(get_current_user)):
    user = get_user(current_user.email)
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    hashed_password = pwd_context.hash(new_password)
    with sqlite3.connect(DATABASE_URL, check_same_thread=False) as conn:
        conn.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (hashed_password, current_user.email)
        )
    return {"message": "Password updated successfully"}
