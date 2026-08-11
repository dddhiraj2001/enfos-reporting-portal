package com.enfos.reporting.report;

/** Indicates invalid pagination, search, or sorting input for a report request. */
public class InvalidReportQueryException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InvalidReportQueryException(String message) {
        super(message);
    }
}
