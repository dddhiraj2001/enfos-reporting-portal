package com.enfos.reporting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Bootstraps the ENFOS reporting API and its Spring-managed components. */
@SpringBootApplication
public class ReportingApiApplication {

	/** Starts the embedded web server. */
	public static void main(String[] args) {
		SpringApplication.run(ReportingApiApplication.class, args);
	}

}
