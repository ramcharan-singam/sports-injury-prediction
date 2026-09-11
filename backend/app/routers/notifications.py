from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.postgres import User, Notification
from app.schemas import NotificationOut, NotificationUnreadCountOut
from app.core.security import get_current_user

from datetime import datetime, timedelta

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

def purge_expired_notifications(db: Session, user_id: UUID):
    """Auto-delete notifications older than 48 hours for the user."""
    cutoff = datetime.utcnow() - timedelta(hours=48)
    db.query(Notification).filter(
        Notification.recipient_user_id == user_id,
        Notification.created_at < cutoff
    ).delete(synchronize_session=False)
    db.commit()

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve notifications strictly scoped to the authenticated user (auto-expires after 48 hours)."""
    purge_expired_notifications(db, current_user.user_id)
    cutoff = datetime.utcnow() - timedelta(hours=48)
    notifications = db.query(Notification).filter(
        Notification.recipient_user_id == current_user.user_id,
        Notification.created_at >= cutoff
    ).order_by(Notification.created_at.desc()).all()
    return notifications

@router.get("/unread-count", response_model=NotificationUnreadCountOut)
def get_unread_notification_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the number of unread notifications for current user (auto-expires after 48 hours)."""
    purge_expired_notifications(db, current_user.user_id)
    cutoff = datetime.utcnow() - timedelta(hours=48)
    unread_count = db.query(Notification).filter(
        Notification.recipient_user_id == current_user.user_id,
        Notification.is_read == False,
        Notification.created_at >= cutoff
    ).count()
    return {"unread_count": unread_count}

@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.recipient_user_id == current_user.user_id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications for the current user as read."""
    db.query(Notification).filter(
        Notification.recipient_user_id == current_user.user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

@router.delete("/clear-all")
def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all notifications for the current user."""
    db.query(Notification).filter(
        Notification.recipient_user_id == current_user.user_id
    ).delete()
    db.commit()
    return {"message": "All notifications cleared."}
