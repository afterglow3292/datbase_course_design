package com.portlogistics.repository;

import com.portlogistics.config.DatabaseManager;
import com.portlogistics.model.Port;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PortRepository {
    private final DatabaseManager databaseManager;

    private static final String INSERT = "INSERT INTO port (port_code, port_name, country, city, latitude, longitude, total_berths, max_vessel_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String SELECT_ALL = "SELECT port_id, port_code, port_name, country, city, latitude, longitude, total_berths, max_vessel_size, created_at FROM port ORDER BY port_name";
    private static final String SELECT_BY_ID = "SELECT port_id, port_code, port_name, country, city, latitude, longitude, total_berths, max_vessel_size, created_at FROM port WHERE port_id = ?";
    private static final String UPDATE = "UPDATE port SET port_code = ?, port_name = ?, country = ?, city = ?, latitude = ?, longitude = ?, total_berths = ?, max_vessel_size = ? WHERE port_id = ?";
    private static final String DELETE = "DELETE FROM port WHERE port_id = ?";
    private static final String CHECK_PORT_CODE = "SELECT port_id FROM port WHERE port_code = ? AND port_id != ?";

    public PortRepository(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public void save(Port port) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, port.getPortCode());
            stmt.setString(2, port.getPortName());
            stmt.setString(3, port.getCountry());
            stmt.setString(4, port.getCity());
            stmt.setBigDecimal(5, port.getLatitude());
            stmt.setBigDecimal(6, port.getLongitude());
            stmt.setInt(7, port.getTotalBerths());
            stmt.setBigDecimal(8, port.getMaxVesselSize());
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                port.setPortId(rs.getInt(1));
            }
        }
    }

    public List<Port> findAll() throws SQLException {
        List<Port> ports = new ArrayList<>();
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_ALL);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ports.add(mapRow(rs));
            }
        }
        return ports;
    }


    public Port findById(int portId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BY_ID)) {
            stmt.setInt(1, portId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
        }
        return null;
    }

    public void update(Port port) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(UPDATE)) {
            stmt.setString(1, port.getPortCode());
            stmt.setString(2, port.getPortName());
            stmt.setString(3, port.getCountry());
            stmt.setString(4, port.getCity());
            stmt.setBigDecimal(5, port.getLatitude());
            stmt.setBigDecimal(6, port.getLongitude());
            stmt.setInt(7, port.getTotalBerths());
            stmt.setBigDecimal(8, port.getMaxVesselSize());
            stmt.setInt(9, port.getPortId());
            stmt.executeUpdate();
        }
    }

    public void deleteById(int portId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(DELETE)) {
            stmt.setInt(1, portId);
            stmt.executeUpdate();
        }
    }

    public boolean isPortCodeExists(String portCode, int excludeId) throws SQLException {
        try (Connection conn = databaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(CHECK_PORT_CODE)) {
            stmt.setString(1, portCode);
            stmt.setInt(2, excludeId);
            return stmt.executeQuery().next();
        }
    }

    private Port mapRow(ResultSet rs) throws SQLException {
        Port port = new Port();
        port.setPortId(rs.getInt("port_id"));
        port.setPortCode(rs.getString("port_code"));
        port.setPortName(rs.getString("port_name"));
        port.setCountry(rs.getString("country"));
        port.setCity(rs.getString("city"));
        port.setLatitude(rs.getBigDecimal("latitude"));
        port.setLongitude(rs.getBigDecimal("longitude"));
        port.setTotalBerths(rs.getInt("total_berths"));
        port.setMaxVesselSize(rs.getBigDecimal("max_vessel_size"));
        port.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return port;
    }
}
