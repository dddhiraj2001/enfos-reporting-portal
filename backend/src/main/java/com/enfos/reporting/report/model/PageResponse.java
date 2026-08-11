package com.enfos.reporting.report.model;

import java.util.List;

/** Immutable envelope for a page of report rows and its navigation metadata. */
public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}
