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
    // 使用voyage_plan_id作为ship_id的别名，并JOIN获取船舶名称
    private static final String SELECT_ALL =
            "SELECT c.cargo_id, c.description, c.weight, c.destination, c.voyage_plan_id as ship_id, s.name as ship_name " +
            "FROM cargo c " +
            "LEFT JOIN voyage_plan vp ON c.voyage_plan_id = vp.plan_id " +
            "LEFT JOIN ship s ON vp.ship_id = s.ship_id " +
            "ORDER BY c.cargo_id";
    private static final String SELECT_BY_KEYWORD =
            "SELECT c.cargo_id, c.description, c.weight, c.destination, c.voyage_plan_id as ship_id, s.name as ship_name " +
            "FROM cargo c " +
            "LEFT JOIN voyage_plan vp ON c.voyage_plan_id = vp.plan_id " +
            "LEFT JOIN ship s ON vp.ship_id = s.ship_id " +
            "WHERE LOWER(c.description) LIKE ? OR LOWER(c.destination) LIKE ? ORDER BY c.cargo_id";
    private static final String INSERT =
            "INSERT INTO cargo (description, weight, destination, voyage_plan_id) VALUES (?, ?, ?, ?)";
    private static final String ASSIGN = "UPDATE cargo SET voyage_plan_id = ? WHERE cargo_id = ?";
    private static final String UPDATE = "UPDATE cargo SET description = ?, weight = ?, destination = ?, voyage_plan_id = ? WHERE cargo_id = ?";
    private static final String DELETE = "DELETE FROM cargo WHERE cargo_id = ?";
    private static final String SELECT_MONTHLY_STATS = 
            "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, " +
            "SUM(weight) as total_weight, " +
            "SUM(CASE WHEN voyage_plan_id IS NOT NULL THEN weight ELSE 0 END) as assigned_weight " +
            "FROM cargo " +
            "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) " +
            "GROUP BY DATE_FORMAT(created_at, '%Y-%m') " +
            "ORDER BY month";

    public List<Cargo> findPendingCargo() throws SQLException {
        List<Cargo> cargoList = new ArrayList<>();
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                cargoList.add(mapRow(resultSet));
            }
        }
        return cargoList;
    }

    public List<Cargo> searchByKeyword(String keyword) throws SQLException {
        List<Cargo> cargoList = new ArrayList<>();
        String like = "%" + keyword.toLowerCase() + "%";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BY_KEYWORD)) {
            statement.setString(1, like);
            statement.setString(2, like);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    cargoList.add(mapRow(resultSet));
                }
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
            if (cargo.getShipId() == null) {
                statement.setNull(4, java.sql.Types.INTEGER);
            } else {
                statement.setInt(4, cargo.getShipId());
            }
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

    public void update(int cargoId, Cargo cargo) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            statement.setString(1, cargo.getDescription());
            statement.setDouble(2, cargo.getWeight());
            statement.setString(3, cargo.getDestination());
            if (cargo.getShipId() == null) {
                statement.setNull(4, java.sql.Types.INTEGER);
            } else {
                statement.setInt(4, cargo.getShipId());
            }
            statement.setInt(5, cargoId);
            statement.executeUpdate();
        }
    }

    public void delete(int cargoId) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setInt(1, cargoId);
            statement.executeUpdate();
        }
    }

    public boolean existsById(int cargoId) throws SQLException {
        String sql = "SELECT 1 FROM cargo WHERE cargo_id = ?";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, cargoId);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    // 获取月度货物统计数据
    public List<java.util.Map<String, Object>> getMonthlyStats() throws SQLException {
        List<java.util.Map<String, Object>> stats = new ArrayList<>();
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_MONTHLY_STATS);
             ResultSet rs = statement.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.HashMap<>();
                row.put("month", rs.getString("month"));
                row.put("totalWeight", rs.getDouble("total_weight"));
                row.put("assignedWeight", rs.getDouble("assigned_weight"));
                stats.add(row);
            }
        }
        return stats;
    }

    private Cargo mapRow(ResultSet resultSet) throws SQLException {
        Cargo cargo = new Cargo();
        cargo.setCargoId(resultSet.getInt("cargo_id"));
        cargo.setDescription(resultSet.getString("description"));
        cargo.setWeight(resultSet.getDouble("weight"));
        cargo.setDestination(resultSet.getString("destination"));
        Integer shipId = resultSet.getObject("ship_id") == null ? null : resultSet.getInt("ship_id");
        cargo.setShipId(shipId);
        // 设置船舶名称（通过JOIN查询获取）
        cargo.setShipName(resultSet.getString("ship_name"));
        return cargo;
    }
}
