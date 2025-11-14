package com.portlogistics.model;

import java.util.Objects;

public class Cargo {
    private int id;
    private String description;
    private double weight;
    private String destination;
    private Integer shipId;

    public Cargo() {
    }

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

    public void setId(int id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Integer getShipId() {
        return shipId;
    }

    public void setShipId(Integer shipId) {
        this.shipId = shipId;
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
