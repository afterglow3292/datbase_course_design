package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.User;
import org.springframework.stereotype.Repository;

import java.sql.*;

@Repository
public class UserRepository {
    private final DatabaseManager databaseManager;

    private static final String SELECT_BY_USERNAME = "SELECT user_id, username, password, role, created_at FROM user WHERE username = ?";
    private static final String INSERT = "INSERT INTO user (username, password, role) VALUES (?, ?, ?)";

    public UserRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public User findByUsername(String username) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_USERNAME)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("user_id"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("password"));
                user.setRole(rs.getString("role"));
                user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                return user;
            }
            return null;
        }
    }

    public void save(User user) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPassword());
            stmt.setString(3, user.getRole() != null ? user.getRole() : "USER");
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                user.setId(rs.getInt(1));
            }
        }
    }
}
