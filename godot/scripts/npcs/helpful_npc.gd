extends Area3D
class_name HelpfulNpc

@export var character_name: String = "Neighbor"
@export var job: Resource
@export var linked_crop_plot_path: NodePath

var has_thanked_player := false

func _ready() -> void:
	monitoring = true
	monitorable = true
	var plot := _linked_crop_plot()
	if plot != null:
		plot.harvested.connect(_on_crop_harvested)

func get_interaction_label() -> String:
	if GameState.is_job_complete(job):
		return "Say hi"
	return "Talk to %s" % character_name

func can_interact(_interactor: Node) -> bool:
	return job != null

func interact(_interactor: Node) -> void:
	if job == null:
		GameState.request_narration("Let's help today.")
		return
	GameState.request_narration(job.narration_prompt)

func _on_crop_harvested(_crop: Resource) -> void:
	if has_thanked_player or job == null:
		return
	has_thanked_player = true
	GameState.request_narration("Thank you for helping the garden grow.")
	GameState.complete_job(job)

func _linked_crop_plot() -> Node:
	if linked_crop_plot_path == NodePath("") or not has_node(linked_crop_plot_path):
		return null
	return get_node(linked_crop_plot_path)
