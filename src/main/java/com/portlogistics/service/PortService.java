package com.portlogistics.service;

import com.portlogistics.model.Port;
import com.portlogistics.repository.PortRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

@Service
public class PortService {
    private final PortRepository portRepository;

    public PortService(PortRepository portRepository) {
        this.portRepository = portRepository;
    }

    public List<Port> getAllPorts() throws SQLException {
        return portRepository.findAll();
    }

    public Port getPortById(int portId) throws SQLException {
        return portRepository.findById(portId);
    }

    public void createPort(Port port) throws SQLException {
        validatePort(port, 0);
        portRepository.save(port);
    }

    public void updatePort(Port port) throws SQLException {
        validatePort(port, port.getPortId());
        portRepository.update(port);
    }

    public void deletePort(int portId) throws SQLException {
        portRepository.deleteById(portId);
    }

    private void validatePort(Port port, int excludeId) throws SQLException {
        // 验证港口代码
        if (port.getPortCode() == null || port.getPortCode().trim().isEmpty()) {
            throw new IllegalArgumentException("港口代码不能为空");
        }
        // 检查港口代码是否重复
        if (portRepository.isPortCodeExists(port.getPortCode().trim(), excludeId)) {
            throw new IllegalArgumentException("港口代码已存在");
        }
        // 验证港口名称
        if (port.getPortName() == null || port.getPortName().trim().isEmpty()) {
            throw new IllegalArgumentException("港口名称不能为空");
        }
        // 验证国家
        if (port.getCountry() == null || port.getCountry().trim().isEmpty()) {
            throw new IllegalArgumentException("国家不能为空");
        }
        // 验证泊位数量
        if (port.getTotalBerths() < 0) {
            throw new IllegalArgumentException("泊位数量不能为负数");
        }
        // 验证经纬度范围
        if (port.getLatitude() != null) {
            if (port.getLatitude().compareTo(new BigDecimal("-90")) < 0 || 
                port.getLatitude().compareTo(new BigDecimal("90")) > 0) {
                throw new IllegalArgumentException("纬度必须在-90到90之间");
            }
        }
        if (port.getLongitude() != null) {
            if (port.getLongitude().compareTo(new BigDecimal("-180")) < 0 || 
                port.getLongitude().compareTo(new BigDecimal("180")) > 0) {
                throw new IllegalArgumentException("经度必须在-180到180之间");
            }
        }
    }

    public BigDecimal parseBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("数值格式错误：" + value);
        }
    }
}
