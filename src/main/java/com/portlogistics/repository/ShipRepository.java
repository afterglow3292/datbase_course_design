package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.Ship;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ShipRepository {
    private static final String SELECT_ALL = "SELECT ship_id, name, imo, capacity_teu, status FROM ship ORDER BY ship_id";
    private static final String INSERT = "INSERT INTO ship (name, imo, capacity_teu, status) VALUES (?, ?, ?, ?)";
    private static final String UPDATE_STATUS = "UPDATE ship SET status = ? WHERE ship_id = ?";

    public List<Ship> findAll() throws SQLException {
        List<Ship> ships = new ArrayList<>();
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                ships.add(mapRow(resultSet));
            }
        }
        return ships;
    }

    public void save(Ship ship) throws SQLException {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, ship.getName());
            statement.setString(2, ship.getImo());
            statement.setInt(3, ship.getCapacityTeu());
            statement.setString(4, ship.getStatus());
            statement.executeUpdate();
        }
    }

    public void updateStatus(int shipId, String status) throws SQLException {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_STATUS)) {
            statement.setString(1, status);
            statement.setInt(2, shipId);
            statement.executeUpdate();
        }
    }

    private Ship mapRow(ResultSet resultSet) throws SQLException {
        return new Ship(
                resultSet.getInt("ship_id"),
                resultSet.getString("name"),
                resultSet.getString("imo"),
                resultSet.getInt("capacity_teu"),
                resultSet.getString("status")
        );
    }
}
