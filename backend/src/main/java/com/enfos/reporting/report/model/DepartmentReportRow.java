package com.enfos.reporting.report.model;

/** Immutable row returned by the Departments report endpoint. */
public record DepartmentReportRow(
        String departmentId,
        String departmentName,
        String manager,
        int employeeCount,
        String location
) {
}
