package com.portlogistics.repository;
import org.springframework.stereotype.Repository;
import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.Cargo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CargoRepository {
    private final DatabaseManager databaseManager;
    public CargoRepository(DatabaseManager databaseManager){
        this.databaseManager=databaseManager;
    }
    private static final String SELECT_PENDING =
            "SELECT cargo_id, description, weight, destination, ship_id FROM cargo WHERE ship_id IS NULL ORDER BY cargo_id";
    private static final String INSERT =
            "INSERT INTO cargo (description, weight, destination, ship_id) VALUES (?, ?, ?, NULL)";
    private static final String ASSIGN = "UPDATE cargo SET ship_id = ? WHERE cargo_id = ?";

    public List<Cargo> findPendingCargo() throws SQLException {
        List<Cargo> cargoList = new ArrayList<>();
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_PENDING);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                cargoList.add(mapRow(resultSet));
            }
        }
        return cargoList;
    }

    public void save(Cargo cargo) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT)) {
            statement.setString(1, cargo.getDescription());
            statement.setDouble(2, cargo.getWeight());
            statement.setString(3, cargo.getDestination());
            statement.executeUpdate();
        }
    }

    public void assignToShip(int cargoId, int shipId) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(ASSIGN)) {
            statement.setInt(1, shipId);
            statement.setInt(2, cargoId);
            statement.executeUpdate();
        }
    }

    private Cargo mapRow(ResultSet resultSet) throws SQLException {
        Integer shipId = resultSet.getObject("ship_id") == null ? null : resultSet.getInt("ship_id");
        return new Cargo(
                resultSet.getInt("cargo_id"),
                resultSet.getString("description"),
                resultSet.getDouble("weight"),
                resultSet.getString("destination"),
                shipId
        );
    }
}

