package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.BerthSchedule;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class BerthScheduleRepository {
    private final DatabaseManager databaseManager;

    // SQL常量（使用新的berth表，current_vessel_id代替ship_id，包含port_id、港口名称和船舶名称）
    private static final String INSERT = "INSERT INTO berth (berth_number, port_id, current_vessel_id, arrival_time, departure_time, status) VALUES (?, ?, ?, ?, ?, ?)";
    private static final String SELECT_UPCOMING = "SELECT b.berth_id, b.current_vessel_id as ship_id, b.port_id, p.port_name, s.name as ship_name, b.berth_number, b.arrival_time, b.departure_time, b.status " +
            "FROM berth b LEFT JOIN port p ON b.port_id = p.port_id LEFT JOIN ship s ON b.current_vessel_id = s.ship_id " +
            "WHERE b.arrival_time > NOW() AND b.status NOT IN ('CANCELLED') ORDER BY b.arrival_time LIMIT 20";
    private static final String SELECT_CONFLICTS = "SELECT berth_id FROM berth " +
            "WHERE berth_number = ? " +
            "AND port_id = ? " +
            "AND status NOT IN ('CANCELLED') " +
            "AND arrival_time < ? " +
            "AND (departure_time IS NULL OR departure_time > ?)";
    private static final String SELECT_BY_DATE = "SELECT b.berth_id, b.current_vessel_id as ship_id, b.port_id, p.port_name, s.name as ship_name, b.berth_number, b.arrival_time, b.departure_time, b.status " +
            "FROM berth b LEFT JOIN port p ON b.port_id = p.port_id LEFT JOIN ship s ON b.current_vessel_id = s.ship_id " +
            "WHERE DATE(b.arrival_time) = ? " +
            "ORDER BY b.arrival_time";
    private static final String UPDATE_STATUS = "UPDATE berth SET status = ? WHERE berth_id = ?";
    private static final String SELECT_ALL = "SELECT b.berth_id, b.current_vessel_id as ship_id, b.port_id, p.port_name, s.name as ship_name, b.berth_number, b.arrival_time, b.departure_time, b.status " +
            "FROM berth b LEFT JOIN port p ON b.port_id = p.port_id LEFT JOIN ship s ON b.current_vessel_id = s.ship_id ORDER BY b.berth_id";
    private static final String UPDATE = "UPDATE berth SET current_vessel_id = ?, berth_number = ?, port_id = ?, arrival_time = ?, departure_time = ?, status = ? WHERE berth_id = ?";
    private static final String DELETE = "DELETE FROM berth WHERE berth_id = ?";
    private static final String SELECT_CONFLICTS_EXCLUDING_SELF = "SELECT berth_id FROM berth " +
            "WHERE berth_number = ? " +
            "AND port_id = ? " +
            "AND berth_id != ? " +
            "AND status NOT IN ('CANCELLED') " +
            "AND arrival_time < ? " +
            "AND (departure_time IS NULL OR departure_time > ?)";

    // 构造器注入DatabaseManager
    public BerthScheduleRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    // 保存排程
    public void save(BerthSchedule schedule) throws SQLException {
        System.out.println("Repository save方法执行，参数：" + schedule);
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT)) {
            // 参数顺序：berth_number, port_id, current_vessel_id, arrival_time, departure_time, status
            stmt.setString(1, schedule.getBerthNumber());           // berth_number
            stmt.setInt(2, schedule.getPortId() > 0 ? schedule.getPortId() : 1); // port_id，默认1
            // current_vessel_id 可以为空
            if (schedule.getShipId() > 0) {
                stmt.setInt(3, schedule.getShipId());
            } else {
                stmt.setNull(3, java.sql.Types.INTEGER);
            }
            // arrival_time 可以为空
            if (schedule.getArrivalTime() != null) {
                stmt.setTimestamp(4, Timestamp.valueOf(schedule.getArrivalTime()));
            } else {
                stmt.setNull(4, java.sql.Types.TIMESTAMP);
            }
            stmt.setTimestamp(5, schedule.getDepartureTime() != null ? Timestamp.valueOf(schedule.getDepartureTime()) : null); // departure_time
            stmt.setString(6, schedule.getStatus() != null ? schedule.getStatus() : "AVAILABLE"); // status

            int affectedRows = stmt.executeUpdate();
            System.out.println("Repository执行影响行数：" + affectedRows);
        } catch (SQLException e) {
            System.out.println("Repository save报错：" + e.getMessage());
            throw e;
        }
    }

    // 泊位冲突检测
    public boolean hasConflict(String berthNumber, int portId, LocalDateTime arrivalTime, LocalDateTime departureTime) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_CONFLICTS)) {
            stmt.setString(1, berthNumber);
            stmt.setInt(2, portId > 0 ? portId : 1);
            // 冲突条件：当前排程的到达时间 < 已有排程的离开时间，且当前排程的离开时间 > 已有排程的到达时间
            stmt.setTimestamp(3, Timestamp.valueOf(departureTime != null ? departureTime : LocalDateTime.now().plusYears(10)));
            stmt.setTimestamp(4, Timestamp.valueOf(arrivalTime));
            // 若查询到结果，说明存在冲突
            return stmt.executeQuery().next();
        }
    }

    // 按日期查询排程
    public List<BerthSchedule> findByDate(LocalDate date) throws SQLException {
        List<BerthSchedule> schedules = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_DATE)) {
            stmt.setDate(1, Date.valueOf(date));
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                schedules.add(mapRow(rs));
            }
        }
        return schedules;
    }

    // 更新排程状态
    public void updateStatus(int berthScheduleId, String newStatus) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE_STATUS)) {
            stmt.setString(1, newStatus);
            stmt.setInt(2, berthScheduleId);
            stmt.executeUpdate();
        }
    }

    // 查询即将到来的排程（前20条）
    public List<BerthSchedule> findUpcomingSchedules() throws SQLException {
        List<BerthSchedule> schedules = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_UPCOMING);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                schedules.add(mapRow(rs));
            }
        }
        return schedules;
    }

    // 查询所有排程（供前端表格加载）
    public List<BerthSchedule> findAll() throws SQLException {
        List<BerthSchedule> schedules = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_ALL);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                schedules.add(mapRow(rs));
            }
        }
        return schedules;
    }

    // 结果集映射：将数据库查询结果转为BerthSchedule实体
    private BerthSchedule mapRow(ResultSet rs) throws SQLException {
        Timestamp arrivalTs = rs.getTimestamp("arrival_time");
        Timestamp departureTs = rs.getTimestamp("departure_time");
        BerthSchedule schedule = new BerthSchedule(
                rs.getInt("berth_id"),
                rs.getInt("ship_id"),  // 别名映射自 current_vessel_id
                rs.getInt("port_id"),
                rs.getString("berth_number"),
                arrivalTs != null ? arrivalTs.toLocalDateTime() : null,
                departureTs != null ? departureTs.toLocalDateTime() : null,
                rs.getString("status")
        );
        // 设置港口名称
        try {
            schedule.setPortName(rs.getString("port_name"));
        } catch (SQLException e) {
            // 某些查询可能没有port_name字段
        }
        // 设置船舶名称
        try {
            schedule.setShipName(rs.getString("ship_name"));
        } catch (SQLException e) {
            // 某些查询可能没有ship_name字段
        }
        return schedule;
    }

    // 更新排程
    public void update(BerthSchedule schedule) throws SQLException {
        System.out.println("Repository update方法执行，参数：" + schedule);
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            // UPDATE: current_vessel_id, berth_number, port_id, arrival_time, departure_time, status WHERE berth_id
            // current_vessel_id 可以为空
            if (schedule.getShipId() > 0) {
                stmt.setInt(1, schedule.getShipId());
            } else {
                stmt.setNull(1, java.sql.Types.INTEGER);
            }
            stmt.setString(2, schedule.getBerthNumber());
            stmt.setInt(3, schedule.getPortId() > 0 ? schedule.getPortId() : 1);
            // arrival_time 可以为空
            if (schedule.getArrivalTime() != null) {
                stmt.setTimestamp(4, Timestamp.valueOf(schedule.getArrivalTime()));
            } else {
                stmt.setNull(4, java.sql.Types.TIMESTAMP);
            }
            stmt.setTimestamp(5, schedule.getDepartureTime() != null ? Timestamp.valueOf(schedule.getDepartureTime()) : null);
            stmt.setString(6, schedule.getStatus() != null ? schedule.getStatus() : "AVAILABLE");
            stmt.setInt(7, schedule.getId());

            int affectedRows = stmt.executeUpdate();
            System.out.println("Repository update影响行数：" + affectedRows);
        } catch (SQLException e) {
            System.out.println("Repository update报错：" + e.getMessage());
            throw e;
        }
    }

    // 删除排程
    public void deleteById(int scheduleId) throws SQLException {
        System.out.println("Repository deleteById方法执行，ID：" + scheduleId);
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(DELETE)) {
            stmt.setInt(1, scheduleId);
            int affectedRows = stmt.executeUpdate();
            System.out.println("Repository delete影响行数：" + affectedRows);
        } catch (SQLException e) {
            System.out.println("Repository delete报错：" + e.getMessage());
            throw e;
        }
    }

    // 泊位冲突检测（排除自身，用于更新时）
    public boolean hasConflictExcludingSelf(int scheduleId, String berthNumber, int portId, LocalDateTime arrivalTime, LocalDateTime departureTime) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_CONFLICTS_EXCLUDING_SELF)) {
            stmt.setString(1, berthNumber);
            stmt.setInt(2, portId > 0 ? portId : 1);
            stmt.setInt(3, scheduleId);
            stmt.setTimestamp(4, Timestamp.valueOf(departureTime != null ? departureTime : LocalDateTime.now().plusYears(10)));
            stmt.setTimestamp(5, Timestamp.valueOf(arrivalTime));
            return stmt.executeQuery().next();
        }
    }
}