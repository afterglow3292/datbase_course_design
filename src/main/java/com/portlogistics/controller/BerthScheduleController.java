package com.portlogistics.controller;
import com.portlogistics.service.PortLogisticsService;
import org.springframework.web.bind.annotation.*;
import com.portlogistics.model.BerthSchedule;
import java.util.List;
import java.sql.SQLException;

@RestController
@RequestMapping("/api/berths")
public class BerthScheduleController {

    private final PortLogisticsService service;
    public BerthScheduleController(PortLogisticsService service) { this.service = service; }

    @GetMapping public List<BerthSchedule> list() throws SQLException { return service.listUpcomingSchedules(); }
    @PostMapping public void create(@RequestBody BerthSchedule schedule) throws SQLException { service.scheduleBerth(schedule);}
    

}
