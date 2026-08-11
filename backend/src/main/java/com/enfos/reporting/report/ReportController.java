package com.enfos.reporting.report;

import java.util.List;

import com.enfos.reporting.report.model.DepartmentReportRow;
import com.enfos.reporting.report.model.PageResponse;
import com.enfos.reporting.report.model.ProjectReportRow;
import com.enfos.reporting.report.model.ReportSummary;
import com.enfos.reporting.report.model.UserReportRow;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Exposes the reporting catalog and report-row HTTP endpoints. */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /** Returns metadata for every report displayed in the catalog. */
    @GetMapping
    public List<ReportSummary> getReports() {
        return reportService.getReports();
    }

    /** Returns one filtered, sorted, and paginated page of user rows. */
    @GetMapping("/users")
    public PageResponse<UserReportRow> getUsersReport(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "userId") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return reportService.getUsers(page, size, query, sort, direction);
    }

    /** Returns one filtered, sorted, and paginated page of department rows. */
    @GetMapping("/departments")
    public PageResponse<DepartmentReportRow> getDepartmentsReport(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "departmentId") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return reportService.getDepartments(page, size, query, sort, direction);
    }

    /** Returns one filtered, sorted, and paginated page of project rows. */
    @GetMapping("/projects")
    public PageResponse<ProjectReportRow> getProjectsReport(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "projectId") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return reportService.getProjects(page, size, query, sort, direction);
    }

    /** Produces the same error contract for report identifiers outside the fixed catalog. */
    @GetMapping("/{reportId}")
    public void rejectUnknownReport(@PathVariable String reportId) {
        throw new ReportNotFoundException(reportId);
    }
}
