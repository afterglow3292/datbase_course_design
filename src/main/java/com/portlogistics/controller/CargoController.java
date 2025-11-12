package com.portlogistics.controller;
import com.portlogistics.service.PortLogisticsService;
import org.springframework.web.bind.annotation.*;
import com.portlogistics.model.Cargo;
import java.util.List;
import java.sql.SQLException;

@RestController
@RequestMapping("/api/cargo")
public class CargoController {
    private final PortLogisticsService service;
    public CargoController(PortLogisticsService service) { this.service = service; }

    @GetMapping public List<Cargo> list() throws SQLException { return service.listPendingCargo(); }
    @PostMapping public void create(@RequestBody Cargo cargo) throws SQLException { service.assignCargoToShip(cargo.getId(),cargo.getShipId()); }
    
}
