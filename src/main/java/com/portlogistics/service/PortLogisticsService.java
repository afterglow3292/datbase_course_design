package com.portlogistics.service;
import org.springframework.stereotype.Service;

import com.portlogistics.model.BerthSchedule;
import com.portlogistics.model.Cargo;
import com.portlogistics.model.Ship;
import com.portlogistics.repository.BerthScheduleRepository;
import com.portlogistics.repository.CargoRepository;
import com.portlogistics.repository.ShipRepository;

import java.sql.SQLException;
import java.util.List;

@Service
public class PortLogisticsService {
    private final ShipRepository shipRepository;
    private final CargoRepository cargoRepository;
    private final BerthScheduleRepository berthScheduleRepository;

    public PortLogisticsService(ShipRepository shipRepository,CargoRepository cargoRepository,BerthScheduleRepository berthScheduleRepository) {
        this.shipRepository = shipRepository;
        this.cargoRepository = cargoRepository;
        this.berthScheduleRepository = berthScheduleRepository;
    }

    public List<Ship> listShips() throws SQLException {
        return shipRepository.findAll();
    }

    public void registerShipArrival(Ship ship) throws SQLException {
        shipRepository.save(ship);
    }

    public List<Cargo> listPendingCargo() throws SQLException {
        return cargoRepository.findPendingCargo();
    }

    public void assignCargoToShip(int cargoId, int shipId) throws SQLException {
        cargoRepository.assignToShip(cargoId, shipId);
        shipRepository.updateStatus(shipId, "LOADING");
    }

    public void scheduleBerth(BerthSchedule schedule) throws SQLException {
        berthScheduleRepository.save(schedule);
    }

    public List<BerthSchedule> listUpcomingSchedules() throws SQLException {
        return berthScheduleRepository.findUpcomingSchedules();
    }
}
