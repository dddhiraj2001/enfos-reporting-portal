package com.enfos.reporting.report.model;

import java.time.LocalDateTime;

/** Metadata describing an available report. */
public record ReportSummary(
        String id,
        String name,
        String description,
        int rowCount,
        LocalDateTime lastUpdated
) {
}
