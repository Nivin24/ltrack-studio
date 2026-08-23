import json
from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websockets"])


class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSockets
        self.active_user_connections: Dict[str, List[WebSocket]] = {}
        # Maps room_id -> List of active WebSockets
        self.room_connections: Dict[str, List[WebSocket]] = {}
        # Online users tracker
        self.online_users: Set[str] = set()

    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_user_connections:
            self.active_user_connections[user_id] = []
        self.active_user_connections[user_id].append(websocket)
        self.online_users.add(user_id)
        # Broadcast presence
        await self.broadcast_presence()

    def disconnect_user(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_user_connections:
            if websocket in self.active_user_connections[user_id]:
                self.active_user_connections[user_id].remove(websocket)
            if not self.active_user_connections[user_id]:
                del self.active_user_connections[user_id]
                self.online_users.discard(user_id)

    async def join_room(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        self.room_connections[room_id].append(websocket)

    def leave_room(self, websocket: WebSocket, room_id: str):
        if room_id in self.room_connections:
            if websocket in self.room_connections[room_id]:
                self.room_connections[room_id].remove(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def broadcast_to_all(self, message: dict, exclude_socket: WebSocket = None):
        for user_sockets in list(self.active_user_connections.values()):
            for ws in list(user_sockets):
                if ws != exclude_socket:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_socket: WebSocket = None):
        if room_id in self.room_connections:
            dead_connections = []
            for connection in self.room_connections[room_id]:
                if connection != exclude_socket:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        dead_connections.append(connection)
            for dead in dead_connections:
                if dead in self.room_connections[room_id]:
                    self.room_connections[room_id].remove(dead)

    async def broadcast_presence(self):
        message = {
            "type": "presence_update",
            "online_user_ids": list(self.online_users),
            "timestamp": "Just now"
        }
        await self.broadcast_to_all(message)

    async def send_personal_notification(self, user_id: str, notification: dict):
        if user_id in self.active_user_connections:
            for ws in self.active_user_connections[user_id]:
                try:
                    await ws.send_json({"type": "notification", "data": notification})
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect_user(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                # Broadcast chat messages, code sync, deletions, and voice notes to all peers
                msg_type = payload.get("type")
                if msg_type in ["pairing_chat", "pairing_chat_delete", "code_change", "notes_change", "cursor_update", "call_toggle", "session_resolve", "user_typing", "chat_typing", "incoming_call_request", "call_accepted", "call_rejected", "call_cancelled", "call_ended", "peer_help_created", "peer_help_offered"]:
                    await manager.broadcast_to_all(payload, exclude_socket=websocket)
                elif msg_type == "status_update":
                    await manager.broadcast_presence()
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect_user(websocket, user_id)
        await manager.broadcast_presence()


@router.websocket("/pairing/{room_id}/ws/{user_id}")
async def websocket_pairing_room_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.join_room(websocket, room_id)
    # Broadcast participant joined
    await manager.broadcast_to_room(room_id, {
        "type": "room_event",
        "event": "user_joined",
        "userId": user_id
    }, exclude_socket=websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                # Broadcast chat message or code update to room participants
                await manager.broadcast_to_room(room_id, payload, exclude_socket=websocket)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.leave_room(websocket, room_id)
        await manager.broadcast_to_room(room_id, {
            "type": "room_event",
            "event": "user_left",
            "userId": user_id
        })
