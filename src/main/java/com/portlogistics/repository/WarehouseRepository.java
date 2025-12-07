package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.Warehouse;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class WarehouseRepository {
    private final DatabaseManager databaseManager;

    private static final String INSERT = "INSERT INTO warehouse (warehouse_name, port_id, warehouse_type, total_capacity, used_capacity, location) VALUES (?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL = "SELECT warehouse_id, warehouse_name, port_id, warehouse_type, total_capacity, used_capacity, location, created_at FROM warehouse ORDER BY warehouse_id";
    private static final String SELECT_BY_ID = "SELECT warehouse_id, warehouse_name, port_id, warehouse_type, total_capacity, used_capacity, location, created_at FROM warehouse WHERE warehouse_id = ?";
    private static final String UPDATE = "UPDATE warehouse SET warehouse_name = ?, port_id = ?, warehouse_type = ?, total_capacity = ?, used_capacity = ?, location = ? WHERE warehouse_id = ?";
    private static final String DELETE = "DELETE FROM warehouse WHERE warehouse_id = ?";
    private static final String SEARCH = "SELECT warehouse_id, warehouse_name, port_id, warehouse_type, total_capacity, used_capacity, location, created_at FROM warehouse WHERE LOWER(warehouse_name) LIKE ? OR LOWER(location) LIKE ? ORDER BY warehouse_id";

    public WarehouseRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public void save(Warehouse warehouse) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, warehouse.getWarehouseName());
            if (warehouse.getPortId() != null) {
                stmt.setInt(2, warehouse.getPortId());
            } else {
                stmt.setNull(2, Types.INTEGER);
            }
            stmt.setString(3, warehouse.getWarehouseType());
            stmt.setBigDecimal(4, warehouse.getTotalCapacity());
            stmt.setBigDecimal(5, warehouse.getUsedCapacity() != null ? warehouse.getUsedCapacity() : BigDecimal.ZERO);
            stmt.setString(6, warehouse.getLocation());
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                warehouse.setWarehouseId(rs.getInt(1));
            }
        }
    }

    public List<Warehouse> findAll() throws SQLException {
        List<Warehouse> warehouses = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_ALL);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                warehouses.add(mapRow(rs));
            }
        }
        return warehouses;
    }


    public Warehouse findById(int warehouseId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_ID)) {
            stmt.setInt(1, warehouseId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
        }
        return null;
    }

    public List<Warehouse> search(String keyword) throws SQLException {
        List<Warehouse> warehouses = new ArrayList<>();
        String like = "%" + keyword.toLowerCase() + "%";
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SEARCH)) {
            stmt.setString(1, like);
            stmt.setString(2, like);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                warehouses.add(mapRow(rs));
            }
        }
        return warehouses;
    }

    public void update(Warehouse warehouse) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            stmt.setString(1, warehouse.getWarehouseName());
            if (warehouse.getPortId() != null) {
                stmt.setInt(2, warehouse.getPortId());
            } else {
                stmt.setNull(2, Types.INTEGER);
            }
            stmt.setString(3, warehouse.getWarehouseType());
            stmt.setBigDecimal(4, warehouse.getTotalCapacity());
            stmt.setBigDecimal(5, warehouse.getUsedCapacity() != null ? warehouse.getUsedCapacity() : BigDecimal.ZERO);
            stmt.setString(6, warehouse.getLocation());
            stmt.setInt(7, warehouse.getWarehouseId());
            stmt.executeUpdate();
        }
    }

    public void deleteById(int warehouseId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(DELETE)) {
            stmt.setInt(1, warehouseId);
            stmt.executeUpdate();
        }
    }

    private Warehouse mapRow(ResultSet rs) throws SQLException {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseId(rs.getInt("warehouse_id"));
        warehouse.setWarehouseName(rs.getString("warehouse_name"));
        int portId = rs.getInt("port_id");
        warehouse.setPortId(rs.wasNull() ? null : portId);
        warehouse.setWarehouseType(rs.getString("warehouse_type"));
        warehouse.setTotalCapacity(rs.getBigDecimal("total_capacity"));
        warehouse.setUsedCapacity(rs.getBigDecimal("used_capacity"));
        warehouse.setLocation(rs.getString("location"));
        warehouse.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return warehouse;
    }
}
