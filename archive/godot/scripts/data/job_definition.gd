extends Resource
class_name JobDefinition

@export var id: String = "job.farm.first_harvest"
@export var display_name: String = "First Harvest"
@export_enum("Farming", "Delivery", "Cleanup", "Rescue", "Construction") var type: String = "Farming"
@export_multiline var narration_prompt: String = "Let's help the garden grow."
@export_range(0, 20, 1) var helping_stars_reward: int = 1
@export var required_interaction_tags: Array[String] = ["plant", "water", "harvest"]
@export var unlocks_on_complete: Array[String] = []
