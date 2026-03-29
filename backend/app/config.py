"""FinOversea Configuration

轻量化企业海外舆情事件洞察推送产品
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""

    # App
    APP_NAME: str = "FinOversea"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/finoversea",
        env="DATABASE_URL"
    )

    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )

    # LLM
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    OPENAI_BASE_URL: Optional[str] = Field(default=None, env="OPENAI_BASE_URL")
    LLM_MODEL: str = Field(default="gpt-4o-mini", env="LLM_MODEL")

    # Collectors
    COLLECTOR_USER_AGENT: str = "FinOversea/1.0 (舆情采集)"
    COLLECTOR_TIMEOUT: int = 30
    COLLECTOR_MAX_CONCURRENT: int = 10

    # Push
    PUSH_BATCH_SIZE: int = 100
    PUSH_RETRY_COUNT: int = 3

    # Tagging
    TAG_CONFIDENCE_THRESHOLD: float = 0.7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()