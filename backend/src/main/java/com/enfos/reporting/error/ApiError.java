package com.enfos.reporting.error;

import java.time.Instant;

/** Stable JSON structure returned for handled API failures. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
