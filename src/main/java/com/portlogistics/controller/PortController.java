package com.portlogistics.controller;

import com.portlogistics.model.Port;
import com.portlogistics.service.PortService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ports")
public class PortController {

    private final PortService portService;

    public PortController(PortService portService) {
        this.portService = portService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<Port> ports = portService.getAllPorts();
            return ResponseEntity.ok(ports);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            Port port = portService.getPortById(id);
            if (port == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(port);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            Port port = mapRequestToPort(request);
            portService.createPort(port);
            return ResponseEntity.ok(Map.of("success", true, "message", "港口创建成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> request) {
        try {
            Port port = mapRequestToPort(request);
            port.setPortId(id);
            portService.updatePort(port);
            return ResponseEntity.ok(Map.of("success", true, "message", "港口更新成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            portService.deletePort(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "港口已删除"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    private Port mapRequestToPort(Map<String, Object> request) {
        Port port = new Port();
        port.setPortCode((String) request.get("portCode"));
        port.setPortName((String) request.get("portName"));
        port.setCountry((String) request.get("country"));
        port.setCity((String) request.get("city"));
        port.setLatitude(portService.parseBigDecimal(getString(request.get("latitude"))));
        port.setLongitude(portService.parseBigDecimal(getString(request.get("longitude"))));
        port.setTotalBerths(parseInteger(request.get("totalBerths")));
        port.setMaxVesselSize(portService.parseBigDecimal(getString(request.get("maxVesselSize"))));
        return port;
    }

    private String getString(Object value) {
        if (value == null) return null;
        return value.toString();
    }

    private int parseInteger(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof String) {
            String str = (String) value;
            if (str.isEmpty()) return 0;
            return Integer.parseInt(str);
        }
        if (value instanceof Number) return ((Number) value).intValue();
        return 0;
    }
}
