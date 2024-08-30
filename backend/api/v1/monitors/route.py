from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from ..auth.route import get_current_user, User
import sqlite3
import json

router = APIRouter()

DATABASE_URL = "database/monitors.db"

# Create monitors table if it doesn't exist
with sqlite3.connect(DATABASE_URL) as conn:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS monitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            name TEXT,
            url TEXT,
            method TEXT,
            headers TEXT,
            frequency INTEGER,
            tags TEXT,
            assertions TEXT,
            FOREIGN KEY (user_email) REFERENCES users(email)
        )
    """)

class MonitorCreate(BaseModel):
    name: str
    url: HttpUrl
    method: str
    headers: Optional[dict] = None
    frequency: Optional[int] = None  # in seconds
    tags: Optional[List[str]] = None
    assertions: Optional[List[str]] = None

class Monitor(MonitorCreate):
    id: int
    user_email: str

@router.post("/monitors", response_model=Monitor)
async def create_monitor(monitor: MonitorCreate, current_user: User = Depends(get_current_user)):
    with sqlite3.connect(DATABASE_URL) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO monitors (user_email, name, url, method, headers, frequency, tags, assertions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user.email,
            monitor.name,
            str(monitor.url),
            monitor.method,
            json.dumps(monitor.headers) if monitor.headers else None,
            monitor.frequency,
            json.dumps(monitor.tags) if monitor.tags else None,
            json.dumps(monitor.assertions) if monitor.assertions else None
        ))
        monitor_id = cursor.lastrowid

    return {**monitor.dict(), "id": monitor_id, "user_email": current_user.email}

@router.get("/monitors", response_model=List[Monitor])
async def get_monitors(current_user: User = Depends(get_current_user)):
    with sqlite3.connect(DATABASE_URL) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM monitors WHERE user_email = ?", (current_user.email,))
        monitors = cursor.fetchall()

    return [
        {
            **dict(monitor),
            "headers": json.loads(monitor["headers"]) if monitor["headers"] else None,
            "tags": json.loads(monitor["tags"]) if monitor["tags"] else None,
            "assertions": json.loads(monitor["assertions"]) if monitor["assertions"] else None
        }
        for monitor in monitors
    ]

@router.get("/monitors/{monitor_id}", response_model=Monitor)
async def get_monitor(monitor_id: int, current_user: User = Depends(get_current_user)):
    with sqlite3.connect(DATABASE_URL) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM monitors WHERE id = ? AND user_email = ?", (monitor_id, current_user.email))
        monitor = cursor.fetchone()

    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")

    return {
        **dict(monitor),
        "headers": json.loads(monitor["headers"]) if monitor["headers"] else None,
        "tags": json.loads(monitor["tags"]) if monitor["tags"] else None,
        "assertions": json.loads(monitor["assertions"]) if monitor["assertions"] else None
    }

@router.put("/monitors/{monitor_id}", response_model=Monitor)
async def update_monitor(monitor_id: int, monitor: MonitorCreate, current_user: User = Depends(get_current_user)):
    with sqlite3.connect(DATABASE_URL) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE monitors
            SET name = ?, url = ?, method = ?, headers = ?, frequency = ?, tags = ?, assertions = ?
            WHERE id = ? AND user_email = ?
        """, (
            monitor.name,
            str(monitor.url),
            monitor.method,
            json.dumps(monitor.headers) if monitor.headers else None,
            monitor.frequency,
            json.dumps(monitor.tags) if monitor.tags else None,
            json.dumps(monitor.assertions) if monitor.assertions else None,
            monitor_id,
            current_user.email
        ))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Monitor not found")

    return await get_monitor(monitor_id, current_user)

@router.delete("/monitors/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_monitor(monitor_id: int, current_user: User = Depends(get_current_user)):
    with sqlite3.connect(DATABASE_URL) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM monitors WHERE id = ? AND user_email = ?", (monitor_id, current_user.email))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Monitor not found")
