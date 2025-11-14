package com.portlogistics.controller;

import com.portlogistics.model.Cargo;
import com.portlogistics.service.PortLogisticsService;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/cargo")
public class CargoController {
    private final PortLogisticsService service;

    public CargoController(PortLogisticsService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cargo> list() throws SQLException {
        return service.listPendingCargo();
    }

    @PostMapping
    public void create(@RequestBody Cargo cargo) throws SQLException {
        service.createCargo(cargo);
    }
}
