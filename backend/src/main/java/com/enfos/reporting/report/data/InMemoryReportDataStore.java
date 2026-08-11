package com.enfos.reporting.report.data;

import java.time.LocalDate;
import java.util.List;

import com.enfos.reporting.report.model.DepartmentReportRow;
import com.enfos.reporting.report.model.ProjectReportRow;
import com.enfos.reporting.report.model.UserReportRow;
import org.springframework.stereotype.Component;

/** Provides deterministic report data without requiring an external database. */
@Component
public class InMemoryReportDataStore {

    private final List<UserReportRow> users = List.of(
            new UserReportRow(
                    "USR-1001", "Ava Patel", "ava.patel@enfos.example",
                    "Administrator", "Active", LocalDate.of(2022, 3, 14)
            ),
            new UserReportRow(
                    "USR-1002", "Marcus Chen", "marcus.chen@enfos.example",
                    "Department Manager", "Active", LocalDate.of(2021, 8, 2)
            ),
            new UserReportRow(
                    "USR-1003", "Elena Garcia", "elena.garcia@enfos.example",
                    "Project Manager", "Active", LocalDate.of(2023, 1, 23)
            ),
            new UserReportRow(
                    "USR-1004", "Noah Williams", "noah.williams@enfos.example",
                    "Analyst", "Active", LocalDate.of(2024, 5, 6)
            ),
            new UserReportRow(
                    "USR-1005", "Priya Shah", "priya.shah@enfos.example",
                    "Department Manager", "Active", LocalDate.of(2020, 11, 18)
            ),
            new UserReportRow(
                    "USR-1006", "Liam O'Connor", "liam.oconnor@enfos.example",
                    "Project Owner", "Active", LocalDate.of(2022, 9, 12)
            ),
            new UserReportRow(
                    "USR-1007", "Sofia Andersson", "sofia.andersson@enfos.example",
                    "Analyst", "Inactive", LocalDate.of(2023, 7, 31)
            ),
            new UserReportRow(
                    "USR-1008", "Daniel Kim", "daniel.kim@enfos.example",
                    "Project Owner", "Pending", LocalDate.of(2026, 8, 4)
            ),
            new UserReportRow(
                    "USR-1009", "Maya Thompson", "maya.thompson@enfos.example",
                    "Analyst", "Active", LocalDate.of(2024, 2, 19)
            ),
            new UserReportRow(
                    "USR-1010", "Owen Brooks", "owen.brooks@enfos.example",
                    "Project Manager", "Active", LocalDate.of(2023, 10, 9)
            ),
            new UserReportRow(
                    "USR-1011", "Fatima Hassan", "fatima.hassan@enfos.example",
                    "Environmental Specialist", "Active", LocalDate.of(2022, 6, 27)
            ),
            new UserReportRow(
                    "USR-1012", "Ethan Nguyen", "ethan.nguyen@enfos.example",
                    "Field Coordinator", "Active", LocalDate.of(2025, 1, 13)
            ),
            new UserReportRow(
                    "USR-1013", "Chloe Martin", "chloe.martin@enfos.example",
                    "Financial Analyst", "Inactive", LocalDate.of(2021, 4, 22)
            ),
            new UserReportRow(
                    "USR-1014", "Lucas Bernard", "lucas.bernard@enfos.example",
                    "Project Owner", "Active", LocalDate.of(2024, 8, 15)
            ),
            new UserReportRow(
                    "USR-1015", "Grace Wilson", "grace.wilson@enfos.example",
                    "Department Manager", "Pending", LocalDate.of(2026, 7, 20)
            )
    );

    private final List<DepartmentReportRow> departments = List.of(
            new DepartmentReportRow(
                    "DEP-101", "Engineering", "Marcus Chen", 42, "Calgary"
            ),
            new DepartmentReportRow(
                    "DEP-102", "Environmental Services", "Priya Shah", 28, "Edmonton"
            ),
            new DepartmentReportRow(
                    "DEP-103", "Operations", "Ava Patel", 35, "Toronto"
            ),
            new DepartmentReportRow(
                    "DEP-104", "Product", "Elena Garcia", 16, "Vancouver"
            ),
            new DepartmentReportRow(
                    "DEP-105", "Finance", "Liam O'Connor", 12, "Calgary"
            ),
            new DepartmentReportRow(
                    "DEP-106", "Health and Safety", "Maya Thompson", 18, "Edmonton"
            ),
            new DepartmentReportRow(
                    "DEP-107", "Data Services", "Daniel Kim", 24, "Toronto"
            ),
            new DepartmentReportRow(
                    "DEP-108", "Field Services", "Ethan Nguyen", 31, "Saskatoon"
            ),
            new DepartmentReportRow(
                    "DEP-109", "Compliance", "Fatima Hassan", 14, "Ottawa"
            ),
            new DepartmentReportRow(
                    "DEP-110", "Client Success", "Grace Wilson", 20, "Vancouver"
            ),
            new DepartmentReportRow(
                    "DEP-111", "Quality Assurance", "Owen Brooks", 11, "Halifax"
            ),
            new DepartmentReportRow(
                    "DEP-112", "Corporate Services", "Chloe Martin", 15, "Calgary"
            )
    );

    private final List<ProjectReportRow> projects = List.of(
            new ProjectReportRow(
                    "PRJ-2401", "Atlas Modernization", "Engineering", "Liam O'Connor",
                    "Active", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 11, 20)
            ),
            new ProjectReportRow(
                    "PRJ-2402", "North Site Remediation", "Environmental Services",
                    "Elena Garcia", "At Risk", LocalDate.of(2025, 9, 8),
                    LocalDate.of(2026, 10, 30)
            ),
            new ProjectReportRow(
                    "PRJ-2403", "Reporting Experience", "Product", "Daniel Kim",
                    "Active", LocalDate.of(2026, 5, 4), LocalDate.of(2026, 9, 18)
            ),
            new ProjectReportRow(
                    "PRJ-2404", "Field Operations Review", "Operations", "Ava Patel",
                    "Planned", LocalDate.of(2026, 9, 1), LocalDate.of(2027, 1, 29)
            ),
            new ProjectReportRow(
                    "PRJ-2405", "Cost Controls Program", "Finance", "Liam O'Connor",
                    "Active", LocalDate.of(2026, 2, 16), LocalDate.of(2026, 12, 11)
            ),
            new ProjectReportRow(
                    "PRJ-2406", "Legacy Data Migration", "Engineering", "Marcus Chen",
                    "Completed", LocalDate.of(2025, 4, 7), LocalDate.of(2026, 6, 26)
            ),
            new ProjectReportRow(
                    "PRJ-2407", "Western Portfolio Audit", "Environmental Services",
                    "Priya Shah", "Completed", LocalDate.of(2025, 10, 13),
                    LocalDate.of(2026, 4, 17)
            ),
            new ProjectReportRow(
                    "PRJ-2408", "Safety Metrics Refresh", "Health and Safety",
                    "Maya Thompson", "Active", LocalDate.of(2026, 3, 2),
                    LocalDate.of(2026, 9, 25)
            ),
            new ProjectReportRow(
                    "PRJ-2409", "Client Data Hub", "Data Services", "Daniel Kim",
                    "Active", LocalDate.of(2026, 4, 13), LocalDate.of(2027, 2, 12)
            ),
            new ProjectReportRow(
                    "PRJ-2410", "Prairie Field Mobilization", "Field Services",
                    "Ethan Nguyen", "Planned", LocalDate.of(2026, 10, 5),
                    LocalDate.of(2027, 5, 21)
            ),
            new ProjectReportRow(
                    "PRJ-2411", "Regulatory Controls Review", "Compliance",
                    "Fatima Hassan", "At Risk", LocalDate.of(2026, 1, 26),
                    LocalDate.of(2026, 8, 28)
            ),
            new ProjectReportRow(
                    "PRJ-2412", "Customer Onboarding Redesign", "Client Success",
                    "Grace Wilson", "Active", LocalDate.of(2026, 6, 8),
                    LocalDate.of(2026, 12, 18)
            ),
            new ProjectReportRow(
                    "PRJ-2413", "Release Quality Program", "Quality Assurance",
                    "Owen Brooks", "Active", LocalDate.of(2026, 2, 9),
                    LocalDate.of(2026, 10, 16)
            ),
            new ProjectReportRow(
                    "PRJ-2414", "Vendor Governance", "Corporate Services",
                    "Chloe Martin", "Planned", LocalDate.of(2026, 11, 2),
                    LocalDate.of(2027, 4, 30)
            ),
            new ProjectReportRow(
                    "PRJ-2415", "Emissions Data Validation", "Environmental Services",
                    "Lucas Bernard", "Completed", LocalDate.of(2025, 7, 14),
                    LocalDate.of(2026, 3, 27)
            )
    );

    /** Returns the immutable Users fixture collection. */
    public List<UserReportRow> users() {
        return users;
    }

    /** Returns the immutable Departments fixture collection. */
    public List<DepartmentReportRow> departments() {
        return departments;
    }

    /** Returns the immutable Projects fixture collection. */
    public List<ProjectReportRow> projects() {
        return projects;
    }
}
