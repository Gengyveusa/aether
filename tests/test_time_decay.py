import math

from aether.core.metrics import time_decay


def test_time_decay_parses_z_suffix_and_is_deterministic_with_now():
    now = "2025-01-11T00:00:00Z"
    ts = "2025-01-01T00:00:00Z"
    got = float(time_decay(ts, lambda_=0.07, now=now))
    expected = math.exp(-0.07 * 10)
    assert math.isclose(got, expected, rel_tol=1e-12, abs_tol=0.0)


def test_time_decay_treats_naive_iso_as_utc():
    now = "2025-01-11T00:00:00Z"
    ts_naive = "2025-01-01T00:00:00"
    ts_utc = "2025-01-01T00:00:00Z"
    assert time_decay(ts_naive, now=now) == time_decay(ts_utc, now=now)

