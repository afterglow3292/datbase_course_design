package com.portlogistics.controller;
import com.portlogistics.service.PortLogisticsService;
import org.springframework.web.bind.annotation.*;
import com.portlogistics.model.Ship;
import java.util.List;
import java.sql.SQLException;

@RestController
@RequestMapping("/api/ships")
public class ShipController {
    private final PortLogisticsService service;
    public ShipController(PortLogisticsService service) { this.service = service; }

    @GetMapping public List<Ship> list() throws SQLException { return service.listShips(); }
    @PostMapping public void create(@RequestBody Ship ship) throws SQLException { service.registerShipArrival(ship); }
    
}
