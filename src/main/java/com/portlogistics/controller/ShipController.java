package com.portlogistics.controller;

import com.portlogistics.model.Ship;
import com.portlogistics.service.PortLogisticsService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/ships")
public class ShipController {
    private final PortLogisticsService service;

    public ShipController(PortLogisticsService service) {
        this.service = service;
    }

    @GetMapping
    public List<Ship> list(@RequestParam(value = "q", required = false) String keyword) throws SQLException {
        return service.listShips(keyword);
    }

    @PostMapping
    public void create(@RequestBody Ship ship) throws SQLException {
        service.registerShipArrival(ship);
    }

    @PutMapping("/{shipId}")
    public void update(@PathVariable int shipId, @RequestBody Ship ship) throws SQLException {
        service.updateShip(shipId, ship);
    }

    @DeleteMapping("/{shipId}")
    public void delete(@PathVariable int shipId) {
        try {
            service.deleteShip(shipId);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "该船舶存在关联的货物或泊位记录，请先解除关联后再删除。",
                    e
            );
        }
    }
}
