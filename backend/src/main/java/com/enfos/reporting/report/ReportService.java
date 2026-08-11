package com.enfos.reporting.report;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

import com.enfos.reporting.report.data.InMemoryReportDataStore;
import com.enfos.reporting.report.model.DepartmentReportRow;
import com.enfos.reporting.report.model.PageResponse;
import com.enfos.reporting.report.model.ProjectReportRow;
import com.enfos.reporting.report.model.ReportSummary;
import com.enfos.reporting.report.model.UserReportRow;
import org.springframework.stereotype.Service;

/** Coordinates access to report metadata and rows. */
@Service
public class ReportService {

    private final InMemoryReportDataStore dataStore;

    public ReportService(InMemoryReportDataStore dataStore) {
        this.dataStore = dataStore;
    }

    /** Builds catalog metadata from the same collections used by the row endpoints. */
    public List<ReportSummary> getReports() {
        return List.of(
                new ReportSummary(
                        "users",
                        "Users",
                        "People, roles, and account status across the organization.",
                        dataStore.users().size(),
                        LocalDateTime.of(2026, 8, 10, 9, 30)
                ),
                new ReportSummary(
                        "departments",
                        "Departments",
                        "Organization structure, managers, headcount, and locations.",
                        dataStore.departments().size(),
                        LocalDateTime.of(2026, 8, 10, 9, 15)
                ),
                new ReportSummary(
                        "projects",
                        "Projects",
                        "Active and completed work with ownership and timelines.",
                        dataStore.projects().size(),
                        LocalDateTime.of(2026, 8, 10, 8, 45)
                )
        );
    }

    /** Applies the Users report's searchable text and allowed sort fields. */
    public PageResponse<UserReportRow> getUsers(
            int page,
            int size,
            String query,
            String sort,
            String direction
    ) {
        Map<String, Comparator<UserReportRow>> comparators = Map.of(
                "userId", comparingText(UserReportRow::userId),
                "name", comparingText(UserReportRow::name),
                "email", comparingText(UserReportRow::email),
                "role", comparingText(UserReportRow::role),
                "status", comparingText(UserReportRow::status),
                "createdDate", Comparator.comparing(UserReportRow::createdDate)
        );
        return paginate(
                dataStore.users(), page, size, query, sort, direction,
                user -> String.join(" ", user.userId(), user.name(), user.email(),
                        user.role(), user.status()),
                comparators
        );
    }

    /** Applies the Departments report's searchable text and allowed sort fields. */
    public PageResponse<DepartmentReportRow> getDepartments(
            int page,
            int size,
            String query,
            String sort,
            String direction
    ) {
        Map<String, Comparator<DepartmentReportRow>> comparators = Map.of(
                "departmentId", comparingText(DepartmentReportRow::departmentId),
                "departmentName", comparingText(DepartmentReportRow::departmentName),
                "manager", comparingText(DepartmentReportRow::manager),
                "employeeCount", Comparator.comparingInt(DepartmentReportRow::employeeCount),
                "location", comparingText(DepartmentReportRow::location)
        );
        return paginate(
                dataStore.departments(), page, size, query, sort, direction,
                department -> String.join(" ", department.departmentId(),
                        department.departmentName(), department.manager(),
                        String.valueOf(department.employeeCount()), department.location()),
                comparators
        );
    }

    /** Applies the Projects report's searchable text and allowed sort fields. */
    public PageResponse<ProjectReportRow> getProjects(
            int page,
            int size,
            String query,
            String sort,
            String direction
    ) {
        Map<String, Comparator<ProjectReportRow>> comparators = Map.of(
                "projectId", comparingText(ProjectReportRow::projectId),
                "projectName", comparingText(ProjectReportRow::projectName),
                "department", comparingText(ProjectReportRow::department),
                "owner", comparingText(ProjectReportRow::owner),
                "status", comparingText(ProjectReportRow::status),
                "startDate", Comparator.comparing(ProjectReportRow::startDate),
                "endDate", Comparator.comparing(ProjectReportRow::endDate)
        );
        return paginate(
                dataStore.projects(), page, size, query, sort, direction,
                project -> String.join(" ", project.projectId(), project.projectName(),
                        project.department(), project.owner(), project.status(),
                        project.startDate().toString(), project.endDate().toString()),
                comparators
        );
    }

    /**
     * Performs filtering and sorting before slicing the requested page, matching the order a
     * database-backed implementation would apply through WHERE, ORDER BY, and LIMIT/OFFSET.
     */
    private static <T> PageResponse<T> paginate(
            List<T> rows,
            int page,
            int size,
            String query,
            String sort,
            String direction,
            Function<T, String> searchableText,
            Map<String, Comparator<T>> comparators
    ) {
        validatePageRequest(page, size, sort, direction, comparators);

        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
        Comparator<T> comparator = comparators.get(sort);
        if (direction.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        List<T> matchingRows = rows.stream()
                .filter(row -> normalizedQuery.isEmpty()
                        || searchableText.apply(row).toLowerCase(Locale.ROOT)
                        .contains(normalizedQuery))
                .sorted(comparator)
                .toList();

        int totalItems = matchingRows.size();
        int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / size);
        // Reject contradictory responses that claim records exist but return an impossible page.
        if (totalItems > 0 && page >= totalPages) {
            throw new InvalidReportQueryException(
                    "Page must be between 0 and %d.".formatted(totalPages - 1)
            );
        }
        int fromIndex = (int) Math.min((long) page * size, totalItems);
        int toIndex = Math.min(fromIndex + size, totalItems);

        return new PageResponse<>(
                matchingRows.subList(fromIndex, toIndex),
                page,
                size,
                totalItems,
                totalPages
        );
    }

    /** Validates the public paging and sorting contract before processing any rows. */
    private static <T> void validatePageRequest(
            int page,
            int size,
            String sort,
            String direction,
            Map<String, Comparator<T>> comparators
    ) {
        if (page < 0) {
            throw new InvalidReportQueryException("Page must be zero or greater.");
        }
        if (size < 1 || size > 50) {
            throw new InvalidReportQueryException("Size must be between 1 and 50.");
        }
        if (!comparators.containsKey(sort)) {
            throw new InvalidReportQueryException("Unsupported sort field '%s'.".formatted(sort));
        }
        if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
            throw new InvalidReportQueryException("Direction must be 'asc' or 'desc'.");
        }
    }

    /** Creates deterministic case-insensitive ordering for human-readable text columns. */
    private static <T> Comparator<T> comparingText(
            Function<T, String> valueExtractor
    ) {
        return Comparator.comparing(valueExtractor, String.CASE_INSENSITIVE_ORDER);
    }
}
