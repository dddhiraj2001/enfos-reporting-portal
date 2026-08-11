package com.enfos.reporting.report.model;

import java.time.LocalDate;

/** Immutable row returned by the Users report endpoint. */
public record UserReportRow(
        String userId,
        String name,
        String email,
        String role,
        String status,
        LocalDate createdDate
) {
}
