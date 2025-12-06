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

    // SQL常量（字段顺序与数据库表一致）
    private static final String INSERT = "INSERT INTO berth_schedule (ship_id, berth_number, arrival_time, departure_time, status) VALUES (?, ?, ?, ?, ?)";
    private static final String SELECT_UPCOMING = "SELECT berth_id, ship_id, berth_number, arrival_time, departure_time, status FROM berth_schedule WHERE arrival_time > NOW() AND status NOT IN ('CANCELLED') ORDER BY arrival_time LIMIT 20";
    private static final String SELECT_CONFLICTS = "SELECT berth_id FROM berth_schedule " +
            "WHERE berth_number = ? " +
            "AND status NOT IN ('CANCELLED') " +
            "AND arrival_time < ? " +
            "AND (departure_time IS NULL OR departure_time > ?)";
    private static final String SELECT_BY_DATE = "SELECT berth_id, ship_id, berth_number, arrival_time, departure_time, status " +
            "FROM berth_schedule " +
            "WHERE DATE(arrival_time) = ? " +
            "ORDER BY arrival_time";
    private static final String UPDATE_STATUS = "UPDATE berth_schedule SET status = ? WHERE berth_id = ?";
    private static final String SELECT_ALL = "SELECT berth_id, ship_id, berth_number, arrival_time, departure_time, status FROM berth_schedule ORDER BY arrival_time";
    private static final String UPDATE = "UPDATE berth_schedule SET ship_id = ?, berth_number = ?, arrival_time = ?, departure_time = ?, status = ? WHERE berth_id = ?";
    private static final String DELETE = "DELETE FROM berth_schedule WHERE berth_id = ?";
    private static final String SELECT_CONFLICTS_EXCLUDING_SELF = "SELECT berth_id FROM berth_schedule " +
            "WHERE berth_number = ? " +
            "AND berth_id != ? " +
            "AND status NOT IN ('CANCELLED') " +
            "AND arrival_time < ? " +
            "AND (departure_time IS NULL OR departure_time > ?)";

    // 构造器注入DatabaseManager
    public BerthScheduleRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    // 保存排程（已删除setBerthId错误代码）
    public void save(BerthSchedule schedule) throws SQLException {
        System.out.println("Repository save方法执行，参数：" + schedule);
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT)) { // 移除Statement.RETURN_GENERATED_KEYS，避免获取自增ID
            // 参数顺序：与INSERT SQL字段顺序完全一致
            stmt.setInt(1, schedule.getShipId());
            stmt.setString(2, schedule.getBerthNumber());
            stmt.setTimestamp(3, Timestamp.valueOf(schedule.getArrivalTime()));
            stmt.setTimestamp(4, schedule.getDepartureTime() != null ? Timestamp.valueOf(schedule.getDepartureTime()) : null);
            stmt.setString(5, schedule.getStatus());

            int affectedRows = stmt.executeUpdate();
            System.out.println("Repository执行影响行数：" + affectedRows); // 正常应返回1（表示插入成功）
        } catch (SQLException e) {
            System.out.println("Repository save报错：" + e.getMessage());
            throw e; // 抛出异常，让Service层处理
        }
    }

    // 泊位冲突检测
    public boolean hasConflict(String berthNumber, LocalDateTime arrivalTime, LocalDateTime departureTime) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_CONFLICTS)) {
            stmt.setString(1, berthNumber);
            // 冲突条件：当前排程的到达时间 < 已有排程的离开时间，且当前排程的离开时间 > 已有排程的到达时间
            stmt.setTimestamp(2, Timestamp.valueOf(departureTime != null ? departureTime : LocalDateTime.now().plusYears(10)));
            stmt.setTimestamp(3, Timestamp.valueOf(arrivalTime));
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
        return new BerthSchedule(
                rs.getInt("berth_id"), // 对应实体的getId()（berth_id主键）
                rs.getInt("ship_id"),
                rs.getString("berth_number"),
                rs.getTimestamp("arrival_time").toLocalDateTime(),
                rs.getTimestamp("departure_time") != null ? rs.getTimestamp("departure_time").toLocalDateTime() : null,
                rs.getString("status")
        );
    }

    // 更新排程
    public void update(BerthSchedule schedule) throws SQLException {
        System.out.println("Repository update方法执行，参数：" + schedule);
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            stmt.setInt(1, schedule.getShipId());
            stmt.setString(2, schedule.getBerthNumber());
            stmt.setTimestamp(3, Timestamp.valueOf(schedule.getArrivalTime()));
            stmt.setTimestamp(4, schedule.getDepartureTime() != null ? Timestamp.valueOf(schedule.getDepartureTime()) : null);
            stmt.setString(5, schedule.getStatus());
            stmt.setInt(6, schedule.getId());

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
    public boolean hasConflictExcludingSelf(int scheduleId, String berthNumber, LocalDateTime arrivalTime, LocalDateTime departureTime) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_CONFLICTS_EXCLUDING_SELF)) {
            stmt.setString(1, berthNumber);
            stmt.setInt(2, scheduleId);
            stmt.setTimestamp(3, Timestamp.valueOf(departureTime != null ? departureTime : LocalDateTime.now().plusYears(10)));
            stmt.setTimestamp(4, Timestamp.valueOf(arrivalTime));
            return stmt.executeQuery().next();
        }
    }
}