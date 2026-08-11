package com.enfos.reporting.report;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(ReportControllerTests.UnexpectedFailureController.class)
class ReportControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsReportMetadata() throws Exception {
        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value("users"))
                .andExpect(jsonPath("$[0].rowCount").value(15))
                .andExpect(jsonPath("$[1].id").value("departments"))
                .andExpect(jsonPath("$[1].rowCount").value(12))
                .andExpect(jsonPath("$[2].id").value("projects"))
                .andExpect(jsonPath("$[2].rowCount").value(15));
    }

    @Test
    void returnsUsersReportWithRequiredFields() throws Exception {
        mockMvc.perform(get("/api/reports/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalItems").value(15))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.items[0].userId").value("USR-1001"))
                .andExpect(jsonPath("$.items[0].name").isNotEmpty())
                .andExpect(jsonPath("$.items[0].email").isNotEmpty())
                .andExpect(jsonPath("$.items[0].role").isNotEmpty())
                .andExpect(jsonPath("$.items[0].status").isNotEmpty())
                .andExpect(jsonPath("$.items[0].createdDate").isNotEmpty());
    }

    @Test
    void returnsDepartmentsReportWithRequiredFields() throws Exception {
        mockMvc.perform(get("/api/reports/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.totalItems").value(12))
                .andExpect(jsonPath("$.items[0].departmentId").value("DEP-101"))
                .andExpect(jsonPath("$.items[0].departmentName").isNotEmpty())
                .andExpect(jsonPath("$.items[0].manager").isNotEmpty())
                .andExpect(jsonPath("$.items[0].employeeCount").isNumber())
                .andExpect(jsonPath("$.items[0].location").isNotEmpty());
    }

    @Test
    void returnsProjectsReportWithRequiredFields() throws Exception {
        mockMvc.perform(get("/api/reports/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.totalItems").value(15))
                .andExpect(jsonPath("$.items[0].projectId").value("PRJ-2401"))
                .andExpect(jsonPath("$.items[0].projectName").isNotEmpty())
                .andExpect(jsonPath("$.items[0].department").isNotEmpty())
                .andExpect(jsonPath("$.items[0].owner").isNotEmpty())
                .andExpect(jsonPath("$.items[0].status").isNotEmpty())
                .andExpect(jsonPath("$.items[0].startDate").isNotEmpty())
                .andExpect(jsonPath("$.items[0].endDate").isNotEmpty());
    }

    @Test
    void paginatesFiltersAndSortsReportRowsOnTheServer() throws Exception {
        mockMvc.perform(get("/api/reports/users")
                        .param("page", "1")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.items[0].userId").value("USR-1006"));

        mockMvc.perform(get("/api/reports/departments")
                        .param("query", "calgary")
                        .param("sort", "departmentName")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items[0].departmentName").value("Finance"));
    }

    @Test
    void rejectsInvalidPaginationAndSortingInput() throws Exception {
        mockMvc.perform(get("/api/reports/users").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Size must be between 1 and 50."));

        mockMvc.perform(get("/api/reports/users").param("sort", "password"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported sort field 'password'."));

        mockMvc.perform(get("/api/reports/users").param("page", "not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Query parameter 'page' has an invalid value."
                ));
    }

    @Test
    void rejectsAPageBeyondTheAvailableRange() throws Exception {
        mockMvc.perform(get("/api/reports/users")
                        .param("page", "999")
                        .param("size", "5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Page must be between 0 and 2."))
                .andExpect(jsonPath("$.path").value("/api/reports/users"));
    }

    @Test
    void returnsConsistentErrorForUnknownReport() throws Exception {
        mockMvc.perform(get("/api/reports/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Report 'unknown' was not found."))
                .andExpect(jsonPath("$.path").value("/api/reports/unknown"));
    }

    @Test
    void returnsSafeErrorForUnexpectedFailure() throws Exception {
        mockMvc.perform(get("/api/test/unexpected-failure"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred."))
                .andExpect(jsonPath("$.message").value(not(containsString("sensitive details"))))
                .andExpect(jsonPath("$.path").value("/api/test/unexpected-failure"));
    }

    @RestController
    static class UnexpectedFailureController {

        @GetMapping("/api/test/unexpected-failure")
        void fail() {
            throw new IllegalStateException("sensitive details");
        }
    }
}
