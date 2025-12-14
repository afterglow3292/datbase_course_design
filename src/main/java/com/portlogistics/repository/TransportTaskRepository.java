package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.TransportTask;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TransportTaskRepository {
    private final DatabaseManager databaseManager;

    private static final String INSERT = "INSERT INTO transport_task (task_number, cargo_id, truck_license, driver_name, driver_phone, pickup_location, delivery_location, planned_pickup, actual_pickup, planned_delivery, actual_delivery, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL = "SELECT task_id, task_number, cargo_id, truck_license, driver_name, driver_phone, pickup_location, delivery_location, planned_pickup, actual_pickup, planned_delivery, actual_delivery, status, created_at FROM transport_task ORDER BY created_at DESC";
    private static final String SELECT_BY_ID = "SELECT task_id, task_number, cargo_id, truck_license, driver_name, driver_phone, pickup_location, delivery_location, planned_pickup, actual_pickup, planned_delivery, actual_delivery, status, created_at FROM transport_task WHERE task_id = ?";
    private static final String UPDATE = "UPDATE transport_task SET task_number = ?, cargo_id = ?, truck_license = ?, driver_name = ?, driver_phone = ?, pickup_location = ?, delivery_location = ?, planned_pickup = ?, actual_pickup = ?, planned_delivery = ?, actual_delivery = ?, status = ? WHERE task_id = ?";
    private static final String DELETE = "DELETE FROM transport_task WHERE task_id = ?";
    private static final String CHECK_TASK_NUMBER = "SELECT task_id FROM transport_task WHERE task_number = ? AND task_id != ?";

    public TransportTaskRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public void save(TransportTask task) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, task.getTaskNumber());
            if (task.getCargoId() != null) {
                stmt.setInt(2, task.getCargoId());
            } else {
                stmt.setNull(2, Types.INTEGER);
            }
            stmt.setString(3, task.getTruckLicense());
            stmt.setString(4, task.getDriverName());
            stmt.setString(5, task.getDriverPhone());
            stmt.setString(6, task.getPickupLocation());
            stmt.setString(7, task.getDeliveryLocation());
            stmt.setTimestamp(8, task.getPlannedPickup() != null ? Timestamp.valueOf(task.getPlannedPickup()) : null);
            stmt.setTimestamp(9, task.getActualPickup() != null ? Timestamp.valueOf(task.getActualPickup()) : null);
            stmt.setTimestamp(10, task.getPlannedDelivery() != null ? Timestamp.valueOf(task.getPlannedDelivery()) : null);
            stmt.setTimestamp(11, task.getActualDelivery() != null ? Timestamp.valueOf(task.getActualDelivery()) : null);
            stmt.setString(12, task.getStatus());
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                task.setTaskId(rs.getInt(1));
            }
        }
    }


    public List<TransportTask> findAll() throws SQLException {
        List<TransportTask> tasks = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_ALL);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                tasks.add(mapRow(rs));
            }
        }
        return tasks;
    }

    public TransportTask findById(int taskId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_ID)) {
            stmt.setInt(1, taskId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
        }
        return null;
    }

    public void update(TransportTask task) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            stmt.setString(1, task.getTaskNumber());
            if (task.getCargoId() != null) {
                stmt.setInt(2, task.getCargoId());
            } else {
                stmt.setNull(2, Types.INTEGER);
            }
            stmt.setString(3, task.getTruckLicense());
            stmt.setString(4, task.getDriverName());
            stmt.setString(5, task.getDriverPhone());
            stmt.setString(6, task.getPickupLocation());
            stmt.setString(7, task.getDeliveryLocation());
            stmt.setTimestamp(8, task.getPlannedPickup() != null ? Timestamp.valueOf(task.getPlannedPickup()) : null);
            stmt.setTimestamp(9, task.getActualPickup() != null ? Timestamp.valueOf(task.getActualPickup()) : null);
            stmt.setTimestamp(10, task.getPlannedDelivery() != null ? Timestamp.valueOf(task.getPlannedDelivery()) : null);
            stmt.setTimestamp(11, task.getActualDelivery() != null ? Timestamp.valueOf(task.getActualDelivery()) : null);
            stmt.setString(12, task.getStatus());
            stmt.setInt(13, task.getTaskId());
            stmt.executeUpdate();
        }
    }

    public void deleteById(int taskId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(DELETE)) {
            stmt.setInt(1, taskId);
            stmt.executeUpdate();
        }
    }

    public boolean isTaskNumberExists(String taskNumber, int excludeId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(CHECK_TASK_NUMBER)) {
            stmt.setString(1, taskNumber);
            stmt.setInt(2, excludeId);
            return stmt.executeQuery().next();
        }
    }

    private TransportTask mapRow(ResultSet rs) throws SQLException {
        TransportTask task = new TransportTask();
        task.setTaskId(rs.getInt("task_id"));
        task.setTaskNumber(rs.getString("task_number"));
        int cargoId = rs.getInt("cargo_id");
        task.setCargoId(rs.wasNull() ? null : cargoId);
        task.setTruckLicense(rs.getString("truck_license"));
        task.setDriverName(rs.getString("driver_name"));
        task.setDriverPhone(rs.getString("driver_phone"));
        task.setPickupLocation(rs.getString("pickup_location"));
        task.setDeliveryLocation(rs.getString("delivery_location"));
        Timestamp plannedPickup = rs.getTimestamp("planned_pickup");
        task.setPlannedPickup(plannedPickup != null ? plannedPickup.toLocalDateTime() : null);
        Timestamp actualPickup = rs.getTimestamp("actual_pickup");
        task.setActualPickup(actualPickup != null ? actualPickup.toLocalDateTime() : null);
        Timestamp plannedDelivery = rs.getTimestamp("planned_delivery");
        task.setPlannedDelivery(plannedDelivery != null ? plannedDelivery.toLocalDateTime() : null);
        Timestamp actualDelivery = rs.getTimestamp("actual_delivery");
        task.setActualDelivery(actualDelivery != null ? actualDelivery.toLocalDateTime() : null);
        task.setStatus(rs.getString("status"));
        task.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return task;
    }
}
