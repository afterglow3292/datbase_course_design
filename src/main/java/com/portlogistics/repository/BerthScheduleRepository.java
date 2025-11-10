package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.BerthSchedule;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class BerthScheduleRepository {
    private static final String INSERT =
            "INSERT INTO berth_schedule (ship_id, berth_number, arrival_time, departure_time, status) " +
            "VALUES (?, ?, ?, ?, ?)";
    private static final String SELECT_UPCOMING =
            "SELECT berth_id, ship_id, berth_number, arrival_time, departure_time, status " +
            "FROM berth_schedule ORDER BY arrival_time LIMIT 20";

    public void save(BerthSchedule schedule) throws SQLException {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT)) {
            statement.setInt(1, schedule.getShipId());
            statement.setString(2, schedule.getBerthNumber());
            statement.setTimestamp(3, Timestamp.valueOf(schedule.getArrivalTime()));
            if (schedule.getDepartureTime() == null) {
                statement.setNull(4, java.sql.Types.TIMESTAMP);
            } else {
                statement.setTimestamp(4, Timestamp.valueOf(schedule.getDepartureTime()));
            }
            statement.setString(5, schedule.getStatus());
            statement.executeUpdate();
        }
    }

    public List<BerthSchedule> findUpcomingSchedules() throws SQLException {
        List<BerthSchedule> schedules = new ArrayList<>();
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_UPCOMING);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                schedules.add(mapRow(resultSet));
            }
        }
        return schedules;
    }

    private BerthSchedule mapRow(ResultSet resultSet) throws SQLException {
        Timestamp departure = resultSet.getTimestamp("departure_time");
        return new BerthSchedule(
                resultSet.getInt("berth_id"),
                resultSet.getInt("ship_id"),
                resultSet.getString("berth_number"),
                resultSet.getTimestamp("arrival_time").toLocalDateTime(),
                departure == null ? null : departure.toLocalDateTime(),
                resultSet.getString("status")
        );
    }
}
