extends Resource
class_name VehicleDefinition

@export var id: String = "vehicle.tractor.starter"
@export var display_name: String = "Starter Tractor"
@export_enum("Farm", "TownService", "Construction", "Beach", "Forest") var category: String = "Farm"
@export var max_speed: float = 6.0
@export var acceleration: float = 8.0
@export var turn_speed: float = 90.0
@export var can_reverse: bool = true
@export var interaction_tags: Array[String] = ["drive"]
@export var attachment_slots: Array[String] = ["rear"]
