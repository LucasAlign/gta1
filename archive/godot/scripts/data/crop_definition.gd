extends Resource
class_name CropDefinition

@export var id: String = "crop.carrot"
@export var display_name: String = "Carrot"
@export_range(1, 10, 1) var watering_steps_to_harvest: int = 2
@export_range(0, 20, 1) var helping_stars_on_harvest: int = 1
@export var seedling_scene: PackedScene
@export var growing_scene: PackedScene
@export var harvest_ready_scene: PackedScene
