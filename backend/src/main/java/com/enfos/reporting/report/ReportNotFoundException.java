package com.enfos.reporting.report;

/** Indicates that a requested report identifier is not in the catalog. */
public class ReportNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ReportNotFoundException(String reportId) {
        super("Report '%s' was not found.".formatted(reportId));
    }
}
