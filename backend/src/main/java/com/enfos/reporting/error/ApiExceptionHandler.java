package com.enfos.reporting.error;

import java.time.Instant;

import com.enfos.reporting.report.InvalidReportQueryException;
import com.enfos.reporting.report.ReportNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** Converts application exceptions into consistent HTTP error responses. */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** Maps an unknown report identifier to a stable 404 response. */
    @ExceptionHandler(ReportNotFoundException.class)
    public ResponseEntity<ApiError> handleReportNotFound(
            ReportNotFoundException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(error);
    }

    /** Maps invalid report parameters to a client-correctable 400 response. */
    @ExceptionHandler(InvalidReportQueryException.class)
    public ResponseEntity<ApiError> handleInvalidReportQuery(
            InvalidReportQueryException exception,
            HttpServletRequest request
    ) {
        return createError(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    /** Converts malformed scalar query parameters, such as page=abc, into a 400 response. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        String message = "Query parameter '%s' has an invalid value."
                .formatted(exception.getName());
        return createError(HttpStatus.BAD_REQUEST, message, request);
    }

    /** Logs unexpected failures internally while returning a sanitized 500 response. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        LOGGER.error("Unexpected error while handling {}", request.getRequestURI(), exception);

        return createError(status, "An unexpected error occurred.", request);
    }

    /** Builds the shared error envelope used by handled API failures. */
    private ResponseEntity<ApiError> createError(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(error);
    }
}
