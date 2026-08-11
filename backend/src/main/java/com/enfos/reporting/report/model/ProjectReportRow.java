package com.enfos.reporting.report.model;

import java.time.LocalDate;

/** Immutable row returned by the Projects report endpoint. */
public record ProjectReportRow(
        String projectId,
        String projectName,
        String department,
        String owner,
        String status,
        LocalDate startDate,
        LocalDate endDate
) {
}
