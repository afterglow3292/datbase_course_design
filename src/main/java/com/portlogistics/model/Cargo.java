package com.portlogistics.model;

import java.util.Objects;

public final class Cargo {
    private final int id;
    private final String description;
    private final double weight;
    private final String destination;
    private final Integer shipId;

    public Cargo(int id, String description, double weight, String destination, Integer shipId) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.destination = destination;
        this.shipId = shipId;
    }

    public int getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public double getWeight() {
        return weight;
    }

    public String getDestination() {
        return destination;
    }

    public Integer getShipId() {
        return shipId;
    }

    public boolean isAssigned() {
        return shipId != null;
    }

    public Cargo assignToShip(int newShipId) {
        return new Cargo(id, description, weight, destination, newShipId);
    }

    @Override
    public String toString() {
        String shipInfo = shipId == null ? "unassigned" : "ship=" + shipId;
        return "Cargo{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", weight=" + weight +
                ", destination='" + destination + '\'' +
                ", " + shipInfo +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Cargo cargo)) {
            return false;
        }
        return id == cargo.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
