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

    public List<Ship> listShips(String keyword) throws SQLException {
        if (keyword != null && !keyword.isBlank()) {
            return shipRepository.searchByKeyword(keyword.trim());
        }
        return shipRepository.findAll();
    }

    public void registerShipArrival(Ship ship) throws SQLException {
        shipRepository.save(ship);
    }

    public List<Cargo> listPendingCargo(String keyword) throws SQLException {
        if (keyword != null && !keyword.isBlank()) {
            return cargoRepository.searchByKeyword(keyword.trim());
        }
        return cargoRepository.findPendingCargo();
    }

    public void createCargo(Cargo cargo) throws SQLException {
        cargoRepository.save(cargo);
        if (cargo.getShipId() != null) {
            shipRepository.updateStatus(cargo.getShipId(), "LOADING");
        }
    }

    public void updateCargo(int cargoId, Cargo cargo) throws SQLException {
        cargoRepository.update(cargoId, cargo);
    }

    public void deleteCargo(int cargoId) throws SQLException {
        cargoRepository.delete(cargoId);
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
    public void updateShip(int shipId, Ship ship) throws SQLException {
        shipRepository.update(shipId, ship);
    }

    public void deleteShip(int shipId) throws SQLException {
        shipRepository.delete(shipId);
    }

}
