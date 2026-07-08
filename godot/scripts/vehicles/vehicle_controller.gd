extends Area3D
class_name VehicleController

@export var definition: VehicleDefinition
@export var seat_path: NodePath
@export var exit_path: NodePath

var driver: Node3D = null
var move_input := Vector2.ZERO

func _ready() -> void:
	monitoring = true
	monitorable = true

func _physics_process(delta: float) -> void:
	if driver == null or definition == null:
		return
	var drive := move_input.y
	if not definition.can_reverse:
		drive = maxf(drive, 0.0)
	rotate_y(deg_to_rad(-move_input.x * definition.turn_speed * delta))
	global_position += -global_transform.basis.z * drive * definition.max_speed * delta
	if _seat() != null:
		driver.global_transform = _seat().global_transform

func set_input(input: Vector2) -> void:
	move_input = input.limit_length(1.0)

func get_interaction_label() -> String:
	if definition == null:
		return "Ride"
	return "Drive %s" % definition.display_name

func can_interact(_interactor: Interactor) -> bool:
	return definition != null and driver == null

func interact(interactor: Interactor) -> void:
	mount(interactor.get_parent() as Node3D)

func mount(rider: Node3D) -> void:
	if rider == null:
		return
	driver = rider
	if _seat() != null:
		rider.global_transform = _seat().global_transform
	GameState.request_narration("The tractor is ready to roll.")

func dismount() -> void:
	if driver == null:
		return
	var exit_position := global_position + global_transform.basis.x * 1.7
	if _exit() != null:
		exit_position = _exit().global_position
	driver.global_position = exit_position
	driver = null
	move_input = Vector2.ZERO

func _seat() -> Node3D:
	if seat_path != NodePath("") and has_node(seat_path):
		return get_node(seat_path) as Node3D
	return null

func _exit() -> Node3D:
	if exit_path != NodePath("") and has_node(exit_path):
		return get_node(exit_path) as Node3D
	return null
