package com.portlogistics;

/**
 * Legacy CLI entry point kept for reference only.
 * Use {@link PortLogisticsApplication} to run the Spring Boot service.
 */
@Deprecated
public final class App {

    private App() {
    }

    public static void main(String[] args) {
        System.out.println("The CLI entry point is deprecated. Please run PortLogisticsApplication instead.");
    }
}
