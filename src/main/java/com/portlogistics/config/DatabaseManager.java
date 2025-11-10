package com.portlogistics.config;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Objects;
import java.util.Properties;

/**
 * Central place for loading database configuration and creating MySQL connections.
 */
public final class DatabaseManager {
    private static final DatabaseManager INSTANCE = new DatabaseManager();
    private final Properties properties = new Properties();

    private DatabaseManager() {
        try (InputStream input = DatabaseManager.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (input == null) {
                throw new IllegalStateException("application.properties not found on classpath");
            }
            properties.load(input);
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (IOException | ClassNotFoundException e) {
            throw new IllegalStateException("Failed to initialize database configuration", e);
        }
    }

    public static DatabaseManager getInstance() {
        return INSTANCE;
    }

    public Connection getConnection() throws SQLException {
        String url = Objects.requireNonNull(properties.getProperty("db.url"), "db.url must be set");
        String username = Objects.requireNonNull(properties.getProperty("db.username"), "db.username must be set");
        String password = properties.getProperty("db.password", "");
        return DriverManager.getConnection(url, username, password);
    }
}
