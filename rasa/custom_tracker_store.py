from rasa.core.tracker_store import SQLTrackerStore
from rasa.shared.core.trackers import DialogueStateTracker
from sqlalchemy.exc import SQLAlchemyError

class CustomSQLTrackerStore(SQLTrackerStore):
    def save(self, tracker: DialogueStateTracker, timeout: int = None) -> None:
        # Save the tracker state as usual
        super().save(tracker, timeout)

        # Extract the sender ID and user name (custom)
        sender_id = tracker.sender_id
        user_name = self._get_user_name_from_tracker(tracker)
        
        # Update the event table with user_name for the current sender_id
        if user_name:
            try:
                self.session.execute(
                    f"UPDATE events SET user_name = '{user_name}' WHERE sender_id = '{sender_id}'"
                )
                self.session.commit()
            except SQLAlchemyError as e:
                self.session.rollback()
                self.logger.error(f"Failed to update user_name for sender_id {sender_id}: {e}")

    def _get_user_name_from_tracker(self, tracker: DialogueStateTracker) -> str:
        # Extract user_name from tracker or metadata (custom logic)
        user_name = tracker.get_slot("username")
        if not user_name:
            user_name = "default_user"  # Default if username slot is not set
        return user_name
