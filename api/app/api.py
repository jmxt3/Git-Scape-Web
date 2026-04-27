"""
FastAPI application creation and configuration.

Author: João Machete
"""

import os
import tempfile
import asyncio
import urllib.parse
import json
import logging

from fastapi import (
    FastAPI,
    APIRouter,
    Body,
    Request,
    Query,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

from app.config import settings, origins
import app.converter as converter
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()


@router.post("/chat/gemini")
def chat_with_gemini(
    api_key: str = Body(..., embed=True, description="Gemini API Key (user provided)"),
    system_instruction: str = Body(
        ..., embed=True, description="System instruction for Gemini chat context"
    ),
    history: list = Body(
        default_factory=list,
        embed=True,
        description="Chat history as a list of messages (optional)",
    ),
    user_message: str = Body(
        ..., embed=True, description="User's message to send to Gemini"
    ),
):
    """
    Proxy endpoint to chat with Gemini API. Accepts API key, system instruction, chat history, and user message.
    Returns Gemini's response.
    """
    GEMINI_API_URL = (
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
        + api_key
    )
    headers = {"Content-Type": "application/json"}
    contents = []
    if system_instruction:
        contents.append({"role": "user", "parts": [{"text": system_instruction}]})
    if history:
        for msg in history:
            if isinstance(msg, dict):
                contents.append(
                    {
                        "role": msg.get("sender", "user"),
                        "parts": [{"text": msg.get("text", "")}],
                    }
                )
            elif isinstance(msg, str):
                contents.append({"role": "user", "parts": [{"text": msg}]})
    contents.append({"role": "user", "parts": [{"text": user_message}]})
    payload = {"contents": contents}
    try:
        response = requests.post(
            GEMINI_API_URL, headers=headers, json=payload, timeout=30
        )
        response.raise_for_status()
        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return {"text": text, "raw": data}
    except requests.RequestException as e:
        detail = None
        if hasattr(e, "response") and e.response is not None:
            try:
                detail = e.response.text
            except Exception:
                detail = str(e.response)
        return {"error": str(e), "detail": detail}


@router.get("/")
def read_root(request: Request):
    """Root endpoint providing a welcome message."""
    return {"message": "GitScape"}

@router.get("/health")
async def health_check():
    return {"status": "OK"}

@router.get("/converter")
def get_digest(
    request: Request,
    repo_url: str = Query(..., description="Git repository URL to analyze"),
    github_token: str = Query(
        None,
        description="GitHub Personal Access Token for private repos or increased rate limits",
    ),
):
    """
    HTTP endpoint to clone a Git repository and generate a Markdown digest.
    This is a blocking operation.
    """
    try:
        repo_url = urllib.parse.unquote(repo_url)
        with tempfile.TemporaryDirectory() as tmpdir:
            clone_path = os.path.join(tmpdir, "repo")
            converter.clone_repository(repo_url, clone_path, github_token=github_token)
            markdown = converter.generate_markdown_digest(repo_url, clone_path)
        return {"digest": markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws/converter")
async def websocket_converter(
    websocket: WebSocket,
    repo_url: str = Query(..., description="Git repository URL to analyze"),
    github_token: str = Query(
        None,
        description="GitHub Personal Access Token for private repos or increased rate limits",
    ),
):
    """
    WebSocket endpoint to clone a Git repository and generate a Markdown digest,
    streaming progress updates to the client as JSON with percentage.
    """
    await websocket.accept()
    loop = asyncio.get_event_loop()
    sender_task = None

    try:
        repo_url = urllib.parse.unquote(repo_url)
        with tempfile.TemporaryDirectory() as tmpdir:
            clone_path = os.path.join(tmpdir, "repo")
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "progress",
                        "message": "Starting repository clone...",
                        "percentage": 0,
                    }
                )
            )
            converter.clone_repository(repo_url, clone_path, github_token=github_token)
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "progress",
                        "message": "Repository cloned. Starting digest generation...",
                        "percentage": 10,
                    }
                )
            )

            progress_queue = asyncio.Queue()

            def sync_progress_callback(message: str, percentage: int):
                try:
                    asyncio.run_coroutine_threadsafe(
                        progress_queue.put(
                            {
                                "type": "progress",
                                "message": message,
                                "percentage": percentage,
                            }
                        ),
                        loop,
                    ).result()
                except Exception as e:
                    logger.error(
                        f"Error in sync_progress_callback putting to queue: {e}"
                    )

            async def queue_to_websocket_sender():
                while True:
                    item = await progress_queue.get()
                    if item is None:
                        progress_queue.task_done()
                        break
                    try:
                        await websocket.send_text(json.dumps(item))
                    except WebSocketDisconnect:
                        logger.info("WebSocket disconnected during send from queue.")
                        progress_queue.task_done()
                        break
                    except Exception as e:
                        logger.error(
                            f"Error sending message from queue to websocket: {e}"
                        )
                    progress_queue.task_done()
                    await asyncio.sleep(0.01)

            sender_task = asyncio.create_task(queue_to_websocket_sender())

            def progress_callback(message, percentage):
                sync_progress_callback(message, percentage)

            markdown_digest = await loop.run_in_executor(
                None,
                converter.generate_markdown_digest,
                repo_url,
                clone_path,
                progress_callback,
            )

            await progress_queue.put(None)
            await progress_queue.join()
            await sender_task

            await websocket.send_text(
                json.dumps(
                    {
                        "type": "digest_complete",
                        "digest": markdown_digest,
                        "percentage": 100,
                    }
                )
            )

    except WebSocketDisconnect:
        logger.info(f"Client {websocket.client} disconnected")
    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        try:
            if websocket.client_state == websocket.client_state.CONNECTED:
                await websocket.send_text(
                    json.dumps(
                        {"type": "error", "message": error_message, "percentage": 100}
                    )
                )
        except Exception as ws_send_error:
            logger.error(
                f"Error sending error to WebSocket during general exception: {ws_send_error}"
            )
        logger.error(error_message)
    finally:
        if sender_task and not sender_task.done():
            sender_task.cancel()
            try:
                await sender_task
            except asyncio.CancelledError:
                logger.info("Sender task cancelled.")
            except Exception as e_cancel:
                logger.error(f"Error during sender_task cancellation: {e_cancel}")
        if websocket.client_state == WebSocketState.CONNECTED:
            try:
                await websocket.close()
            except RuntimeError as close_err:
                logger.warning(f"WebSocket close error (already closed?): {close_err}")
        logger.info(f"WebSocket connection closed for {websocket.client}")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application
    """
    app = FastAPI(
        title=str(settings.APP_NAME),
        description=str(settings.APP_DESCRIPTION),
        version=str(settings.APP_VERSION),
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
        ],
    )

    return app
