from __future__ import annotations

import asyncio

from .models import Base
from .session import get_engine


async def init_db() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def main() -> None:
    asyncio.run(init_db())


if __name__ == "__main__":
    main()
