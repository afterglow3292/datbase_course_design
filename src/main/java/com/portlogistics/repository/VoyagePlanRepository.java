package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.VoyagePlan;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class VoyagePlanRepository {
    private final DatabaseManager databaseManager;

    private static final String INSERT = "INSERT INTO voyage_plan (voyage_number, ship_id, departure_port_id, arrival_port_id, assigned_berth_id, planned_departure, planned_arrival, actual_departure, actual_arrival, voyage_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL = "SELECT vp.plan_id, vp.voyage_number, vp.ship_id, s.name as ship_name, vp.departure_port_id, vp.arrival_port_id, vp.assigned_berth_id, vp.planned_departure, vp.planned_arrival, vp.actual_departure, vp.actual_arrival, vp.voyage_status, vp.created_by, vp.created_at, dp.port_name as departure_port_name, ap.port_name as arrival_port_name FROM voyage_plan vp LEFT JOIN ship s ON vp.ship_id = s.ship_id LEFT JOIN port dp ON vp.departure_port_id = dp.port_id LEFT JOIN port ap ON vp.arrival_port_id = ap.port_id ORDER BY vp.planned_departure DESC";
    private static final String SELECT_BY_ID = "SELECT vp.plan_id, vp.voyage_number, vp.ship_id, s.name as ship_name, vp.departure_port_id, vp.arrival_port_id, vp.assigned_berth_id, vp.planned_departure, vp.planned_arrival, vp.actual_departure, vp.actual_arrival, vp.voyage_status, vp.created_by, vp.created_at, dp.port_name as departure_port_name, ap.port_name as arrival_port_name FROM voyage_plan vp LEFT JOIN ship s ON vp.ship_id = s.ship_id LEFT JOIN port dp ON vp.departure_port_id = dp.port_id LEFT JOIN port ap ON vp.arrival_port_id = ap.port_id WHERE vp.plan_id = ?";
    private static final String UPDATE = "UPDATE voyage_plan SET voyage_number = ?, ship_id = ?, departure_port_id = ?, arrival_port_id = ?, assigned_berth_id = ?, planned_departure = ?, planned_arrival = ?, actual_departure = ?, actual_arrival = ?, voyage_status = ? WHERE plan_id = ?";
    private static final String DELETE = "DELETE FROM voyage_plan WHERE plan_id = ?";
    private static final String CHECK_VOYAGE_NUMBER = "SELECT plan_id FROM voyage_plan WHERE voyage_number = ? AND plan_id != ?";

    public VoyagePlanRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public void save(VoyagePlan plan) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, plan.getVoyageNumber());
            stmt.setInt(2, plan.getShipId());
            stmt.setInt(3, plan.getDeparturePortId());
            stmt.setInt(4, plan.getArrivalPortId());
            if (plan.getAssignedBerthId() != null) {
                stmt.setInt(5, plan.getAssignedBerthId());
            } else {
                stmt.setNull(5, Types.INTEGER);
            }
            stmt.setTimestamp(6, Timestamp.valueOf(plan.getPlannedDeparture()));
            stmt.setTimestamp(7, Timestamp.valueOf(plan.getPlannedArrival()));
            stmt.setTimestamp(8, plan.getActualDeparture() != null ? Timestamp.valueOf(plan.getActualDeparture()) : null);
            stmt.setTimestamp(9, plan.getActualArrival() != null ? Timestamp.valueOf(plan.getActualArrival()) : null);
            stmt.setString(10, plan.getVoyageStatus());
            if (plan.getCreatedBy() != null) {
                stmt.setInt(11, plan.getCreatedBy());
            } else {
                stmt.setNull(11, Types.INTEGER);
            }
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                plan.setPlanId(rs.getInt(1));
            }
        }
    }

    public List<VoyagePlan> findAll() throws SQLException {
        List<VoyagePlan> plans = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_ALL);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                plans.add(mapRow(rs));
            }
        }
        return plans;
    }

    public VoyagePlan findById(int planId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_ID)) {
            stmt.setInt(1, planId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
        }
        return null;
    }

    public void update(VoyagePlan plan) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            stmt.setString(1, plan.getVoyageNumber());
            stmt.setInt(2, plan.getShipId());
            stmt.setInt(3, plan.getDeparturePortId());
            stmt.setInt(4, plan.getArrivalPortId());
            if (plan.getAssignedBerthId() != null) {
                stmt.setInt(5, plan.getAssignedBerthId());
            } else {
                stmt.setNull(5, Types.INTEGER);
            }
            stmt.setTimestamp(6, Timestamp.valueOf(plan.getPlannedDeparture()));
            stmt.setTimestamp(7, Timestamp.valueOf(plan.getPlannedArrival()));
            stmt.setTimestamp(8, plan.getActualDeparture() != null ? Timestamp.valueOf(plan.getActualDeparture()) : null);
            stmt.setTimestamp(9, plan.getActualArrival() != null ? Timestamp.valueOf(plan.getActualArrival()) : null);
            stmt.setString(10, plan.getVoyageStatus());
            stmt.setInt(11, plan.getPlanId());
            stmt.executeUpdate();
        }
    }

    public void deleteById(int planId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(DELETE)) {
            stmt.setInt(1, planId);
            stmt.executeUpdate();
        }
    }

    public boolean isVoyageNumberExists(String voyageNumber, int excludeId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(CHECK_VOYAGE_NUMBER)) {
            stmt.setString(1, voyageNumber);
            stmt.setInt(2, excludeId);
            return stmt.executeQuery().next();
        }
    }

    private VoyagePlan mapRow(ResultSet rs) throws SQLException {
        VoyagePlan plan = new VoyagePlan();
        plan.setPlanId(rs.getInt("plan_id"));
        plan.setVoyageNumber(rs.getString("voyage_number"));
        plan.setShipId(rs.getInt("ship_id"));
        plan.setDeparturePortId(rs.getInt("departure_port_id"));
        plan.setArrivalPortId(rs.getInt("arrival_port_id"));
        int berthId = rs.getInt("assigned_berth_id");
        plan.setAssignedBerthId(rs.wasNull() ? null : berthId);
        plan.setPlannedDeparture(rs.getTimestamp("planned_departure").toLocalDateTime());
        plan.setPlannedArrival(rs.getTimestamp("planned_arrival").toLocalDateTime());
        Timestamp actualDep = rs.getTimestamp("actual_departure");
        plan.setActualDeparture(actualDep != null ? actualDep.toLocalDateTime() : null);
        Timestamp actualArr = rs.getTimestamp("actual_arrival");
        plan.setActualArrival(actualArr != null ? actualArr.toLocalDateTime() : null);
        plan.setVoyageStatus(rs.getString("voyage_status"));
        int createdBy = rs.getInt("created_by");
        plan.setCreatedBy(rs.wasNull() ? null : createdBy);
        plan.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        // 设置港口名称（来自JOIN查询）
        plan.setDeparturePortName(rs.getString("departure_port_name"));
        plan.setArrivalPortName(rs.getString("arrival_port_name"));
        // 设置船舶名称（来自JOIN查询）
        plan.setShipName(rs.getString("ship_name"));
        return plan;
    }
}
