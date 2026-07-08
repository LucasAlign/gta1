extends Area3D
class_name CropPlot

signal harvested(crop: CropDefinition)

enum CropPlotState { EMPTY, PLANTED, GROWING, HARVEST_READY }

@export var crop: CropDefinition
@export var visual_root_path: NodePath

var state: CropPlotState = CropPlotState.EMPTY
var watering_progress: int = 0
var current_visual: Node3D = null

func _ready() -> void:
	monitoring = true
	monitorable = true
	_refresh_visual()

func get_interaction_label() -> String:
	if crop == null:
		return "Garden"
	match state:
		CropPlotState.EMPTY:
			return "Plant %s" % crop.display_name
		CropPlotState.PLANTED, CropPlotState.GROWING:
			return "Water %s" % crop.display_name
		CropPlotState.HARVEST_READY:
			return "Pick %s" % crop.display_name
		_:
			return "Garden"

func can_interact(_interactor: Interactor) -> bool:
	return crop != null

func interact(_interactor: Interactor) -> void:
	match state:
		CropPlotState.EMPTY:
			plant()
		CropPlotState.PLANTED, CropPlotState.GROWING:
			water()
		CropPlotState.HARVEST_READY:
			harvest()

func plant() -> void:
	if crop == null or state != CropPlotState.EMPTY:
		return
	watering_progress = 0
	state = CropPlotState.PLANTED
	GameState.request_narration("A little seed is tucked into the soil.")
	_refresh_visual()

func water() -> void:
	if crop == null or state == CropPlotState.EMPTY or state == CropPlotState.HARVEST_READY:
		return
	watering_progress += 1
	state = CropPlotState.HARVEST_READY if watering_progress >= crop.watering_steps_to_harvest else CropPlotState.GROWING
	GameState.request_narration("Water makes the garden grow.")
	_refresh_visual()

func harvest() -> void:
	if crop == null or state != CropPlotState.HARVEST_READY:
		return
	GameState.award_helping_stars(crop.helping_stars_on_harvest)
	GameState.remember_harvest(crop)
	harvested.emit(crop)
	watering_progress = 0
	state = CropPlotState.EMPTY
	GameState.request_narration("The carrot is picked. Great helping.")
	_refresh_visual()

func _refresh_visual() -> void:
	if current_visual != null:
		current_visual.queue_free()
		current_visual = null
	var root := _visual_root()
	current_visual = _make_placeholder_visual()
	if current_visual != null:
		root.add_child(current_visual)

func _visual_root() -> Node3D:
	if visual_root_path != NodePath("") and has_node(visual_root_path):
		return get_node(visual_root_path) as Node3D
	return self

func _make_placeholder_visual() -> Node3D:
	if state == CropPlotState.EMPTY:
		return null
	var mesh_instance := MeshInstance3D.new()
	var mesh := CapsuleMesh.new()
	mesh.radius = 0.12 if state != CropPlotState.HARVEST_READY else 0.2
	mesh.height = 0.55 if state != CropPlotState.HARVEST_READY else 0.8
	mesh_instance.mesh = mesh
	mesh_instance.position = Vector3(0, 0.3, 0)
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.2, 0.75, 0.25) if state != CropPlotState.HARVEST_READY else Color(1.0, 0.45, 0.12)
	mesh_instance.material_override = material
	return mesh_instance
